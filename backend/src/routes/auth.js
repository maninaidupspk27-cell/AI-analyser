const express = require('express');
const router = express.Router();
const { login, getProfile, loginSchema } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');

// Public route: handles JWT token signature generation
router.post('/login', validateBody(loginSchema), login);

// Protected route: requires valid Authorization Bearer token header
router.get('/profile', protect, getProfile);

module.exports = router;
