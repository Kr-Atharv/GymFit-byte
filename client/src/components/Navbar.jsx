import { Link, useNavigate } from 'react-router-dom';

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  const logout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-group">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/sessions" className="nav-link">Sessions</Link>
        {user?.role === 'member' && <Link to="/my-bookings" className="nav-link">My Bookings</Link>}
        {user?.role === 'admin' && <Link to="/admin" className="nav-link">Admin</Link>}
      </div>

      <div className="navbar-group">
        {user ? (
          <>
            <span className="user-label">Logged in as {user.name}</span>
            <button className="btn-logout" onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/register" className="nav-link">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
