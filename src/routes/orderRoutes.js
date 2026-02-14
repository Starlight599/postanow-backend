const express = require('express');
const router = express.Router();

const {
  createOrder,
  updateOrderStatus
} = require('../controllers/orderController');

router.post('/', createOrder);
router.patch('/:id/status', updateOrderStatus);

module.exports = router;
