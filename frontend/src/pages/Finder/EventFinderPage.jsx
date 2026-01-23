import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./EventFinderPage.css";
import placeholder from "../../assets/images/event-badge.png";
import { useAuth } from "../../context/AuthContext";
import { getLatestBandPosts } from "../../services/BandService";

// fallback demo posts (same shape as backend result)
const demoPosts = [
  {
    id: 1,
    band_id: 12,
    band_name: "Midnight Saffron",
    post_type: "announcement",
    post_message: "🎸 Friday show in Budapest! Doors 19:30, we start 20:00. Bring friends!",
    created_at: "2026-01-10T18:05:00.000Z",
  },
  {
    id: 2,
    band_id: 5,
    band_name: "Iron Veil",
    post_type: "search",
    post_message: "Looking for a drummer in Debrecen. Influences: Gojira, Mastodon, Tool.",
    created_at: "2026-01-09T12:40:00.000Z",
  },
  {
    id: 3,
    band_id: 7,
    band_name: "Blue Lantern Trio",
    post_type: "general",
    post_message: "New rehearsal recordings are up. DM if you want to collaborate on keys/synth.",
    created_at: "2026-01-08T20:15:00.000Z",
  },
];

export default function EventFinderPage() {
  const { token } = useAuth();

  const [posts, setPosts] = useState([]);

  const [bands, setBands] = useState([]);
  const [types, setTypes] = useState([]);

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    band: "",
    type: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // helpers (tolerant)
  const bandNameOf = (p) => p?.band_name ?? p?.bandName ?? p?.name ?? "";
  const typeOf = (p) => p?.post_type ?? p?.postType ?? "";
  const messageOf = (p) => p?.post_message ?? p?.postMessage ?? "";
  const createdAtOf = (p) => p?.created_at ?? p?.createdAt ?? "";

  const formatDate = (d) => {
    if (!d) return "";
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return String(d).slice(0, 10);
    return dt.toISOString().slice(0, 10);
  };

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const data = await getLatestBandPosts(20, token);
        const list = Array.isArray(data) ? data : [];

        if (cancelled) return;

        const finalList = list.length ? list : demoPosts;
        setPosts(finalList);

        // build filter lists from data
        const bandSet = new Set();
        const typeSet = new Set();

        for (const p of finalList) {
          const b = bandNameOf(p);
          const t = typeOf(p);
          if (b) bandSet.add(String(b));
          if (t) typeSet.add(String(t));
        }

        setBands([...bandSet].sort((a, b) => a.localeCompare(b)));
        setTypes([...typeSet].sort((a, b) => a.localeCompare(b)));
      } catch (e) {
        if (!cancelled) setError(e?.message || "Failed to load events");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const filteredPosts = useMemo(() => {
    const q = search.trim().toLowerCase();

    return posts.filter((p) => {
      const bandOk = !filters.band || bandNameOf(p) === filters.band;
      const typeOk = !filters.type || typeOf(p) === filters.type;

      const haystack = `${bandNameOf(p)} ${typeOf(p)} ${messageOf(p)} ${formatDate(createdAtOf(p))}`.toLowerCase();
      const searchOk = !q || haystack.includes(q);

      return bandOk && typeOk && searchOk;
    });
  }, [posts, search, filters.band, filters.type]);

  if (loading) return <p style={{ padding: 40 }}>Loading events...</p>;
  if (error) return <p style={{ padding: 40, color: "red" }}>{error}</p>;

  return (
    <div className="event-finder-page">
      <div className="event-search">
        <input
          type="text"
          placeholder="Search for Events"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="event-finder-layout">
        <aside className="event-filters">
          <label>Band</label>
          <select
            value={filters.band}
            onChange={(e) => setFilters((p) => ({ ...p, band: e.target.value }))}
          >
            <option value="">All</option>
            {bands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          <label>Post type</label>
          <select
            value={filters.type}
            onChange={(e) => setFilters((p) => ({ ...p, type: e.target.value }))}
          >
            <option value="">All</option>
            {types.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <p style={{ marginTop: 10, fontSize: 12, opacity: 0.8 }}>
            Showing {filteredPosts.length} / {posts.length}
          </p>
        </aside>

        <div className="event-grid">
          {filteredPosts.map((p) => {
            const bandName = bandNameOf(p) || "Unknown band";
            const postType = typeOf(p) || "general";
            const message = messageOf(p) || "";
            const created = formatDate(createdAtOf(p));

            // If you don't have a post details page yet, link to the band page
            const href = p?.band_id ? `/band/${p.band_id}` : "#";

            return (
              <Link key={p.id} to={href} className="event-card">
                <img className="event-cover" src={placeholder} alt={bandName} />

                <div className="event-info">
                  <h4 className="event-title">{bandName}</h4>

                  <div className="event-meta">
                    <span className={`event-pill ${postType}`}>{postType}</span>
                    <span className="event-date">{created}</span>
                  </div>

                  <p className="event-message">{message}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
