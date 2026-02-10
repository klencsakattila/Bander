import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import "./BandProfilePage.css";
import placeholder from "../../assets/images/default-avatar.png";
import eventBadge from "../../assets/images/event-badge.png";
import { getBandById, getLatestBandPosts } from "../../services/BandService";
import { useAuth } from "../../context/AuthContext";
import { formatISODate } from "../../utils/date";
import { useLoadById } from "../../hooks/useLoadById";

export default function BandProfilePage() {
  const { id } = useParams();
  const bandIdNum = Number(id);
  const { token } = useAuth();

  // ✅ Band load is now handled by hook
  const { data: band, loading, error } = useLoadById(id, getBandById);

  const [posts, setPosts] = useState([]);

  // demo fallback posts (depends on band name/id)
  const demoBandPosts = useMemo(() => {
    const bandName = band?.bandName ?? band?.name ?? band?.band_name ?? "Band";
    return [
      {
        id: 9001,
        band_id: bandIdNum,
        band_name: bandName,
        post_type: "announcement",
        post_message: "🎤 New gig coming soon! Follow us for the exact date + venue details.",
        created_at: new Date().toISOString(),
      },
      {
        id: 9002,
        band_id: bandIdNum,
        band_name: bandName,
        post_type: "search",
        post_message: "We’re looking for a new member! DM us if you want to join.",
        created_at: new Date(Date.now() - 86400000).toISOString(),
      },
    ];
  }, [bandIdNum, band]);

  useEffect(() => {
    let cancelled = false;

    async function loadPosts() {
      try {
        const postData = await getLatestBandPosts(20, token);
        const list = Array.isArray(postData) ? postData : [];
        if (cancelled) return;

        const onlyThisBand = list.filter((p) => Number(p?.band_id) === bandIdNum);
        setPosts(onlyThisBand.length ? onlyThisBand : demoBandPosts);
      } catch (e) {
        if (!cancelled) setPosts(demoBandPosts);
      }
    }

    // only load posts once we have a valid band id
    if (Number.isFinite(bandIdNum)) loadPosts();

    return () => {
      cancelled = true;
    };
  }, [token, bandIdNum, demoBandPosts]);

  if (loading) return <p style={{ padding: "40px" }}>Loading band...</p>;
  if (error) return <p style={{ padding: "40px", color: "red" }}>Band not found</p>;
  if (!band) return <p style={{ padding: "40px" }}>No band data.</p>;

  const bandTitle = band.bandName ?? band.name ?? band.band_name ?? "Band";
  const bandCity = band.bandLocation ?? band.city ?? band.location ?? "";

  return (
    <div className="band-profile-page">
      {/* Header */}
      <div className="band-header">
        <h1>{bandTitle}</h1>
      </div>

      {/* Top section */}
      <div className="band-top">
        {/* Band info */}
        <div className="band-info-card">
          <img src={placeholder} alt={bandTitle} />

          <div className="band-info-text">
            <h3>{bandTitle}</h3>
            <p>{bandCity}</p>
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
                {p.post_type} – {formatISODate(p.created_at)}
              </p>

              <p>{p.post_message}</p>
              <span>See more…</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
