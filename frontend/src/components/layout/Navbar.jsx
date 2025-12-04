import './Navbar.css';
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">

        {/* Left side - Logo */}
        <div className="navbar-logo">
          <Link to="/">Bander</Link>
        </div>

        {/* Right side - Navigation links */}
        <div className="navbar-links">
          <Link to="/artists">Artists</Link>
          <Link to="/bands">Bands</Link>
          <Link to="/events">Events</Link>
        </div>

        {/* Login / Register buttons */}
        <div className="navbar-actions">
          <Link to="/login" className="nav-btn nav-btn-outline">Login</Link>
          <Link to="/signup" className="nav-btn nav-btn-filled">Sign Up</Link>
        </div>

      </div>
    </nav>
  );
}
