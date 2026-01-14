import { useEffect, useState } from "react";
import "./HomePage.css";
import placeholder from "../assets/images/default-avatar.png";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import ArtistCard from "../components/common/NewArtistCard";
import { getUsersLimit } from "../services/UserService";
import { getAllBands, getLatestBandPosts } from "../services/BandService";

export default function HomePage() {
  const { token, isAuth } = useAuth();

  const [artists, setArtists] = useState([]);
  const [bands, setBands] = useState([]);
  const [posts, setPosts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");

        if (!isAuth) {
          // show demo if not logged in (optional)
          setArtists([]);
          setBands([]);
          setPosts([]);
          return;
        }

        const [usersData, bandsData, postsData] = await Promise.all([
          getUsersLimit(6, token),
          getAllBands(token),
          getLatestBandPosts(3, token),
        ]);

        setArtists(usersData);
        setBands(bandsData);
        setPosts(postsData);
      } catch (e) {
        setError(e.message || "Failed to load homepage data");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [token, isAuth]);

  if (loading) return <p style={{ padding: 40 }}>Loading homepage...</p>;
  if (error) return <p style={{ padding: 40, color: "red" }}>{error}</p>;

  return (
    <div className="homepage">
      <header className="homepage-hero">
        <h1>Bander - musician finder</h1>
        <p>
          Looking for a band? Or is your band missing a piece?<br />
          Bander connects musicians to make collaboration easy.
        </p>

        <Link to="/artists" className="hero-btn">Artist Finder</Link>
      </header>

      <section className="homepage-section">
        <h2>New Artists</h2>
        <div className="artists-grid">
          {artists.map((a) => (
            <ArtistCard
              key={a.id}
              id={a.id}
              image={placeholder}
              username={a.username || a.userName}
              description={`${a.first_name || a.firstName || ""} ${a.last_name || a.lastName || ""}`.trim() || "Artist"}
            />
          ))}
        </div>
      </section>

      <section className="homepage-section bands-section">
        <h2>Bands</h2>

        <div className="bands-layout">
          <div className="bands-list">
            {bands.slice(0, 6).map((band) => (
              <Link key={band.id} to={`/band/${band.id}`} className="band-link">
                <div className="band-item">
                  <h4>{band.bandName}</h4>
                  <p>Location: {band.bandLocation}</p>
                </div>
              </Link>
            ))}

            <Link to="/bands" className="see-all-btn">See all bands</Link>
          </div>

          <img className="band-image" src={placeholder} alt="Band" />
        </div>
      </section>

      <section className="homepage-section">
        <h2>Upcoming events</h2>

        <div className="events-grid">
          {posts.map((p) => (
            <div key={p.id} className="event-card">
              <h4>{p.TypeOfPost}</h4>
              <p>{p.PostMessage}</p>
              <p className="muted">{p.Time}</p>
              <Link to={`/band/${p.BandId}`} className="artist-link">See more…</Link>
            </div>
          ))}
        </div>
      </section>

      <section className="homepage-cta">
        <h2>For all features</h2>
        <div className="cta-actions">
          <Link to="/login" className="nav-btn nav-btn-filled">Log in</Link>
          <Link to="/signup" className="nav-btn nav-btn-outline">Sign up</Link>
        </div>
      </section>
    </div>
  );
}
