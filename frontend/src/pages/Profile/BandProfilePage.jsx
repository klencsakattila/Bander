import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./BandProfilePage.css";
import placeholder from "../../assets/images/default-avatar.png";
import eventBadge from "../../assets/images/event-badge.png";
import { getBandById } from "../../services/BandService";

export default function BandProfilePage() {
  const { id } = useParams();

  const [band, setBand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadBand() {
      try {
        const data = await getBandById(id);
        setBand(data);
      } catch (err) {
        setError("Band not found");
      } finally {
        setLoading(false);
      }
    }

    loadBand();
  }, [id]);

  if (loading) {
    return <p style={{ padding: "40px" }}>Loading band...</p>;
  }

  if (error) {
    return <p style={{ padding: "40px", color: "red" }}>{error}</p>;
  }

  return (
    <div className="band-profile-page">

      {/* Header */}
      <div className="band-header">
        <h1>{band.bandName}</h1>
      </div>

      {/* Top section */}
      <div className="band-top">

        {/* Band info */}
        <div className="band-info-card">
          <img src={placeholder} alt={band.bandName} />

          <div className="band-info-text">
            <h3>{band.bandName}</h3>
            <p>{band.bandLocation}</p>
            <p>Instrument(s): —</p>
            <p>Genre(s): —</p>
            <p>Open spots: —</p>
          </div>
        </div>

        {/* Application */}
        <div className="band-apply">
          <h4>Application for a role</h4>

          <input type="text" placeholder="Name" />
          <input type="text" placeholder="Instrument(s)" />

          <button>Send Application</button>
        </div>

      </div>

      {/* Bottom */}
      <div className="band-bottom">

        {/* Members */}
        <div className="band-members">
          <h4>Current members</h4>
          <ul>
            <li>Member – Instrument</li>
            <li>Member – Instrument</li>
          </ul>
        </div>

        {/* Events */}
        <div className="band-events">
          <div className="event-card">
            <img src={eventBadge} alt="Event" />
            <p>{band.bandName} – Event – Date</p>
            <p>Description of the event.</p>
            <span>See more…</span>
          </div>
        </div>

      </div>
    </div>
  );
}
