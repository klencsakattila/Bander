import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getUserById } from "../../services/UserService";
import "./Navbar.css";

function getBandIdFromUser(u) {
  return (
    u?.band_id ??
    u?.bandId ??
    u?.band?.id ??
    u?.band?.band_id ??
    u?.band?.bandId ??
    null
  );
}

function isTruthyAdmin(row) {
  // kezeld le a tipikus backend mezőneveket
  const v =
    row?.is_admin ??
    row?.isAdmin ??
    row?.isadmin ??
    row?.admin ??
    row?.role; // ha esetleg role = 'admin'
  if (typeof v === "string") return v === "1" || v.toLowerCase() === "true" || v.toLowerCase() === "admin";
  return v === true || Number(v) === 1;
}

export default function Navbar() {
  const { isAuth, logout, token, userId } = useAuth();
  const navigate = useNavigate();

  const [isAdmin, setIsAdmin] = useState(false);
  const [bandId, setBandId] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadMe() {
      try {
        if (!isAuth || !userId) {
          if (!cancelled) {
            setBandId(null);
            setIsAdmin(false);
          }
          return;
        }

        const me = await getUserById(userId, token);
        const row = Array.isArray(me) ? me[0] : me;

        const bId = row ? getBandIdFromUser(row) : null;
        const admin = row ? isTruthyAdmin(row) : false;

        if (!cancelled) {
          setBandId(bId ? Number(bId) : null);
          setIsAdmin(!!admin);
        }
      } catch (err) {
        if (!cancelled) {
          setBandId(null);
          setIsAdmin(false);
        }
      }
    }

    loadMe();
    return () => {
      cancelled = true;
    };
  }, [isAuth, userId, token]);

  const bandManageTo = useMemo(() => {
    if (!isAuth) return null;
    return bandId ? `/bands/manage/${bandId}` : `/bands/create`;
  }, [isAuth, bandId]);

  const bandManageLabel = bandId ? "Manage band" : "Create band";

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
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
          {isAuth && bandManageTo && <Link to={bandManageTo}>{bandManageLabel}</Link>}
        </div>

        <div className="navbar-actions">
          {!isAuth ? (
            <>
              <Link to="/login" className="nav-btn nav-btn-outline">
                Log in
              </Link>
              <Link to="/signup" className="nav-btn nav-btn-filled">
                Sign up
              </Link>
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

          {/* ✅ Admin link */}
          {isAuth && isAdmin && (
            <Link to="/admin" className="nav-btn nav-btn-outline">
              Admin
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}