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
  resolveGps,
  updatePrimaryLocation,
} = require('../controllers/locationController');
const { authMiddleware } = require('../middleware/authMiddleware');

// ─── Public routes (no JWT required) ─────────────────────────────────────────

// Resolve GPS coordinates (lat/lng) to locations hierarchy
router.post('/resolve-gps', resolveGps);

// Search locations by name manual picker
router.get('/search', searchLocations);

// ─── Protected routes (JWT required) ─────────────────────────────────────────
router.use(authMiddleware);

// Set user location from GPS coordinates (lat/lng)
router.post('/set', setUserLocation);

// Get all location levels the current user belongs to
router.get('/mine', getMyLocations);

// Get direct children of a location node
router.get('/:id/children', getChildren);

// Manually join a specific society by ID
router.post('/join/:id', joinLocation);

// Update user's primary location manually
router.post('/update-primary', updatePrimaryLocation);

module.exports = router;