const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const billingController = require('../controllers/billingController');

router.post('/checkout', protect, billingController.createCheckoutSession);
router.post('/mock-webhook', protect, billingController.mockWebhook);

module.exports = router;
