import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import "./BandProfilePage.css";
import placeholder from "../../assets/images/default-avatar.png";
import eventBadge from "../../assets/images/event-badge.png";
import { getBandById, getLatestBandPosts } from "../../services/BandService";
import { useAuth } from "../../context/AuthContext";

export default function BandProfilePage() {
  const { id } = useParams();
  const bandIdNum = Number(id);

  const { token } = useAuth();

  const [band, setBand] = useState(null);
  const [posts, setPosts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // demo fallback for the band page
  const demoBandPosts = useMemo(
    () => [
      {
        id: 9001,
        band_id: bandIdNum,
        band_name: band?.bandName ?? "Band",
        post_type: "announcement",
        post_message: "🎤 New gig coming soon! Follow us for the exact date + venue details.",
        created_at: new Date().toISOString(),
      },
      {
        id: 9002,
        band_id: bandIdNum,
        band_name: band?.bandName ?? "Band",
        post_type: "search",
        post_message: "We’re looking for a new member! DM us if you want to join.",
        created_at: new Date(Date.now() - 86400000).toISOString(),
      },
    ],
    [band?.bandName, bandIdNum]
  );

  useEffect(() => {
    let cancelled = false;

    async function loadBandAndPosts() {
      try {
        setLoading(true);
        setError("");

        const bandData = await getBandById(id);

        // fetch latest posts (band posts)
        // note: endpoint returns mixed bands, so we filter client-side
        const postData = await getLatestBandPosts(20, token);
        const list = Array.isArray(postData) ? postData : [];

        if (cancelled) return;

        setBand(bandData);

        const onlyThisBand = list.filter((p) => Number(p?.band_id) === bandIdNum);

        // if no posts exist for this band, show demo posts
        setPosts(onlyThisBand.length ? onlyThisBand : demoBandPosts);
      } catch (err) {
        console.error(err);
        if (!cancelled) setError("Band not found");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadBandAndPosts();

    return () => {
      cancelled = true;
    };
  }, [id, token, bandIdNum, demoBandPosts]);

  const formatDate = (d) => {
    if (!d) return "";
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return String(d).slice(0, 10);
    return dt.toISOString().slice(0, 10);
  };

  if (loading) {
    return <p style={{ padding: "40px" }}>Loading band...</p>;
  }

  if (error) {
    return <p style={{ padding: "40px", color: "red" }}>{error}</p>;
  }

  return (
    <div className="band-profile-page">
      {/* Header */}
      <div className="band-header">
        <h1>{band.band_name}</h1>
      </div>

      {/* Top section */}
      <div className="band-top">
        {/* Band info */}
        <div className="band-info-card">
          <img src={placeholder} alt={band.bandName} />

          <div className="band-info-text">
            <h3>{band.name}</h3>
            <p>{band.city}</p>
            <p>Instrument(s): —</p>
            <p>Genre(s): —</p>
            <p>Open spots: —</p>
          </div>
        </div>

        {/* Application */}
        <div className="band-apply">
          <h4>Application for a role</h4>

          <input type="text" placeholder="Name" />
          <input type="text" placeholder="Instrument(s)" />

          <button>Send Application</button>
        </div>
      </div>

      {/* Bottom */}
      <div className="band-bottom">
        {/* Members */}
        <div className="band-members">
          <h4>Current members</h4>
          <ul>
            <li>Member – Instrument</li>
            <li>Member – Instrument</li>
          </ul>
        </div>

        {/* Events / Posts */}
        <div className="band-events">
          {posts.map((p) => (
            <div key={p.id} className="event-card">
              <img src={eventBadge} alt="Event" />

              <p>
                 {p.post_type} – {formatDate(p.created_at)}
              </p>

              <p>{p.post_message}</p>

              {/* optional: link later to a post detail page */}
              <span>See more…</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
