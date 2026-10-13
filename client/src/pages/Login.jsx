import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api.js';

export default function Login({ setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); // stop the browser from reloading the page
    try {
      const data = await api('/api/auth/login', 'POST', { email, password });
      sessionStorage.setItem('token', data.token); // remember the login
      setUser(data.user);
      navigate(data.user.role === 'admin' ? '/admin' : '/sessions');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="card form-box">
      <h1 className="card-title">Login</h1>
      <p className="card-subtitle">Sign in to book and manage your gym sessions.</p>
      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="form-input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input className="form-input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button className="btn-green btn-full">Log In</button>
      </form>

      <p className="center" style={{ marginTop: 16 }}>
        No account? <Link to="/register" className="link">Register here</Link>
      </p>
    </div>
  );
}
