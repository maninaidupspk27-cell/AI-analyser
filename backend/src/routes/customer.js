const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer, submitFeedback, getAnalytics, feedbackSchema } = require('../controllers/customerController');
const { getUploadHistory } = require('../controllers/historyController');
const { uploadCSV, validateCSV } = require('../controllers/csvController');
const { protect, restrictTo } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');

// Setup multer memory storage for CSV buffers
const upload = multer({ storage: multer.memoryStorage() });

// All endpoints inside customer scope require authentication protection
router.use(protect);

// GET /api/customers - Retrieves list matching query filters
router.get('/', getCustomers);

// POST /api/customers - Creates a new customer (Admin or Sales)
router.post('/', restrictTo('ADMIN', 'SALES_MANAGER'), createCustomer);

// GET /api/customers/analytics - Retrieves aggregated statistics charts
router.get('/analytics', getAnalytics);

// GET /api/customers/upload-history - Retrieves transaction imports history logs
router.get('/upload-history', getUploadHistory);

// POST /api/customers/upload/validate - Pre-flight validation scan for admin users
router.post('/upload/validate', restrictTo('ADMIN'), upload.single('file'), validateCSV);

// POST /api/customers/upload - Secure CSV uploading for admin users
router.post('/upload', restrictTo('ADMIN'), upload.single('file'), uploadCSV);

// GET /api/customers/:id - Retrieves details for a specific customer
router.get('/:id', getCustomerById);

// PUT /api/customers/:id - Updates details for a specific customer
router.put('/:id', restrictTo('ADMIN', 'SALES_MANAGER'), updateCustomer);

// DELETE /api/customers/:id - Deletes a customer
router.delete('/:id', restrictTo('ADMIN', 'SALES_MANAGER'), deleteCustomer);

// POST /api/customers/:id/feedback - Submits feedback for AI recommendationsgs reviews
router.post('/:id/feedback', validateBody(feedbackSchema), submitFeedback);

module.exports = router;
