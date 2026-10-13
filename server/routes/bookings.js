import { Router } from 'express';
import Session from '../models/Session.js';
import Booking from '../models/Booking.js';
import Waitlist from '../models/Waitlist.js';
import { protect } from '../auth.js';

const router = Router();
router.use(protect);

// GET /api/bookings/me  -> my bookings + my waitlist entries (with queue position)
router.get('/me', async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id }).populate('session').sort({ createdAt: -1 });
  const entries = await Waitlist.find({ user: req.user._id }).populate('session');

  const waitlists = await Promise.all(
    entries.map(async (w) => ({
      _id: w._id,
      session: w.session,
      // position = how many people joined before me (including me)
      position: await Waitlist.countDocuments({ session: w.session._id, createdAt: { $lte: w.createdAt } }),
    }))
  );

  res.json({ bookings, waitlists });
});

// DELETE /api/bookings/:id  -> cancel my booking
router.delete('/:id', async (req, res) => {
  const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id }).populate('session');
  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  if (booking.status === 'cancelled') return res.status(400).json({ message: 'Already cancelled' });
  if (new Date() >= booking.session.startsAt) {
    return res.status(400).json({ message: 'Cannot cancel after the session has started' });
  }

  booking.status = 'cancelled';
  await booking.save();

  // The freed seat goes to the person who has waited longest (first in, first out).
  const next = await Waitlist.findOneAndDelete({ session: booking.session._id }, { sort: { createdAt: 1 } });
  if (next) {
    await Booking.create({ user: next.user, session: booking.session._id }); // seat count stays the same
  } else {
    await Session.updateOne({ _id: booking.session._id }, { $inc: { bookedCount: -1 } });
  }

  res.json({ message: 'Booking cancelled' });
});

export default router;
