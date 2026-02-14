const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const authRoutes = require('./routes/authRoutes');
const sellerRoutes = require('./routes/sellerRoutes');
const productRoutes = require('./routes/productRoutes'); // ✅ NEW
const paymentRoutes = require('./routes/paymentRoutes'); // ✅ NEW
const authMiddleware = require('./middleware/authMiddleware');

const app = express();

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security & logging
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

// Routes
app.use('/auth', authRoutes);
app.use('/seller', sellerRoutes);
app.use('/product', productRoutes); // ✅ NEW
app.use('/payment', paymentRoutes); // ✅ NEW

// Health + root
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to PostaNow API",
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "PostaNow API running",
    environment: process.env.NODE_ENV || "development",
  });
});

// Protected test route
app.get('/protected', authMiddleware, (req, res) => {
  res.status(200).json({
    message: 'You are authenticated',
    sellerId: req.sellerId
  });
});

module.exports = app;
