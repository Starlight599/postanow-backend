const express = require('express');
const router = express.Router();

const { handlePaymentWebhook } = require('../controllers/paymentController');

// Payment webhook to handle payment status
router.post('/payment-webhook', handlePaymentWebhook);

module.exports = router;
