const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const { completeProfile, getSellerOrders } = require('../controllers/sellerController');

router.post('/complete-profile', authMiddleware, completeProfile);

// Seller orders
router.get('/orders', authMiddleware, getSellerOrders);

module.exports = router;