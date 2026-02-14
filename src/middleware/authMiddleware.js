const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    console.log("Authorization header:", authHeader);

    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    console.log("Extracted token:", token);

    if (!token) {
      return res.status(401).json({ error: 'Invalid token format' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("Decoded token:", decoded);

    req.sellerId = decoded.sellerId;

    next();
  } catch (error) {
    console.log("JWT ERROR:", error.message);
    return res.status(401).json({ error: 'Unauthorized' });
  }
};
