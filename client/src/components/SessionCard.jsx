// Shows one gym session and the right button for it
export default function SessionCard({ session: s, canBook, onBook, onJoinWaitlist }) {
  const endTime = new Date(s.endsAt).toTimeString().slice(0, 5); // "10:00"

  // Decide what the member sees at the bottom of the card
  let action;
  if (s.myStatus === 'booked') {
    action = <div className="tag tag-green">✓ You booked this slot</div>;
  } else if (s.myStatus === 'waitlisted') {
    action = <div className="tag tag-yellow">⏳ You are on the waitlist</div>;
  } else if (s.started) {
    action = <button className="btn-full" disabled>Session started</button>;
  } else if (!canBook) {
    action = null; // admins only view sessions
  } else if (s.seatsLeft > 0) {
    action = <button className="btn-green btn-full" onClick={() => onBook(s._id)}>Book Session</button>;
  } else {
    action = <button className="btn-warning btn-full" onClick={() => onJoinWaitlist(s._id)}>Join Waitlist</button>;
  }

  return (
    <div className="session-box">
      <div>
        <div className="session-header">
          <span>{s.sessionDate}</span>
          <span>{s.startTime} – {endTime}</span>
        </div>
        <p>Booked: {s.bookedCount} / {s.capacity}</p>
        <p className={`seats-line ${s.seatsLeft === 0 ? 'full' : ''}`}>
          {s.seatsLeft === 0 ? 'FULL (0 seats left)' : `Seats left: ${s.seatsLeft}`}
        </p>
      </div>
      {action}
    </div>
  );
}
