import mongoose from 'mongoose';

export const CAPACITY = 20; // every session has exactly 20 seats

const sessionSchema = new mongoose.Schema({
  sessionDate: { type: String, required: true }, // "2026-10-20"
  startTime: { type: String, required: true },   // "09:00"
  startsAt: { type: Date, required: true },      // real date-time, used to compare with "now"
  endsAt: { type: Date, required: true },        // startsAt + 1 hour
  bookedCount: { type: Number, default: 0 },     // seats taken so far
});

// Two sessions cannot have the same date and time
sessionSchema.index({ sessionDate: 1, startTime: 1 }, { unique: true });

export default mongoose.model('Session', sessionSchema);
