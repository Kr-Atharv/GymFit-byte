import { Router } from 'express';
import Session from '../models/Session.js';
import Booking from '../models/Booking.js';
import { protect, adminOnly } from '../auth.js';

const router = Router();
router.use(protect, adminOnly); // every route below is admin only

// POST /api/admin/sessions  { sessionDate: "2026-10-20", startTime: "09:00" }
router.post('/sessions', async (req, res) => {
  const { sessionDate, startTime } = req.body;
  const startsAt = new Date(`${sessionDate}T${startTime}:00`);
  if (isNaN(startsAt)) return res.status(400).json({ message: 'Enter a valid date and time' });

  if (await Session.exists({ sessionDate, startTime })) {
    return res.status(409).json({ message: 'A session already exists at that date and time' });
  }

  const endsAt = new Date(startsAt.getTime() + 60 * 60 * 1000); // sessions last 1 hour
  const session = await Session.create({ sessionDate, startTime, startsAt, endsAt });
  res.status(201).json({ session });
});

// GET /api/admin/sessions/:id/bookings  -> who booked this session
router.get('/sessions/:id/bookings', async (req, res) => {
  const bookings = await Booking.find({ session: req.params.id })
    .select('-checkInCode') // admin must ask the member for the code, not read it here
    .populate('user', 'name email')
    .sort({ createdAt: 1 });
  res.json(bookings);
});

// POST /api/admin/check-in  { checkInCode: "GYM-A3F8B2" }
router.post('/check-in', async (req, res) => {
  const code = String(req.body.checkInCode || '').trim().toUpperCase();
  const booking = await Booking.findOne({ checkInCode: code }).populate('user', 'name').populate('session');

  if (!booking) return res.status(404).json({ message: 'Check-in code not found' });
  if (booking.status === 'cancelled') return res.status(400).json({ message: 'This booking was cancelled' });
  if (booking.attendedAt) return res.status(409).json({ message: 'This code was already used' });

  const now = new Date();
  if (now < booking.session.startsAt) return res.status(400).json({ message: 'Too early, the session has not started' });
  if (now > booking.session.endsAt) return res.status(400).json({ message: 'The session is already over' });

  booking.attendedAt = now;
  await booking.save();
  res.json({ message: `${booking.user.name} checked in` });
});

export default router;
