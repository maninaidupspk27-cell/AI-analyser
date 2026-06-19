const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const generationController = require('../controllers/generationController');

// All generation routes are protected
router.use(protect);

router.post('/', generationController.createGeneration);
router.get('/', generationController.getGenerations);
router.put('/:id/rate', generationController.rateGeneration);
router.post('/:id/email', generationController.emailGeneration);

module.exports = router;
