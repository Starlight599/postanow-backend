const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

app.use('/auth', authRoutes);

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

module.exports = app;
