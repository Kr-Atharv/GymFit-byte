import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../auth.js';

const router = Router();

// Only the fields the frontend needs (never the password)
const publicUser = (u) => ({ _id: u._id, name: u.name, email: u.email, role: u.role });

// Login token (valid 7 days) + user info
const authResponse = (user) => ({
  token: jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' }),
  user: publicUser(user),
});

// POST /api/auth/register  -> always creates a "member", never an admin
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }
  if (await User.exists({ email: email.toLowerCase() })) {
    return res.status(409).json({ message: 'Email already registered' });
  }

  const user = await User.create({ name, email, password: await bcrypt.hash(password, 10) });
  res.status(201).json(authResponse(user));
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: (email || '').toLowerCase() });
  if (!user || !(await bcrypt.compare(password || '', user.password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  res.json(authResponse(user));
});

// GET /api/auth/me  -> who is logged in (used when the page is refreshed)
router.get('/me', protect, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

export default router;
