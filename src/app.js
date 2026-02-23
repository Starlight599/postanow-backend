const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");

const authRoutes = require('./routes/authRoutes');
const sellerRoutes = require('./routes/sellerRoutes');
const productRoutes = require('./routes/productRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const orderRoutes = require('./routes/orderRoutes');
const authMiddleware = require('./middleware/authMiddleware');

const app = express();

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security & logging
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

// ✅ Static public folder
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use('/auth', authRoutes);
app.use('/seller', sellerRoutes);
app.use('/product', productRoutes);
app.use('/payment', paymentRoutes);
app.use('/order', orderRoutes);

// Health + root
app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to PostaNow API" });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "PostaNow API running",
    environment: process.env.NODE_ENV || "development",
  });
});

// ✅ PUBLIC BUY PAGE (static)
app.get("/buy/:id", (req, res) => {
  res.set("Cache-Control", "no-store");
  res.sendFile(path.join(__dirname, "public", "buy.html"));
});

// QUICK ORDER stays as-is
app.post("/quick-order/:id", async (req, res) => {
  const pool = require("./config/database");

  try {
    const { id } = req.params;
    const { buyer_phone } = req.body;

    const productResult = await pool.query(
      "SELECT id, seller_id, price FROM products WHERE id = $1",
      [id]
    );

    if (productResult.rows.length === 0) {
      return res.send("Product not found");
    }

    const product = productResult.rows[0];

    const orderResult = await pool.query(
      `INSERT INTO orders (
        product_id,
        seller_id,
        quantity,
        unit_price,
        total_amount,
        buyer_phone,
        status
      )
      VALUES ($1,$2,1,$3,$3,$4,'PENDING')
      RETURNING id`,
      [id, product.seller_id, product.price, buyer_phone]
    );

    res.send(`✅ Order placed successfully<br>Order ID: ${orderResult.rows[0].id}`);

  } catch (err) {
    console.error(err);
    res.send("Error creating order");
  }
});

app.get('/protected', authMiddleware, (req, res) => {
  res.status(200).json({
    message: 'You are authenticated',
    sellerId: req.sellerId
  });
});

module.exports = app;