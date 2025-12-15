import { useEffect, useState } from "react";
import "./HomePage.css";
import ArtistCard from "../components/common/NewArtistCard";
import placeholder from "../assets/images/default-avatar.png";
import { Link } from "react-router-dom";

// services
import { getAllUsers } from "../services/UserService";
import { getAllBands, getLatestBandPosts } from "../services/BandService";
import EventCard from "../components/common/EventCard";

export default function HomePage() {
  const [artists, setArtists] = useState([]);
  const [bands, setBands] = useState([]);
  const [posts, setPosts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [userData, bandData, postData] = await Promise.all([
          getAllUsers(),
          getAllBands(),
          getLatestBandPosts(3) // latest 3 posts
        ]);

        setArtists(userData.slice(0, 3)); // newest users
        setBands(bandData.slice(0, 4));   // first 4 bands
        setPosts(postData);

      } catch (err) {
        setError("Failed to load homepage data.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="homepage">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading homepage…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="homepage">
        <div className="error-box">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="homepage">

      {/* Hero Section */}
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
          {artists.map((artist) => (
            <ArtistCard
              key={artist.id}
              id={artist.id}
              image={placeholder}
              username={artist.userName}
              description={`${artist.firstName} ${artist.lastName} from ${artist.city}`}
            />
          ))}
        </div>
      </section>


      {/* Bands Section */}
      <section className="homepage-section bands-section">
        <h2>Bands</h2>

        <div className="bands-layout">
          <div className="bands-list">
            {bands.map((band) => (
              <Link
                key={band.id}
                to={`/band/${band.id}`}
                className="band-link"
              >
                <div className="band-item">
                  <h4>{band.bandName}</h4>
                  <p>Location: {band.bandLocation}</p>
                </div>
              </Link>
            ))}

            <Link to="/bands" className="see-all-btn">
              See all bands
            </Link>
          </div>

          <img className="band-image" src={placeholder} alt="Band" />
        </div>
      </section>



      {/* Events / Posts Section */}
      <section className="homepage-section">
        <h2>Upcoming events</h2>

        <div className="events-grid">
          {posts.map((post) => (
            <EventCard
              key={post.id}
              bandName={`Band #${post.BandId}`}
              eventName={post.TypeOfPost}
              date={post.Time}
              description={post.PostMessage}
            />
          ))}
        </div>
      </section>

      
      {/* Bottom CTA Section */}
      <section className="homepage-cta">
        <h2>For all features</h2>

        <div className="cta-buttons">
          <Link to="/login" className="cta-login-btn">Log in</Link>
          <Link to="/signup" className="cta-signup-btn">Sign up</Link>
        </div>
      </section>


    </div>
  );
}
