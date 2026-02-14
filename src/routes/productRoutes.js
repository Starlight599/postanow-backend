const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const { createProduct } = require('../controllers/productController');

router.post('/', authMiddleware, createProduct);

module.exports = router;
