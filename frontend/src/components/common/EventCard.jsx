import "./EventCard.css";
import eventBadge from "../../assets/images/event-badge.png"; // or your image

export default function EventCard({ bandName, eventName, date, description }) {
  return (
    <div className="event-card">
      <img src={eventBadge} alt="Upcoming Event" className="event-image" />

      <h4 className="event-title">
        {bandName} – {eventName} – {date}
      </h4>

      <p className="event-description">{description}</p>

      <a href="#" className="event-link">
        See more…
      </a>
    </div>
  );
}
