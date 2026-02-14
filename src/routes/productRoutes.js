const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware'); // ✅ fix case

const {
  createProduct,
  getProductById,
  getAllProducts
} = require('../controllers/productController');

router.post('/', authMiddleware, createProduct);

// Public routes
router.get('/', getAllProducts);
router.get('/:id', getProductById);

module.exports = router;
