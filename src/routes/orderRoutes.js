const express = require('express');
const router = express.Router();
const { createOrder, updateOrderStatus } = require('../controllers/orderController');

router.post('/', createOrder); // Ensure this is defined correctly
router.patch('/:id/status', updateOrderStatus); // Ensure this is defined correctly

module.exports = router;
