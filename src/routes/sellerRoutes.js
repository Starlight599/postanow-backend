const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const { completeProfile } = require('../controllers/sellerController');

router.post('/complete-profile', authMiddleware, completeProfile);

module.exports = router;
