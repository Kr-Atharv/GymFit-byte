import jwt from 'jsonwebtoken';
import User from './models/User.js';

// Runs before protected routes: reads the token, finds the user, puts it on req.user
export async function protect(req, res, next) {
  try {
    const token = (req.headers.authorization || '').replace('Bearer ', '');
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(id);
  } catch {
    req.user = null; // missing, fake or expired token
  }
  if (!req.user) return res.status(401).json({ message: 'Please log in' });
  next();
}

// Runs after protect: only lets admins through
export function adminOnly(req, res, next) {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admins only' });
  next();
}
