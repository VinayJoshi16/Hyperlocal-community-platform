// All direct SQL for the locations table and the self-referential hierarchy.

const { query } = require('../config/db');

async function findById(id) {
  const res = await query('SELECT * FROM locations WHERE id = $1', [id]);
  return res.rows[0] || null;
}

// Finds the most specific location (society, if any) that contains a GPS point,
// then walks up parent_id to return every ancestor: society -> area -> city -> state -> country.
async function resolveHierarchyFromPoint(lat, lng) {
  const pointMatch = await query(
    `SELECT * FROM locations
     WHERE boundary IS NOT NULL
       AND ST_Contains(boundary::geometry, ST_SetSRID(ST_Point($1, $2), 4326))
     ORDER BY
       CASE type
         WHEN 'society' THEN 1
         WHEN 'area' THEN 2
         WHEN 'city' THEN 3
         WHEN 'state' THEN 4
         WHEN 'country' THEN 5
       END
     LIMIT 1`,
    [lng, lat]
  );

  if (pointMatch.rows.length === 0) {
    const nearest = await query(
      `SELECT * FROM locations
       WHERE type = 'city' AND centroid IS NOT NULL
       ORDER BY centroid <-> ST_SetSRID(ST_Point($1, $2), 4326)::geography
       LIMIT 1`,
      [lng, lat]
    );
    if (nearest.rows.length === 0) return [];
    return walkUpHierarchy(nearest.rows[0]);
  }

  return walkUpHierarchy(pointMatch.rows[0]);
}

async function walkUpHierarchy(startLocation) {
  const chain = [startLocation];
  let current = startLocation;

  while (current.parent_id) {
    const parentRes = await query('SELECT * FROM locations WHERE id = $1', [current.parent_id]);
    if (parentRes.rows.length === 0) break;
    current = parentRes.rows[0];
    chain.push(current);
  }

  return chain;
}

async function createLocation({ parentId, name, type, lat, lng }) {
  const res = await query(
    `INSERT INTO locations (parent_id, name, type, centroid)
     VALUES ($1, $2, $3, ST_SetSRID(ST_Point($4, $5), 4326)::geography)
     RETURNING *`,
    [parentId || null, name, type, lng, lat]
  );
  return res.rows[0];
}

async function getChildren(locationId) {
  const res = await query('SELECT * FROM locations WHERE parent_id = $1 ORDER BY name', [locationId]);
  return res.rows;
}

module.exports = {
  findById,
  resolveHierarchyFromPoint,
  createLocation,
  getChildren,
};