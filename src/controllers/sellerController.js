const pool = require('../config/database');

exports.completeProfile = async (req, res) => {
  try {
    const sellerId = req.sellerId;

    console.log("Authenticated sellerId:", sellerId);
    console.log("Request body:", req.body);

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

    console.log("Rows updated:", result.rowCount);

    res.status(200).json({
      message: 'Profile updated successfully',
      seller: result.rows[0]
    });

  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ error: 'Server error' });
  }
};
