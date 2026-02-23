const pool = require('../config/database');

exports.completeProfile = async (req, res) => {
  try {
    const sellerId = req.sellerId;

    const {
      business_name,
      pickup_latitude,
      pickup_longitude,
      pickup_location_note,
      account_type
    } = req.body;

    const result = await pool.query(
      `
      UPDATE sellers
      SET 
        business_name = $1,
        pickup_latitude = $2,
        pickup_longitude = $3,
        pickup_location_note = $4,
        account_type = $5
      WHERE id = $6
      RETURNING *;
      `,
      [
        business_name || null,
        pickup_latitude,
        pickup_longitude,
        pickup_location_note || null,
        account_type || 'individual',
        sellerId
      ]
    );

    res.status(200).json({
      message: 'Profile updated successfully',
      seller: result.rows[0]
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// ===============================
// GET SELLER ORDERS
// ===============================
exports.getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.sellerId;

    const result = await pool.query(
      `
      SELECT 
        o.id,
        o.product_id,
        o.quantity,
        o.total_amount,
        o.status,
        o.created_at,
        o.buyer_latitude,
        o.buyer_longitude,
        p.name AS product_name,
        s.pickup_latitude,
        s.pickup_longitude
      FROM orders o
      JOIN products p ON p.id = o.product_id
      JOIN sellers s ON s.id = o.seller_id
      WHERE o.seller_id = $1
      ORDER BY o.created_at DESC
      `,
      [sellerId]
    );

    res.json({ orders: result.rows });

  } catch (err) {
    console.error("Seller orders error:", err);
    res.status(500).json({ error: "Server error" });
  }
};