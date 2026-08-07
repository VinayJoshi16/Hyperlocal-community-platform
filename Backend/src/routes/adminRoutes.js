const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const { adminMiddleware } = require('../middleware/adminMiddleware');
const {
  getDashboardStats,
  getUsers,
  toggleBlockUser,
  getPosts,
  moderatePost,
  getLocations,
  createAdminPost
} = require('../controllers/adminController');

// All routes here require the user to be logged in and be the master admin
router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/dashboard', getDashboardStats);

router.get('/users', getUsers);
router.patch('/users/:id/block', toggleBlockUser);

router.get('/posts', getPosts);
router.post('/posts', createAdminPost);
router.patch('/posts/:id/moderate', moderatePost);

router.get('/locations', getLocations);

module.exports = router;
