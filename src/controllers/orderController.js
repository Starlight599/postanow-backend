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

    if (!product_id || !quantity || quantity <= 0) {
      return res.status(400).json({ error: "Invalid product or quantity" });
    }

    await client.query('BEGIN');

    // 🔒 Lock the product row
    const productResult = await client.query(
      `
      SELECT id, seller_id, price, stock
      FROM products
      WHERE id = $1
      FOR UPDATE
      `,
      [product_id]
    );

    if (productResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: "Product not found" });
    }

    const product = productResult.rows[0];

    if (product.stock < quantity) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: "Insufficient stock" });
    }

    const newStock = product.stock - quantity;
    const totalAmount = product.price * quantity;

    // 🔻 Deduct stock
    await client.query(
      `
      UPDATE products
      SET stock = $1
      WHERE id = $2
      `,
      [newStock, product_id]
    );

    // 🧾 Create order
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
      RETURNING *
      `,
      [
        product_id,
        product.seller_id,
        quantity,
        product.price,
        totalAmount,
        buyer_phone,
        buyer_latitude,
        buyer_longitude,
        buyer_location_note || null
      ]
    );

    await client.query('COMMIT');

    res.status(201).json({
      message: "Order created successfully",
      order: orderResult.rows[0]
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Create order error:", error);
    res.status(500).json({ error: "Server error" });
  } finally {
    client.release();
  }
};
