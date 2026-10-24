const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getFeedback } = require('../controllers/feedbackController');

router.get('/', protect, getFeedback);

module.exports = router;
