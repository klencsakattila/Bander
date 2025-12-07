import "./NewArtistCard.css";

export default function NewArtistCard({ image, username, description }) {
  return (
    <div className="artist-card">
      <img className="artist-image" src={image} alt={username} />

      <div className="artist-info">
        <h3 className="artist-name">{username}</h3>
        <p className="artist-description">{description}</p>

        <a className="artist-link" href="#" to={'/artist/' + username}>
          See more…
        </a>
      </div>
    </div>
  );
}
