const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const authRoutes = require('./routes/authRoutes');
const sellerRoutes = require('./routes/sellerRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes'); // ✅ NEW

const authMiddleware = require('./middleware/authMiddleware');

const app = express();

// ===============================
// BODY PARSING
// ===============================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===============================
// SECURITY & LOGGING
// ===============================
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

// ===============================
// ROUTES
// ===============================
app.use('/auth', authRoutes);
app.use('/seller', sellerRoutes);
app.use('/product', productRoutes);
app.use('/order', orderRoutes); // ✅ NEW

// ===============================
// ROOT
// ===============================
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to PostaNow API",
  });
});

// ===============================
// HEALTH CHECK
// ===============================
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "PostaNow API running",
    environment: process.env.NODE_ENV || "development",
  });
});

// ===============================
// PROTECTED TEST ROUTE
// ===============================
app.get('/protected', authMiddleware, (req, res) => {
  res.status(200).json({
    message: 'You are authenticated',
    sellerId: req.sellerId
  });
});

module.exports = app;
