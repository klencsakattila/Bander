import { Link } from "react-router-dom";

export default function NewArtistCard({ image, username, description, id }) {
  return (
    <div className="artist-card">
      <img className="artist-image" src={image} alt={username} />

      <div className="artist-info">
        <h3 className="artist-name">{username}</h3>
        <p className="artist-description">{description}</p>

        <Link className="artist-link" to={`/artist/${id}`}>
          See more…
        </Link>
      </div>
    </div>
  );
}
