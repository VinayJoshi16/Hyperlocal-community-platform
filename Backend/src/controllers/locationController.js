// Location route handlers.
// Handles resolving GPS coordinates into the hierarchy, assigning users to
// communities, and browsing the location tree.

const locationModel = require('../models/locationModel');
const { query } = require('../config/db');
const { setLocationSchema } = require('../utils/validators');
const { asyncHandler, ok, fail } = require('../utils/helpers');

// POST /api/location/set
// Receives lat/lng from client, resolves it to the full hierarchy
// (society -> area -> city -> state -> country), and enrolls the user
// in every level they belong to.
const setUserLocation = asyncHandler(async (req, res) => {
  const { lat, lng } = setLocationSchema.parse(req.body);
  const userId = req.user.id;

  const hierarchy = await locationModel.resolveHierarchyFromPoint(lat, lng);

  if (hierarchy.length === 0) {
    return fail(
      res,
      'Could not resolve your location. Your area may not be mapped yet. Please try selecting manually.',
      404
    );
  }

  // Remove any existing location memberships for this user, then re-enroll
  await query('DELETE FROM user_locations WHERE user_id = $1', [userId]);

  for (let i = 0; i < hierarchy.length; i++) {
    const location = hierarchy[i];
    const isPrimary = i === 0; // most specific level (society or area) is primary
    await query(
      `INSERT INTO user_locations (user_id, location_id, is_primary)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, location_id) DO UPDATE SET is_primary = $3`,
      [userId, location.id, isPrimary]
    );
  }

  return ok(res, {
    message: 'Location set successfully.',
    hierarchy: hierarchy.map((l) => ({
      id: l.id,
      name: l.name,
      type: l.type,
    })),
  });
});

// POST /api/location/resolve-gps
// Public endpoint to resolve lat/lng coordinates to a hierarchy node.
const resolveGps = asyncHandler(async (req, res) => {
  const { lat, lng } = setLocationSchema.parse(req.body);
  const hierarchy = await locationModel.resolveHierarchyFromPoint(lat, lng);

  if (hierarchy.length === 0) {
    return fail(
      res,
      'Could not resolve your location. Your area may not be mapped yet. Please try selecting manually.',
      404
    );
  }

  return ok(res, {
    hierarchy: hierarchy.map((l) => ({
      id: l.id,
      name: l.name,
      type: l.type,
    })),
  });
});

// GET /api/location/mine
// Returns all location levels the current user is enrolled in.
const getMyLocations = asyncHandler(async (req, res) => {
  let result = await query(
    `SELECT l.id, l.name, l.type, ul.is_primary, ul.joined_at
     FROM user_locations ul
     JOIN locations l ON l.id = ul.location_id
     WHERE ul.user_id = $1
     ORDER BY
       CASE l.type
         WHEN 'society' THEN 1
         WHEN 'area'    THEN 2
         WHEN 'city'    THEN 3
         WHEN 'state'   THEN 4
         WHEN 'country' THEN 5
       END`,
    [req.user.id]
  );

  // Fail-safe: If the user has a primary society linked but parent levels are missing,
  // walk up the hierarchy and auto-join them in user_locations.
  const primaryLoc = result.rows.find(r => r.is_primary);
  const cityLoc = result.rows.find(r => r.type === 'city');

  if (primaryLoc && !cityLoc) {
    let currentLocId = primaryLoc.id;
    while (currentLocId) {
      const locRes = await query('SELECT id, parent_id FROM locations WHERE id = $1', [currentLocId]);
      if (locRes.rows.length === 0) break;
      
      const isPrimary = (currentLocId === primaryLoc.id);
      await query(
        `INSERT INTO user_locations (user_id, location_id, is_primary)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id, location_id) DO UPDATE SET is_primary = $3`,
        [req.user.id, currentLocId, isPrimary]
      );
      
      currentLocId = locRes.rows[0].parent_id;
    }

    // Re-query locations to return the full set
    result = await query(
      `SELECT l.id, l.name, l.type, ul.is_primary, ul.joined_at
       FROM user_locations ul
       JOIN locations l ON l.id = ul.location_id
       WHERE ul.user_id = $1
       ORDER BY
         CASE l.type
           WHEN 'society' THEN 1
           WHEN 'area'    THEN 2
           WHEN 'city'    THEN 3
           WHEN 'state'   THEN 4
           WHEN 'country' THEN 5
         END`,
      [req.user.id]
    );
  }

  return ok(res, { locations: result.rows });
});

// GET /api/location/:id/children
// Returns the direct children of a location node (e.g. all cities inside a state).
const getChildren = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const parent = await locationModel.findById(id);

  if (!parent) {
    return fail(res, 'Location not found.', 404);
  }

  const children = await locationModel.getChildren(id);
  return ok(res, { parent, children });
});

// GET /api/location/search?q=name
// Simple name-based search across all locations (for manual location picking).
const searchLocations = asyncHandler(async (req, res) => {
  const q = (req.query.q || '').trim();

  if (q.length < 2) {
    return fail(res, 'Search query must be at least 2 characters.', 400);
  }

  const result = await query(
    `SELECT id, name, type, parent_id
     FROM locations
     WHERE name ILIKE $1
     ORDER BY
       CASE type
         WHEN 'society' THEN 1
         WHEN 'area'    THEN 2
         WHEN 'city'    THEN 3
         WHEN 'state'   THEN 4
         WHEN 'country' THEN 5
       END, name
     LIMIT 20`,
    [`%${q}%`]
  );

  return ok(res, { results: result.rows });
});

// POST /api/location/join/:id
// Lets a user manually join a specific society by its ID.
const joinLocation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const location = await locationModel.findById(id);
  if (!location) return fail(res, 'Location not found.', 404);

  if (location.type !== 'society') {
    return fail(res, 'You can only directly join a society. Higher levels are auto-assigned.', 400);
  }

  await query(
    `INSERT INTO user_locations (user_id, location_id, is_primary)
     VALUES ($1, $2, true)
     ON CONFLICT (user_id, location_id) DO NOTHING`,
    [userId, id]
  );

  return ok(res, {
    message: `You have joined ${location.name}.`,
    location: { id: location.id, name: location.name, type: location.type },
  });
});

const updatePrimaryLocation = asyncHandler(async (req, res) => {
  const { locationId } = req.body;
  if (!locationId) return fail(res, 'locationId is required.', 400);

  const location = await locationModel.findById(locationId);
  if (!location) return fail(res, 'Location not found.', 404);

  const userId = req.user.id;

  // Clear existing location memberships for this user, then rebuild hierarchy
  await query('DELETE FROM user_locations WHERE user_id = $1', [userId]);

  let currentLocId = locationId;
  while (currentLocId) {
    const locRes = await query('SELECT id, parent_id, name, type FROM locations WHERE id = $1', [currentLocId]);
    if (locRes.rows.length === 0) break;

    const isPrimary = (currentLocId === locationId);
    await query(
      `INSERT INTO user_locations (user_id, location_id, is_primary)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, location_id) DO UPDATE SET is_primary = $3`,
      [userId, currentLocId, isPrimary]
    );

    currentLocId = locRes.rows[0].parent_id;
  }

  // Fetch updated location list to return to frontend
  const updatedLocations = await query(
    `SELECT l.id, l.name, l.type, ul.is_primary, ul.joined_at
     FROM user_locations ul
     JOIN locations l ON l.id = ul.location_id
     WHERE ul.user_id = $1
     ORDER BY
       CASE l.type
         WHEN 'society' THEN 1
         WHEN 'area'    THEN 2
         WHEN 'city'    THEN 3
         WHEN 'state'   THEN 4
         WHEN 'country' THEN 5
       END`,
    [userId]
  );

  return ok(res, {
    message: 'Primary location updated successfully.',
    locations: updatedLocations.rows,
  });
});

module.exports = {
  setUserLocation,
  getMyLocations,
  getChildren,
  searchLocations,
  joinLocation,
  resolveGps,
  updatePrimaryLocation,
};