import { useState, useEffect } from 'react';
import { api } from '../api.js';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [waitlists, setWaitlists] = useState([]);
  const [message, setMessage] = useState(null);

  const load = () =>
    api('/api/bookings/me')
      .then((data) => {
        setBookings(data.bookings);
        setWaitlists(data.waitlists);
      })
      .catch((err) => setMessage({ type: 'error', text: err.message }));

  useEffect(() => { load(); }, []);

  // Runs a request, shows the result message, then reloads the lists
  const run = async (url, method, successText) => {
    try {
      await api(url, method);
      setMessage({ type: 'success', text: successText });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
    load();
  };

  const cancelBooking = (id) => {
    if (window.confirm('Cancel this booking?')) run(`/api/bookings/${id}`, 'DELETE', 'Booking cancelled');
  };

  const leaveWaitlist = (sessionId) => run(`/api/sessions/${sessionId}/waitlist`, 'DELETE', 'Removed from the waitlist');

  return (
    <div className="card">
      <h1 className="card-title">My Bookings</h1>
      <p className="card-subtitle">Your reservations, check-in codes and waitlist positions.</p>
      {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      {waitlists.length > 0 && (
        <>
          <h2>Waitlist ({waitlists.length})</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr><th>Date</th><th>Time</th><th>Position</th><th></th></tr>
              </thead>
              <tbody>
                {waitlists.map((w) => (
                  <tr key={w._id}>
                    <td>{w.session.sessionDate}</td>
                    <td>{w.session.startTime}</td>
                    <td><span className="badge badge-waitlisted">#{w.position}</span></td>
                    <td><button className="btn-danger" onClick={() => leaveWaitlist(w.session._id)}>Leave</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <h2>Bookings ({bookings.length})</h2>
      {bookings.length === 0 ? (
        <p className="center muted">You have no bookings yet.</p>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr><th>Date</th><th>Time</th><th>Status</th><th>Check-in code</th><th>Attendance</th><th></th></tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b._id}>
                  <td>{b.session.sessionDate}</td>
                  <td>{b.session.startTime}</td>
                  <td><span className={`badge badge-${b.status}`}>{b.status}</span></td>
                  <td>{b.status === 'confirmed' ? <code>{b.checkInCode}</code> : '—'}</td>
                  <td>
                    {b.attendedAt ? <span className="green">Attended</span>
                      : b.status === 'confirmed' ? <span className="orange">Not checked in</span>
                      : '—'}
                  </td>
                  <td>
                    {b.status === 'confirmed' && !b.attendedAt && (
                      <button className="btn-danger" onClick={() => cancelBooking(b._id)}>Cancel</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
