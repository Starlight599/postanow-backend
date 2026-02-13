const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const { completeSellerProfile } = require('../controllers/sellerController');

// Seller completes profile (must be logged in)
router.post('/complete-profile', authMiddleware, completeSellerProfile);

module.exports = router;
