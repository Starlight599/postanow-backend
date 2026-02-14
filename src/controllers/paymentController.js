const pool = require('../config/database');

// ========================================
// HANDLE PAYMENT WEBHOOK
// ========================================
exports.handlePaymentWebhook = async (req, res) => {
  try {
    const { order_id, payment_status, payment_reference } = req.body;

    if (!order_id || !payment_status) {
      return res.status(400).json({
        error: 'Order ID and payment status are required'
      });
    }

    // 1️⃣ Find the order
    const orderResult = await pool.query(
      `SELECT * FROM orders WHERE id = $1`,
      [order_id]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Order not found'
      });
    }

    const order = orderResult.rows[0];

    // 2️⃣ Determine new status
    let newStatus;

    if (payment_status === 'success') {
      newStatus = 'PAID';
    } else {
      newStatus = 'FAILED';
    }

    // 3️⃣ Update order status and store payment reference
    const updatedOrder = await pool.query(
      `
      UPDATE orders
      SET status = $1,
          payment_reference = $2
      WHERE id = $3
      RETURNING *
      `,
      [newStatus, payment_reference || null, order_id]
    );

    // 4️⃣ If payment is successful and the order wasn't cancelled, deduct stock
    if (newStatus === 'PAID' && order.status !== 'CANCELLED') {
      await pool.query(
        `
        UPDATE products
        SET stock = stock - $1
        WHERE id = $2
        `,
        [order.quantity, order.product_id]
      );
    }

    res.status(200).json({
      message: 'Payment processed and order updated',
      order: updatedOrder.rows[0]
    });

  } catch (error) {
    console.error('Payment webhook error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
