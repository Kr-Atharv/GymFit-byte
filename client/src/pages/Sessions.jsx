import { useState, useEffect } from 'react';
import { api } from '../api.js';
import SessionCard from '../components/SessionCard.jsx';

export default function Sessions({ user }) {
  const [sessions, setSessions] = useState(null); // null = still loading
  const [date, setDate] = useState('');           // optional date filter
  const [message, setMessage] = useState(null);   // { type: 'success' | 'error', text }

  const load = () =>
    api(`/api/sessions${date ? `?date=${date}` : ''}`)
      .then(setSessions)
      .catch((err) => setMessage({ type: 'error', text: err.message }));

  // Load when the page opens or the date changes, then refresh every 5 seconds
  useEffect(() => {
    load();
    const timer = setInterval(load, 5000);
    return () => clearInterval(timer); // stop the timer when leaving the page
  }, [date]);

  const book = async (id) => {
    try {
      const data = await api(`/api/sessions/${id}/book`, 'POST');
      setMessage({ type: 'success', text: `Booked! Your check-in code is ${data.booking.checkInCode}` });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
    load();
  };

  const joinWaitlist = async (id) => {
    try {
      const data = await api(`/api/sessions/${id}/waitlist`, 'POST');
      setMessage({ type: 'success', text: `You are number ${data.position} on the waitlist` });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
    load();
  };

  return (
    <div className="card">
      <h1 className="card-title">Available Gym Sessions</h1>
      <p className="card-subtitle">Check seat availability and reserve your slot.</p>
      {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      <div className="filter-bar">
        <label>Filter by date:</label>
        <input className="form-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        {date && <button className="btn-secondary" onClick={() => setDate('')}>Clear</button>}
      </div>

      {sessions === null ? (
        <p className="center muted">Loading sessions...</p>
      ) : sessions.length === 0 ? (
        <p className="center muted">No sessions found.</p>
      ) : (
        <div className="session-grid">
          {sessions.map((s) => (
            <SessionCard
              key={s._id}
              session={s}
              canBook={user.role === 'member'}
              onBook={book}
              onJoinWaitlist={joinWaitlist}
            />
          ))}
        </div>
      )}
    </div>
  );
}
