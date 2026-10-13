import { Router } from 'express';
import Session, { CAPACITY } from '../models/Session.js';
import Booking from '../models/Booking.js';
import Waitlist from '../models/Waitlist.js';
import { protect } from '../auth.js';

const router = Router();
router.use(protect); // every route below needs a logged-in user

// GET /api/sessions?date=YYYY-MM-DD  -> list sessions, with this user's status on each
router.get('/', async (req, res) => {
  const filter = req.query.date ? { sessionDate: req.query.date } : {};
  const sessions = await Session.find(filter).sort({ sessionDate: 1, startTime: 1 });

  const bookedIds = (await Booking.distinct('session', { user: req.user._id, status: 'confirmed' })).map(String);
  const waitingIds = (await Waitlist.distinct('session', { user: req.user._id })).map(String);

  res.json(
    sessions.map((s) => ({
      ...s.toObject(),
      capacity: CAPACITY,
      seatsLeft: CAPACITY - s.bookedCount,
      started: new Date() >= s.startsAt,
      myStatus: bookedIds.includes(String(s._id)) ? 'booked' : waitingIds.includes(String(s._id)) ? 'waitlisted' : null,
    }))
  );
});

// POST /api/sessions/:id/book
router.post('/:id/book', async (req, res) => {
  const session = await Session.findById(req.params.id);
  if (!session) return res.status(404).json({ message: 'Session not found' });
  if (new Date() >= session.startsAt) return res.status(400).json({ message: 'This session has already started' });
  if (await Booking.exists({ user: req.user._id, session: session._id, status: 'confirmed' })) {
    return res.status(409).json({ message: 'You already booked this session' });
  }

  // Take a seat ONLY if one is free. The check and the +1 happen in a single database
  // operation, so two people clicking at the same moment can never overbook the session.
  const seat = await Session.findOneAndUpdate(
    { _id: session._id, bookedCount: { $lt: CAPACITY } },
    { $inc: { bookedCount: 1 } }
  );
  if (!seat) return res.status(409).json({ message: 'Session is full. You can join the waitlist.' });

  let booking;
  try {
    booking = await Booking.create({ user: req.user._id, session: session._id });
  } catch (err) {
    await Session.updateOne({ _id: session._id }, { $inc: { bookedCount: -1 } }); // give the seat back
    throw err;
  }
  await Waitlist.deleteOne({ user: req.user._id, session: session._id });
  res.status(201).json({ booking });
});

// POST /api/sessions/:id/waitlist  -> only allowed when the session is full
router.post('/:id/waitlist', async (req, res) => {
  const session = await Session.findById(req.params.id);
  if (!session) return res.status(404).json({ message: 'Session not found' });
  if (new Date() >= session.startsAt) return res.status(400).json({ message: 'This session has already started' });
  if (session.bookedCount < CAPACITY) return res.status(400).json({ message: 'Seats are free, please book directly' });
  if (await Booking.exists({ user: req.user._id, session: session._id, status: 'confirmed' })) {
    return res.status(409).json({ message: 'You already booked this session' });
  }
  if (await Waitlist.exists({ user: req.user._id, session: session._id })) {
    return res.status(409).json({ message: 'You are already on the waitlist' });
  }

  const entry = await Waitlist.create({ user: req.user._id, session: session._id });
  const position = await Waitlist.countDocuments({ session: session._id, createdAt: { $lte: entry.createdAt } });
  res.status(201).json({ position });
});

// DELETE /api/sessions/:id/waitlist
router.delete('/:id/waitlist', async (req, res) => {
  const removed = await Waitlist.findOneAndDelete({ user: req.user._id, session: req.params.id });
  if (!removed) return res.status(404).json({ message: 'You are not on the waitlist' });
  res.json({ message: 'Removed from the waitlist' });
});

export default router;
