import jwt from 'jsonwebtoken';
import User from '../models/UserSchema.js';

const secretKey = "king";

export default async function authenticateToken(req, res, next) {
  try {
    let token = req.cookies?.accessToken;
    if (!token) {
      const authHeader = req.headers['authorization'];
      if (authHeader?.startsWith('Bearer ')) token = authHeader.split(' ')[1];
    }

    if (!token) return res.status(401).json({ message: "Session expired or token missing" });

    const decoded = jwt.verify(token, secretKey);

    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    req.user = decoded;

    next();
  } catch (err) {
    console.error("Auth Middleware Error:", err);
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Token expired" });
    }
    return res.status(500).json({ message: "Server error during authentication" });
  }
}
