import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api.js';

export default function Register({ setUser }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await api('/api/auth/register', 'POST', { name, email, password });
      sessionStorage.setItem('token', data.token); // registering also logs the user in
      setUser(data.user);
      navigate('/sessions');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="card form-box">
      <h1 className="card-title">Register</h1>
      <p className="card-subtitle">Create an account to reserve gym sessions.</p>
      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Full name</label>
          <input className="form-input" required value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="form-input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Password (min 6 characters)</label>
          <input className="form-input" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button className="btn-green btn-full">Create Account</button>
      </form>

      <p className="center" style={{ marginTop: 16 }}>
        Already registered? <Link to="/login" className="link">Log in</Link>
      </p>
    </div>
  );
}
