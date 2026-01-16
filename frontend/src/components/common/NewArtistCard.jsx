export default function NewArtistCard({ image, username, description }) {
  return (
    <div className="artist-card">
      <img src={image} alt={username} />
      <div className="artist-info">
        <h3>{username}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}
