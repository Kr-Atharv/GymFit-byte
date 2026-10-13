import 'dotenv/config'; // loads the values from .env into process.env
import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import authRoutes from './routes/auth.js';
import sessionRoutes from './routes/sessions.js';
import bookingRoutes from './routes/bookings.js';
import adminRoutes from './routes/admin.js';

const app = express();
app.use(express.json()); // lets us read JSON sent by the frontend as req.body

app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);

// Any error thrown inside a route ends up here and is sent back as JSON
app.use((err, req, res, next) => {
  console.error(err.message);
  const status = err.status || (['CastError', 'ValidationError'].includes(err.name) ? 400 : 500);
  res.status(status).json({ message: status === 400 ? 'Invalid data' : 'Something went wrong' });
});

// 1. connect to MongoDB  2. make sure the admin exists  3. start listening
await mongoose.connect(process.env.MONGODB_URI);
console.log('MongoDB connected');

const adminEmail = process.env.ADMIN_EMAIL.toLowerCase();
if (!(await User.exists({ email: adminEmail }))) {
  await User.create({
    name: 'Gym Admin',
    email: adminEmail,
    password: await bcrypt.hash(process.env.ADMIN_PASSWORD, 10),
    role: 'admin',
  });
  console.log('Admin account created:', adminEmail);
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
