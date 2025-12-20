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
        const data = await getUserById(id);
        setArtist(data);
      } catch (err) {
        setError("Artist not found");
      } finally {
        setLoading(false);
      }
    }

    loadArtist();
  }, [id]);

  if (loading) {
    return <p style={{ padding: "40px" }}>Loading artist...</p>;
  }

  if (error) {
    return <p style={{ padding: "40px", color: "red" }}>{error}</p>;
  }

  return (
    <div className="artist-profile-page">

      {/* LEFT */}
      <div className="artist-profile-left">
        <div className="artist-card">
          <img src={avatar} alt={artist.userName} className="artist-avatar" />

          <h3 className="artist-username">{artist.userName}</h3>

          <p className="artist-meta">
            {artist.firstName} {artist.lastName}
          </p>
          <p className="artist-meta">City: {artist.city}</p>
          <p className="artist-meta">Instrument(s): —</p>
          <p className="artist-meta">Band: —</p>
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
        <p className="artist-description">
          A long description about the artist.
        </p>
      </div>

    </div>
  );
}
