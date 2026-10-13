import mongoose from 'mongoose';
import crypto from 'crypto';

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
    status: { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' },
    // random code like GYM-A3F8B2 that the member shows at the gym
    checkInCode: {
      type: String,
      unique: true,
      default: () => 'GYM-' + crypto.randomBytes(3).toString('hex').toUpperCase(),
    },
    attendedAt: { type: Date, default: null }, // filled when the admin checks the member in
  },
  { timestamps: true } // adds createdAt and updatedAt automatically
);

// A user can have only ONE confirmed booking per session (cancelled ones don't count)
bookingSchema.index(
  { user: 1, session: 1 },
  { unique: true, partialFilterExpression: { status: 'confirmed' } }
);

export default mongoose.model('Booking', bookingSchema);
