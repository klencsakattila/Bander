import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./BandFinderPage.css";
import placeholder from "../../assets/images/default-avatar.png";
import { useAuth } from "../../context/AuthContext";
import { getAllBands } from "../../services/BandService";
import { useFilterOptions } from "../../hooks/useFilterOptions";
import { band as bandG } from "../../utils/fieldGetters";

export default function BandFinderPage() {
  const { token } = useAuth();
  const [bands, setBands] = useState([]);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ city: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await getAllBands(token);
        if (!cancelled) setBands(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!cancelled) setError(e?.message || "Failed to load bands");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => (cancelled = true);
  }, [token]);

  const opts = useFilterOptions(bands, { cities: bandG.city });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return bands.filter((b) => {
      const name = bandG.name(b).toLowerCase();
      const city = bandG.city(b);
      return (!q || name.includes(q)) && (!filters.city || String(city) === filters.city);
    });
  }, [bands, search, filters.city]);

  if (loading) return <p style={{ padding: 40 }}>Loading bands...</p>;
  if (error) return <p style={{ padding: 40, color: "red" }}>{error}</p>;

  return (
    <div className="band-finder-page">
      <div className="band-search">
        <input placeholder="Search for Bands" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="band-finder-layout">
        <aside className="band-filters">
          <label>City</label>
          <select value={filters.city} onChange={(e) => setFilters((p) => ({ ...p, city: e.target.value }))}>
            <option value="">All</option>
            {opts.cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </aside>

        <div className="band-grid">
          {filtered.map((b) => (
            <Link key={bandG.id(b)} to={`/band/${bandG.id(b)}`} className="band-card">
              <img src={placeholder} alt={bandG.name(b)} />
              <h4>{bandG.name(b)}</h4>
              <p className="muted">Location: {bandG.city(b)}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
