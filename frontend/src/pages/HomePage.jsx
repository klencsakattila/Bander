import './HomePage.css';
import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="home-container">
      <h1 className="home-title">Bander - musician finder</h1>

      <p className="home-subtitle">
        Looking for a band? Or is your band missing a piece?<br />
        Bander connects musicians to make collaboration easy.
      </p>

      <Link to="/artists" className="home-button">
        Artist Finder
      </Link>
    </div>
  );
}