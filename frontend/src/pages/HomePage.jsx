import { useEffect, useMemo, useState } from "react";
import "./HomePage.css";
import ArtistCard from "../components/common/NewArtistCard";
import placeholder from "../assets/images/default-avatar.png";
import { Link } from "react-router-dom";

import { getAllUsers } from "../services/UserService";
import { getAllBands, getLatestBandPosts } from "../services/BandService";
import EventCard from "../components/common/EventCard";

const FALLBACK_ARTISTS = [
  { id: 1, username: "alice", first_name: "Alice", last_name: "Smith", city: "Budapest" },
  { id: 2, username: "bob", first_name: "Bob", last_name: "Jones", city: "Debrecen" },
  { id: 3, username: "charlie", first_name: "Charlie", last_name: "Kovács", city: "Szeged" },
];

const FALLBACK_BANDS = [
  { id: 1, name: "The Rockets", city: "Budapest" },
  { id: 2, name: "Blue Notes", city: "Szeged" },
];

const FALLBACK_POSTS = [
  {
    id: 1,
    bandName: "The Rockets",
    eventName: "search",
    date: "—",
    description: "Looking for a bassist for weekend gigs.",
  },
  {
    id: 2,
    bandName: "Blue Notes",
    eventName: "announcement",
    date: "—",
    description: "We have a rehearsal this Friday.",
  },
  {
    id: 3,
    bandName: "Bander",
    eventName: "general",
    date: "—",
    description: "Welcome to the Bander community!",
  },
];

// helpers
const safeStr = (v) => (v ?? "").toString();
const pick = (...vals) => vals.find((v) => v !== undefined && v !== null && safeStr(v).length > 0);

export default function HomePage() {
  const [artists, setArtists] = useState([]);
  const [bands, setBands] = useState([]);
  const [posts, setPosts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [warnArtists, setWarnArtists] = useState("");
  const [warnBands, setWarnBands] = useState("");
  const [warnPosts, setWarnPosts] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);

      // run them independently so one failure doesn't kill the whole page
      const usersPromise = getAllUsers();
      const bandsPromise = getAllBands();
      const postsPromise = getLatestBandPosts(3);

      const [usersRes, bandsRes, postsRes] = await Promise.allSettled([
        usersPromise,
        bandsPromise,
        postsPromise,
      ]);

      if (cancelled) return;

      // ----- USERS -----
      if (usersRes.status === "fulfilled" && Array.isArray(usersRes.value)) {
        setWarnArtists("");
        setArtists(usersRes.value.slice(0, 3));
      } else {
        setWarnArtists("Artists could not be loaded (showing demo data).");
        setArtists(FALLBACK_ARTISTS.slice(0, 3));
      }

      // ----- BANDS -----
      if (bandsRes.status === "fulfilled" && Array.isArray(bandsRes.value)) {
        setWarnBands("");
        setBands(bandsRes.value.slice(0, 4));
      } else {
        setWarnBands("Bands could not be loaded (showing demo data).");
        setBands(FALLBACK_BANDS.slice(0, 4));
      }

      // ----- POSTS -----
      if (postsRes.status === "fulfilled" && Array.isArray(postsRes.value)) {
        setWarnPosts("");
        setPosts(postsRes.value);
      } else {
        setWarnPosts("Events could not be loaded (showing demo data).");
        setPosts(FALLBACK_POSTS.slice(0, 3));
      }

      setLoading(false);
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  // normalize data, components always get correct props
  const normalizedArtists = useMemo(() => {
    return (artists ?? []).map((a) => {
      const username = pick(a.userName, a.username, a.user_name, "Unknown");
      const firstName = pick(a.firstName, a.first_name, "");
      const lastName = pick(a.lastName, a.last_name, "");
      const city = pick(a.city, "");

      return {
        id: a.id,
        username,
        description: `${firstName} ${lastName}`.trim()
          ? `${firstName} ${lastName}`.trim() + (city ? ` from ${city}` : "")
          : city
          ? `From ${city}`
          : "—",
      };
    });
  }, [artists]);

  const normalizedBands = useMemo(() => {
    return (bands ?? []).map((b) => {
      const bandName = pick(b.bandName, b.name, b.band_name, `Band #${b.id}`);
      const bandLocation = pick(b.bandLocation, b.city, b.location, "—");
      return { id: b.id, bandName, bandLocation };
    });
  }, [bands]);

  const normalizedPosts = useMemo(() => {
    return (posts ?? []).map((p) => {
      // support both existing post shape and the fallback shape
      const bandName = pick(p.bandName, p.BandName, p.band_name, p.BandId ? `Band #${p.BandId}` : "—");
      const eventName = pick(p.eventName, p.TypeOfPost, p.post_type, "—");
      const date = pick(p.date, p.Time, p.created_at, "—");
      const description = pick(p.description, p.PostMessage, p.post_message, "—");

      return { id: p.id, bandName, eventName, date, description };
    });
  }, [posts]);

  return (
    <div className="homepage">
      {/* Hero Section */}
      <header className="homepage-hero">
        <h1>Bander - musician finder</h1>
        <p>
          Looking for a band? Or is your band missing a piece?<br />
          Bander connects musicians to make collaboration easy.
        </p>

        <Link to="/artists" className="hero-btn">
          Artist Finder
        </Link>
      </header>

      {/* Optional subtle loading text (structure still visible) */}
      {loading && (
        <div className="loading" style={{ marginBottom: 20 }}>
          <div className="spinner"></div>
          <p>Loading homepage…</p>
        </div>
      )}

      {/* New Artists Section */}
      <section className="homepage-section">
        <h2>New Artists</h2>
        {warnArtists && <p style={{ color: "#a05a00", marginTop: 6 }}>{warnArtists}</p>}

        <div className="artists-grid">
          {normalizedArtists.map((artist) => (
            <ArtistCard
              key={artist.id}
              id={artist.id}
              image={placeholder}
              username={artist.username}
              description={artist.description}
            />
          ))}
        </div>
      </section>

      {/* Bands Section */}
      <section className="homepage-section bands-section">
        <h2>Bands</h2>
        {warnBands && <p style={{ color: "#a05a00", marginTop: 6 }}>{warnBands}</p>}

        <div className="bands-layout">
          <div className="bands-list">
            {normalizedBands.map((band) => (
              <Link key={band.id} to={`/band/${band.id}`} className="band-link">
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
        {warnPosts && <p style={{ color: "#a05a00", marginTop: 6 }}>{warnPosts}</p>}

        <div className="events-grid">
          {normalizedPosts.map((post) => (
            <EventCard
              key={post.id}
              bandName={post.bandName}
              eventName={post.eventName}
              date={post.date}
              description={post.description}
            />
          ))}
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="homepage-cta">
        <h2>For all features</h2>

        <div className="cta-buttons">
          <Link to="/login" className="cta-login-btn">
            Log in
          </Link>
          <Link to="/signup" className="cta-signup-btn">
            Sign up
          </Link>
        </div>
      </section>
    </div>
  );
}
