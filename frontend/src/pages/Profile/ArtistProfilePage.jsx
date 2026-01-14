import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./ArtistProfilePage.css";
import avatar from "../../assets/images/default-avatar.png";
import { FaInstagram, FaFacebook, FaYoutube, FaSpotify } from "react-icons/fa";
import { getUserById } from "../../services/UserService";

export default function ArtistProfilePage() {
  const { id } = useParams();

  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadArtist() {
      try {
        setLoading(true);
        setError("");

        // use the clicked id from URL
        const data = await getUserById(id);

        // backend sends ARRAY (SELECT result), unwrap it
        const row = Array.isArray(data) ? data[0] : data;

        if (!row) {
          throw new Error("Artist not found");
        }

        const mapped = {
          id: row.id,
          username: row.username,
          email: row.email,
          firstName: row.first_name,
          lastName: row.last_name,
          city: row.city,
          birthDate: row.birth_date,
          createdAt: row.created_at,
        };

        setArtist(mapped);
      } catch (err) {
        console.error(err);
        setError("Artist not found");
        setArtist(null);
      } finally {
        setLoading(false);
      }
    }

    if (id) loadArtist();
  }, [id]);

  if (loading) {
    return <p style={{ padding: "40px" }}>Loading artist...</p>;
  }

  if (error) {
    return <p style={{ padding: "40px", color: "red" }}>{error}</p>;
  }

  if (!artist) {
    return <p style={{ padding: "40px" }}>No artist data.</p>;
  }

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
          <p className="artist-meta">Instrument(s): {artist.instruments || "—"}</p>
          <p className="artist-meta">Band: {artist.band || "—"}</p>
        </div>

        <button className="send-message-btn">Send a message</button>

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
