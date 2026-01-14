import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Navbar.css";

export default function Navbar() {
  const { isAuth, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true }); // go home as not logged in
  };

  return (
  <nav className="navbar">
    <div className="navbar-container">
      <div className="navbar-logo">
        <Link to="/">Bander</Link>
      </div>

      <div className="navbar-links">
        <Link to="/bands">Bands</Link>
        <Link to="/artists">Artists</Link>
        <Link to="/events">Events</Link>
      </div>

      <div className="navbar-actions">
        {!isAuth ? (
          <>
            <Link to="/login" className="nav-btn nav-btn-outline">Log in</Link>
            <Link to="/signup" className="nav-btn nav-btn-filled">Sign up</Link>
          </>
        ) : (
          <>
            <Link to="/profile/settings" className="nav-btn nav-btn-outline">
              My account
            </Link>
            <button onClick={handleLogout} className="nav-btn nav-btn-filled">
              Sign out
            </button>
          </>
        )}
      </div>
    </div>
  </nav>
);

}

