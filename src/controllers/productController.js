const pool = require('../config/database');


// ===============================
// CREATE PRODUCT
// ===============================
exports.createProduct = async (req, res) => {
  try {
    const sellerId = req.sellerId;

    const {
      name,
      description,
      price,
      stock,
      photo_url,
      delivery_required
    } = req.body;

    // ===== VALIDATION =====
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Product name is required' });
    }

    if (price === undefined || price <= 0) {
      return res.status(400).json({ error: 'Price must be greater than 0' });
    }

    if (stock === undefined || stock < 0) {
      return res.status(400).json({ error: 'Stock is required and must be 0 or more' });
    }

    const result = await pool.query(
      `
      INSERT INTO products (
        seller_id,
        name,
        description,
        price,
        stock,
        photo_url,
        delivery_required
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING *;
      `,
      [
        sellerId,
        name.trim(),
        description || null,
        price,
        stock,
        photo_url || null,
        delivery_required ?? false
      ]
    );

    res.status(201).json({
      message: 'Product created successfully',
      product: result.rows[0]
    });

  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};


// ===============================
// GET PRODUCT BY ID (PUBLIC)
// ===============================
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT 
        id,
        seller_id,
        name,
        description,
        price,
        stock,
        photo_url,
        delivery_required,
        created_at
      FROM products
      WHERE id = $1
        AND active = true
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Product not found"
      });
    }

    res.status(200).json({
      product: result.rows[0]
    });

  } catch (error) {
    console.error("Get product error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
