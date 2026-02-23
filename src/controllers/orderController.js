const pool = require('../config/database');


// ========================================
// CREATE ORDER (WITH ATOMIC STOCK CONTROL)
// ========================================
exports.createOrder = async (req, res) => {
  const client = await pool.connect();

  console.log("Received order creation request"); // Log to see if the request reaches this function

  try {
    const {
      product_id,
      quantity,
      buyer_phone,
      buyer_latitude,
      buyer_longitude,
      buyer_location_note
    } = req.body;

    console.log("Request body:", req.body); // Log the received body

    if (!product_id || !quantity || quantity <= 0) {
      return res.status(400).json({ error: "Invalid product or quantity" });
    }

    await client.query('BEGIN');

    // 🔒 Lock product row to prevent race conditions
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

    // ➖ Deduct stock
    await client.query(
      `
      UPDATE products
      SET stock = $1
      WHERE id = $2
      `,
      [newStock, product_id]
    );

    // 🧾 Insert order
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
        buyer_location_note,
        status
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'PENDING')
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

// ========================================
// UPDATE ORDER STATUS
// ========================================
exports.updateOrderStatus = async (req, res) => {
    try {
      const id = req.params.id.trim();
      const { status } = req.body;
  
      console.log("Update request →", id, "len:", id.length);
  
      if (!status) {
        return res.status(400).json({ error: 'Status is required' });
      }
  
      const orderResult = await pool.query(
        `SELECT * FROM orders WHERE id = $1`,
        [id]
      );
  
      if (orderResult.rows.length === 0) {
        return res.status(404).json({ error: 'Order not found' });
      }
  
      const order = orderResult.rows[0];
  
      if (status === 'CANCELLED' && order.status !== 'CANCELLED') {
        await pool.query(
          `UPDATE products SET stock = stock + $1 WHERE id = $2`,
          [order.quantity, order.product_id]
        );
      }
  
      const updatedOrder = await pool.query(
        `UPDATE orders SET status = $1 WHERE id = $2 RETURNING *`,
        [status, id]
      );
  
      res.status(200).json({
        message: 'Order status updated',
        order: updatedOrder.rows[0]
      });
  
    } catch (error) {
      console.error('Update order status error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  };
  
