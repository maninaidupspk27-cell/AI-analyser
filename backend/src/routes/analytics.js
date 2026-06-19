const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const analyticsController = require('../controllers/analyticsController');

router.get('/', protect, analyticsController.getAnalytics);

module.exports = router;
