import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'vortex_quantum_secret_key_99';

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization denied. No token found.' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Authorization denied. Token is null.' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Authentication Error:', err.message);
    res.status(401).json({ error: 'Token is invalid or has expired.' });
  }
};
