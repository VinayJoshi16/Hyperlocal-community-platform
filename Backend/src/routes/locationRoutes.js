// Location routes. All routes require authentication - you must be logged in
// to set or view location data.

const express = require('express');
const router = express.Router();

const {
  setUserLocation,
  getMyLocations,
  getChildren,
  searchLocations,
  joinLocation,
} = require('../controllers/locationController');
const { authMiddleware } = require('../middleware/authMiddleware');

// All location routes require a valid JWT
router.use(authMiddleware);

// ─── Routes ──────────────────────────────────────────────────────────────────

// Set user location from GPS coordinates (lat/lng)
// Called right after login if user has no location set yet
router.post('/set', setUserLocation);

// Get all location levels the current user belongs to
router.get('/mine', getMyLocations);

// Search locations by name (powers the manual location picker)
// GET /api/location/search?q=dehradun
router.get('/search', searchLocations);

// Get direct children of a location node
// e.g. GET /api/location/:id/children -> all areas inside a city
router.get('/:id/children', getChildren);

// Manually join a specific society by ID
router.post('/join/:id', joinLocation);

module.exports = router;