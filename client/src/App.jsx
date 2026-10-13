import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { api } from './api.js';
import Navbar from './components/Navbar.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Sessions from './pages/Sessions.jsx';
import MyBookings from './pages/MyBookings.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';

function Home() {
  return (
    <div className="card center">
      <h1 className="card-title">Welcome to GymFit</h1>
      <p className="card-subtitle">Book a 1-hour gym session. Each session has 20 seats, and a waitlist when it is full.</p>
      <Link to="/sessions" className="link">View available sessions →</Link>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null); // the logged-in user, or null
  const [loading, setLoading] = useState(true);

  // When the page is refreshed, use the saved token to find out who is logged in
  useEffect(() => {
    if (!sessionStorage.getItem('token')) return setLoading(false);
    api('/api/auth/me')
      .then((data) => setUser(data.user))
      .catch(() => sessionStorage.removeItem('token'))
      .finally(() => setLoading(false));
  }, []);

  const logout = () => {
    sessionStorage.removeItem('token');
    setUser(null);
  };

  if (loading) return <p className="center muted">Loading...</p>;

  return (
    <BrowserRouter>
      <Navbar user={user} onLogout={logout} />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Register setUser={setUser} />} />

          {/* these pages need a login; admin page needs the admin role */}
          <Route path="/sessions" element={user ? <Sessions user={user} /> : <Navigate to="/login" />} />
          <Route path="/my-bookings" element={user ? <MyBookings /> : <Navigate to="/login" />} />
          <Route path="/admin" element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
