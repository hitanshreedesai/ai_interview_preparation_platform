const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getProfile } = require('../controllers/profileController');

router.get('/', protect, getProfile);

module.exports = router;
