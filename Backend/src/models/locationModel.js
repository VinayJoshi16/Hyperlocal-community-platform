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

  if (pointMatch.rows.length > 0) {
    return walkUpHierarchy(pointMatch.rows[0]);
  }

  // If no boundary matched, reverse-geocode using OpenStreetMap Nominatim
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      }
    );
    const data = await response.json();

    if (data && data.address) {
      const countryName = data.address.country || 'India';
      const stateName = data.address.state || data.address.state_district || 'Maharashtra';
      const cityName = data.address.city || data.address.town || data.address.village || data.address.suburb || 'Mumbai';
      const areaName = data.address.neighbourhood || data.address.suburb || data.address.residential || cityName;

      // Ensure hierarchy levels exist in locations database table
      
      // A. Country
      let country = await query("SELECT * FROM locations WHERE name = $1 AND type = 'country'", [countryName]);
      if (country.rows.length === 0) {
        const insert = await query(
          `INSERT INTO locations (name, type, centroid)
           VALUES ($1, 'country', ST_SetSRID(ST_Point($2, $3), 4326)::geography)
           RETURNING *`,
          [countryName, lng, lat]
        );
        country = insert;
      }
      const countryId = country.rows[0].id;

      // B. State
      let state = await query("SELECT * FROM locations WHERE name = $1 AND type = 'state' AND parent_id = $2", [stateName, countryId]);
      if (state.rows.length === 0) {
        const insert = await query(
          `INSERT INTO locations (parent_id, name, type, centroid)
           VALUES ($1, $2, 'state', ST_SetSRID(ST_Point($3, $4), 4326)::geography)
           RETURNING *`,
          [countryId, stateName, lng, lat]
        );
        state = insert;
      }
      const stateId = state.rows[0].id;

      // C. City
      let city = await query("SELECT * FROM locations WHERE name = $1 AND type = 'city' AND parent_id = $2", [cityName, stateId]);
      if (city.rows.length === 0) {
        const insert = await query(
          `INSERT INTO locations (parent_id, name, type, centroid)
           VALUES ($1, $2, 'city', ST_SetSRID(ST_Point($3, $4), 4326)::geography)
           RETURNING *`,
          [stateId, cityName, lng, lat]
        );
        city = insert;
      }
      const cityId = city.rows[0].id;

      // D. Area
      let area = await query("SELECT * FROM locations WHERE name = $1 AND type = 'area' AND parent_id = $2", [areaName, cityId]);
      if (area.rows.length === 0) {
        const insert = await query(
          `INSERT INTO locations (parent_id, name, type, centroid)
           VALUES ($1, $2, 'area', ST_SetSRID(ST_Point($3, $4), 4326)::geography)
           RETURNING *`,
          [cityId, areaName, lng, lat]
        );
        area = insert;
      }
      const areaId = area.rows[0].id;

      // E. Default Society under this area
      const societyName = `${areaName} Residents Association`;
      let society = await query("SELECT * FROM locations WHERE name = $1 AND type = 'society' AND parent_id = $2", [societyName, areaId]);
      if (society.rows.length === 0) {
        const insert = await query(
          `INSERT INTO locations (parent_id, name, type, centroid)
           VALUES ($1, $2, 'society', ST_SetSRID(ST_Point($3, $4), 4326)::geography)
           RETURNING *`,
          [areaId, societyName, lng, lat]
        );
        society = insert;
      }

      return walkUpHierarchy(society.rows[0]);
    }
  } catch (err) {
    console.error('Nominatim Geocoding Failed:', err.message);
  }

  // Fallback to nearest city if geocoding failed/offline
  const nearest = await query(
    `SELECT * FROM locations
     WHERE type = 'city' AND centroid IS NOT NULL
     ORDER BY centroid <-> ST_SetSRID(ST_Point($1, $2), 4326)::geography
     LIMIT 1`,
    [lng, lat]
  );
  if (nearest.rows.length > 0) {
    return walkUpHierarchy(nearest.rows[0]);
  }

  // Final Fallback: If Nominatim fails and there are no seeded locations,
  // automatically create a default Sandbox hierarchy so registration never breaks.
  console.log('Database empty and Nominatim failed. Creating default sandbox hierarchy...');
  
  const defCountry = 'India';
  const defState = 'Maharashtra';
  const defCity = 'Mumbai';
  const defArea = 'Bandra West';
  const defSociety = 'Garden City Society';

  // 1. Country
  let country = await query("SELECT * FROM locations WHERE name = $1 AND type = 'country'", [defCountry]);
  if (country.rows.length === 0) {
    country = await query(
      `INSERT INTO locations (name, type, centroid)
       VALUES ($1, 'country', ST_SetSRID(ST_Point($2, $3), 4326)::geography)
       RETURNING *`,
      [defCountry, lng, lat]
    );
  }
  const countryId = country.rows[0].id;

  // 2. State
  let state = await query("SELECT * FROM locations WHERE name = $1 AND type = 'state' AND parent_id = $2", [defState, countryId]);
  if (state.rows.length === 0) {
    state = await query(
      `INSERT INTO locations (parent_id, name, type, centroid)
       VALUES ($1, $2, 'state', ST_SetSRID(ST_Point($3, $4), 4326)::geography)
       RETURNING *`,
      [countryId, defState, lng, lat]
    );
  }
  const stateId = state.rows[0].id;

  // 3. City
  let city = await query("SELECT * FROM locations WHERE name = $1 AND type = 'city' AND parent_id = $2", [defCity, stateId]);
  if (city.rows.length === 0) {
    city = await query(
      `INSERT INTO locations (parent_id, name, type, centroid)
       VALUES ($1, $2, 'city', ST_SetSRID(ST_Point($3, $4), 4326)::geography)
       RETURNING *`,
      [stateId, defCity, lng, lat]
    );
  }
  const cityId = city.rows[0].id;

  // 4. Area
  let area = await query("SELECT * FROM locations WHERE name = $1 AND type = 'area' AND parent_id = $2", [defArea, cityId]);
  if (area.rows.length === 0) {
    area = await query(
      `INSERT INTO locations (parent_id, name, type, centroid)
       VALUES ($1, $2, 'area', ST_SetSRID(ST_Point($3, $4), 4326)::geography)
       RETURNING *`,
      [cityId, defArea, lng, lat]
    );
  }
  const areaId = area.rows[0].id;

  // 5. Society
  let society = await query("SELECT * FROM locations WHERE name = $1 AND type = 'society' AND parent_id = $2", [defSociety, areaId]);
  if (society.rows.length === 0) {
    society = await query(
      `INSERT INTO locations (parent_id, name, type, centroid)
       VALUES ($1, $2, 'society', ST_SetSRID(ST_Point($3, $4), 4326)::geography)
       RETURNING *`,
      [areaId, defSociety, lng, lat]
    );
  }

  return walkUpHierarchy(society.rows[0]);
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