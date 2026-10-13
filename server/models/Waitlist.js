import mongoose from 'mongoose';

const waitlistSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
  },
  { timestamps: true } // createdAt = when they joined, so the oldest entry is first in line
);

// A user can join the waitlist of a session only once
waitlistSchema.index({ user: 1, session: 1 }, { unique: true });

export default mongoose.model('Waitlist', waitlistSchema);
