const express = require('express');
const { getUsers, getEnrollmentsAndStats } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// Protected admin audit endpoints
router.get('/users', protect, admin, getUsers);
router.get('/enrollments', protect, admin, getEnrollmentsAndStats);

module.exports = router;

