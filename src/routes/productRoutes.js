const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const { createProduct, getProductById } = require('../controllers/productController');

// Create product (seller only)
router.post('/', authMiddleware, createProduct);

// Public get product
router.get('/:id', getProductById);

module.exports = router;
