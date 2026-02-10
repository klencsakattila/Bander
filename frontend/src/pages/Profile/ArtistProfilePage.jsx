import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./ArtistProfilePage.css";
import avatar from "../../assets/images/default-avatar.png";
import { FaInstagram, FaFacebook, FaYoutube, FaSpotify } from "react-icons/fa";
import { getUserById } from "../../services/UserService";
import { useAuth } from "../../context/AuthContext";
import { normalizeStringArray } from "../../utils/normalize";
import { useLoadById } from "../../hooks/useLoadById";

export default function ArtistProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userId, isAuth } = useAuth();

  const { data: row, loading, error } = useLoadById(id, getUserById);

  // map backend → UI shape
  const artist = useMemo(() => {
    if (!row) return null;

    return {
      id: row.id,
      username: row.username,
      firstName: row.first_name,
      lastName: row.last_name,
      city: row.city,
      instruments: normalizeStringArray(row.instruments),
      styles: normalizeStringArray(row.styles),
      band: row.band ?? null,
    };
  }, [row]);

  function handleSendMessage() {
    if (!artist) return;

    if (!isAuth || !userId) {
      navigate("/login");
      return;
    }

    if (String(userId) === String(artist.id)) {
      alert("You can't message yourself.");
      return;
    }

    navigate(`/message/${artist.id}`);
  }

  if (loading) return <p style={{ padding: "40px" }}>Loading artist...</p>;
  if (error) return <p style={{ padding: "40px", color: "red" }}>{error}</p>;
  if (!artist) return <p style={{ padding: "40px" }}>No artist data.</p>;

  const displayUsername = artist.username ?? "Unknown";
  const displayName = [artist.firstName, artist.lastName].filter(Boolean).join(" ");

  return (
    <div className="artist-profile-page">
      {/* LEFT */}
      <div className="artist-profile-left">
        <div className="artist-card">
          <img src={avatar} alt={displayUsername} className="artist-avatar" />
          <h3 className="artist-username">{displayUsername}</h3>

          <p className="artist-meta">{displayName || "—"}</p>
          <p className="artist-meta">City: {artist.city || "—"}</p>

          <p className="artist-meta">
            Instrument(s):{" "}
            {artist.instruments.length ? artist.instruments.join(", ") : "—"}
          </p>

          <p className="artist-meta">
            Styles: {artist.styles.length ? artist.styles.join(", ") : "—"}
          </p>

          <p className="artist-meta">Band: {artist.band || "—"}</p>
        </div>

        <button className="send-message-btn" onClick={handleSendMessage}>
          Send a message
        </button>

        <div className="artist-links">
          <h4>Referral links</h4>
          <div className="social-icons">
            <FaSpotify />
            <FaInstagram />
            <FaFacebook />
            <FaYoutube />
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div className="artist-profile-right">
        <h3>Description</h3>
        <p className="artist-description">—</p>
      </div>
    </div>
  );
}
