const pool = require('../config/database');
const jwt = require('jsonwebtoken');

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.requestOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ error: 'Phone is required' });
    }

    const code = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await pool.query(
      `INSERT INTO otps (phone, code, expires_at)
       VALUES ($1, $2, $3)`,
      [phone, code, expiresAt]
    );

    console.log(`📱 OTP for ${phone}: ${code}`);

    return res.status(200).json({
      message: 'OTP sent',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { phone, code } = req.body;

    if (!phone || !code) {
      return res.status(400).json({ error: 'Phone and code required' });
    }

    const result = await pool.query(
      `SELECT * FROM otps
       WHERE phone = $1
       AND code = $2
       AND expires_at > NOW()
       ORDER BY created_at DESC
       LIMIT 1`,
      [phone, code]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    let seller = await pool.query(
      `SELECT * FROM sellers WHERE phone = $1`,
      [phone]
    );

    if (seller.rows.length === 0) {
      seller = await pool.query(
        `INSERT INTO sellers (phone, pickup_latitude, pickup_longitude)
         VALUES ($1, 0, 0)
         RETURNING *`,
        [phone]
      );
    }

    const token = jwt.sign(
      { sellerId: seller.rows[0].id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      message: 'Login successful',
      token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};
