const express = require('express');
const router = express.Router();
const { getRecommendations, generateRecommendations } = require('../controllers/recommendationController');
const { getRecommendationHistory } = require('../controllers/historyController');
const { protect, restrictTo } = require('../middleware/auth');

// All endpoints inside recommendation scope require authentication
router.use(protect);

// GET /api/recommendations - Fetches latest AI advice profiles
router.get('/', getRecommendations);

// GET /api/recommendations/history - Fetches historical AI advice records
router.get('/history', getRecommendationHistory);

// POST /api/recommendations/generate - Secure regeneration for admin operators
router.post('/generate', restrictTo('ADMIN'), generateRecommendations);

module.exports = router;
