const pool = require('../config/database');

exports.createOrder = async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      product_id,
      quantity,
      buyer_phone,
      buyer_latitude,
      buyer_longitude,
      buyer_location_note
    } = req.body;

    if (!product_id) {
      return res.status(400).json({ error: 'Product ID required' });
    }

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Quantity must be greater than 0' });
    }

    await client.query('BEGIN');

    // 1️⃣ Lock product row (prevents race conditions)
    const productResult = await client.query(
      `SELECT * FROM products WHERE id = $1 AND active = true FOR UPDATE`,
      [product_id]
    );

    if (productResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = productResult.rows[0];

    if (product.stock < quantity) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Not enough stock available' });
    }

    const unit_price = product.price;
    const total_amount = unit_price * quantity;

    // 2️⃣ Deduct stock
    await client.query(
      `UPDATE products SET stock = stock - $1 WHERE id = $2`,
      [quantity, product_id]
    );

    // 3️⃣ Insert order
    const orderResult = await client.query(
      `
      INSERT INTO orders (
        product_id,
        seller_id,
        quantity,
        unit_price,
        total_amount,
        buyer_phone,
        buyer_latitude,
        buyer_longitude,
        buyer_location_note
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *;
      `,
      [
        product_id,
        product.seller_id,
        quantity,
        unit_price,
        total_amount,
        buyer_phone || null,
        buyer_latitude,
        buyer_longitude,
        buyer_location_note || null
      ]
    );

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Order created successfully',
      order: orderResult.rows[0]
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
};
