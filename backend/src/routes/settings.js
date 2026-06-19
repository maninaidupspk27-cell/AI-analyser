const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { protect, restrictTo } = require('../middleware/auth');

// All settings routes require user authentication protection
router.use(protect);

// GET /api/settings - Read settings parameters
router.get('/', getSettings);

// POST /api/settings - Modify settings parameters (restricted to ADMIN)
router.post('/', restrictTo('ADMIN'), updateSettings);

module.exports = router;
