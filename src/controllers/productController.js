const pool = require('../config/database');

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

    if (!name || !price) {
      return res.status(400).json({ error: 'Name and price are required' });
    }

    const result = await pool.query(
      `
      INSERT INTO products 
      (seller_id, name, description, price, stock, photo_url, delivery_required)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
      `,
      [
        sellerId,
        name,
        description || null,
        price,
        stock || 0,
        photo_url || null,
        delivery_required || false
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
