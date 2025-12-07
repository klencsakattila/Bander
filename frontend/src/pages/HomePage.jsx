import "./HomePage.css";
import ArtistCard from "../components/common/NewArtistCard";
import placeholder from "../assets/images/default-avatar.png"; // or your image
import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="homepage">

      {/* Hero / Title Section */}
      <header className="homepage-hero">
        <h1>Bander - musician finder</h1>
        <p>
          Looking for a band? Or is your band missing a piece?<br />
          Bander connects musicians to make collaboration easy.
        </p>

        <Link to="/artists" className="hero-btn">Artist Finder</Link>
      </header>


      {/* New Artists Section */}
      <section className="homepage-section">
        <h2>New Artists</h2>

        <div className="artists-grid">
          <ArtistCard
            image={placeholder}
            username="UserName"
            description="Description for the artist"
          />
          <ArtistCard
            image={placeholder}
            username="UserName"
            description="Description for the artist"
          />
          <ArtistCard
            image={placeholder}
            username="UserName"
            description="Description for the artist"
          />
        </div>
      </section>


      {/* Bands Section */}
      <section className="homepage-section bands-section">
        <h2>Bands</h2>

        <div className="bands-layout">

          <div className="bands-list">
            <div className="band-item">
              <h4>BandName</h4>
              <p>What type of artist are they looking for</p>
            </div>

            <div className="band-item">
              <h4>BandName</h4>
              <p>What type of artist are they looking for</p>
            </div>

            <div className="band-item">
              <h4>BandName</h4>
              <p>What type of artist are they looking for</p>
            </div>

            <div className="band-item">
              <h4>BandName</h4>
              <p>What type of artist are they looking for</p>
            </div>

            <Link to="/bands" className="see-all-btn">
              See all bands
            </Link>
          </div>

          <img className="band-image" src={placeholder} alt="Band" />
        </div>
      </section>

    </div>
  );
}
