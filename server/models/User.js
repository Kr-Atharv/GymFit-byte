import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true }, // stores the bcrypt hash, never the real password
  role: { type: String, enum: ['member', 'admin'], default: 'member' },
});

export default mongoose.model('User', userSchema);
