import { useState, useEffect } from 'react';
import { api } from '../api.js';

// Start times 06:00 to 20:00
const TIMES = Array.from({ length: 15 }, (_, i) => String(i + 6).padStart(2, '0') + ':00');

export default function AdminDashboard() {
  const [sessions, setSessions] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [roster, setRoster] = useState([]);       // bookings of the selected session
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('09:00');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState(null);

  const fail = (err) => setMessage({ type: 'error', text: err.message });

  const loadSessions = async () => {
    const list = await api('/api/sessions').catch(fail);
    if (!list) return;
    setSessions(list);
    if (!selectedId && list.length > 0) setSelectedId(list[0]._id);
  };

  const loadRoster = () =>
    selectedId && api(`/api/admin/sessions/${selectedId}/bookings`).then(setRoster).catch(fail);

  useEffect(() => { loadSessions(); }, []);
  useEffect(() => { loadRoster(); }, [selectedId]);

  const createSession = async (e) => {
    e.preventDefault();
    try {
      await api('/api/admin/sessions', 'POST', { sessionDate: newDate, startTime: newTime });
      setMessage({ type: 'success', text: `Session created for ${newDate} at ${newTime}` });
      loadSessions();
    } catch (err) {
      fail(err);
    }
  };

  const checkIn = async (e) => {
    e.preventDefault();
    try {
      const data = await api('/api/admin/check-in', 'POST', { checkInCode: code });
      setMessage({ type: 'success', text: data.message });
      setCode('');
      loadRoster();
    } catch (err) {
      fail(err);
    }
  };

  return (
    <div className="card">
      <h1 className="card-title">Admin Dashboard</h1>
      <p className="card-subtitle">Create sessions, see who booked, and check members in.</p>
      {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      <div className="section">
        <h2>1. Create session</h2>
        <form className="row" onSubmit={createSession}>
          <div>
            <label className="form-label">Date</label>
            <input className="form-input" type="date" required value={newDate} onChange={(e) => setNewDate(e.target.value)} />
          </div>
          <div>
            <label className="form-label">Start time</label>
            <select className="form-input" value={newTime} onChange={(e) => setNewTime(e.target.value)}>
              {TIMES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <button className="btn-green">Create</button>
        </form>
      </div>

      <div className="section">
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>2. Session bookings</h2>
          <select className="form-input" value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
            {sessions.map((s) => (
              <option key={s._id} value={s._id}>{s.sessionDate} at {s.startTime} ({s.bookedCount}/{s.capacity})</option>
            ))}
          </select>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr><th>Name</th><th>Email</th><th>Status</th><th>Attendance</th></tr>
            </thead>
            <tbody>
              {roster.length === 0 && (
                <tr><td colSpan={4} className="center muted">No bookings yet.</td></tr>
              )}
              {roster.map((b) => (
                <tr key={b._id}>
                  <td>{b.user.name}</td>
                  <td>{b.user.email}</td>
                  <td><span className={`badge badge-${b.status}`}>{b.status}</span></td>
                  <td>
                    {b.attendedAt ? <span className="green">Attended</span>
                      : b.status === 'confirmed' ? <span className="orange">Not checked in</span>
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="section">
        <h2>3. Check-in</h2>
        <form className="row" onSubmit={checkIn}>
          <div>
            <label className="form-label">Member's check-in code</label>
            <input className="form-input" required placeholder="GYM-A3F8B2" value={code} onChange={(e) => setCode(e.target.value)} />
          </div>
          <button className="btn-green">Check In</button>
        </form>
      </div>
    </div>
  );
}
