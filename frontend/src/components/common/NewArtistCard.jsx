import { useState } from "react";
import "./NewArtistCard.css";
import ReportModal from "./ReportModal";

export default function NewArtistCard({ id, image, username, description }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="artist-card artist-card--relative">
      <img src={image} alt={username} />

      <div className="artist-info">
        <h3>{username}</h3>
        <p>{description}</p>
      </div>

      <button className="tiny-btn" onClick={() => setOpen((v) => !v)}>
        Report
      </button>
    </div>
  );
}