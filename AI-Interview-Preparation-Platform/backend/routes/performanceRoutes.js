const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getPerformance } = require('../controllers/performanceController');

router.get('/', protect, getPerformance);

module.exports = router;
