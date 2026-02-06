import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./EventFinderPage.css";
import placeholder from "../../assets/images/event-badge.png";
import { useAuth } from "../../context/AuthContext";
import { getLatestBandPosts } from "../../services/BandService";
import { useFilterOptions } from "../../hooks/useFilterOptions";
import { formatISODate, post } from "../../utils/fieldGetters";

export default function EventFinderPage() {
  const { token } = useAuth();

  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ band: "", type: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await getLatestBandPosts(20, token);
        const list = Array.isArray(data) ? data : [];
        if (!cancelled) setPosts(list.length ? list : demoPosts);
      } catch (e) {
        if (!cancelled) setError(e?.message || "Failed to load events");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => (cancelled = true);
  }, [token]);

  const opts = useFilterOptions(posts, { bands: post.bandName, types: post.type });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return posts.filter((p) => {
      const bandOk = !filters.band || post.bandName(p) === filters.band;
      const typeOk = !filters.type || post.type(p) === filters.type;
      const hay = `${post.bandName(p)} ${post.type(p)} ${post.message(p)} ${formatISODate(post.createdAt(p))}`.toLowerCase();
      const searchOk = !q || hay.includes(q);
      return bandOk && typeOk && searchOk;
    });
  }, [posts, search, filters]);

  if (loading) return <p style={{ padding: 40 }}>Loading events...</p>;
  if (error) return <p style={{ padding: 40, color: "red" }}>{error}</p>;

  return (
    <div className="event-finder-page">
      <div className="event-search">
        <input placeholder="Search for Events" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="event-finder-layout">
        <aside className="event-filters">
          <label>Band</label>
          <select value={filters.band} onChange={(e) => setFilters((p) => ({ ...p, band: e.target.value }))}>
            <option value="">All</option>
            {opts.bands.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>

          <label>Post type</label>
          <select value={filters.type} onChange={(e) => setFilters((p) => ({ ...p, type: e.target.value }))}>
            <option value="">All</option>
            {opts.types.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <p style={{ marginTop: 10, fontSize: 12, opacity: 0.8 }}>
            Showing {filtered.length} / {posts.length}
          </p>
        </aside>

        <div className="event-grid">
          {filtered.map((p) => {
            const bandName = post.bandName(p) || "Unknown band";
            const postType = post.type(p) || "general";
            const created = formatISODate(post.createdAt(p));
            const href = post.bandId(p) ? `/band/${post.bandId(p)}` : "#";

            return (
              <Link key={post.id(p)} to={href} className="event-card">
                <img className="event-cover" src={placeholder} alt={bandName} />
                <div className="event-info">
                  <h4 className="event-title">{bandName}</h4>
                  <div className="event-meta">
                    <span className={`event-pill ${postType}`}>{postType}</span>
                    <span className="event-date">{created}</span>
                  </div>
                  <p className="event-message">{post.message(p)}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
