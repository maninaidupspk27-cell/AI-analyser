const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const exportController = require('../controllers/exportController');

router.get('/csv', protect, exportController.exportCsv);

module.exports = router;
