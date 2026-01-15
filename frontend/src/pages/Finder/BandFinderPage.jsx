import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./BandFinderPage.css";
import placeholder from "../../assets/images/default-avatar.png";
import { useAuth } from "../../context/AuthContext";
import { getAllBands } from "../../services/BandService";

export default function BandFinderPage() {
  const { token } = useAuth();

  const [bands, setBands] = useState([]);
  const [cities, setCities] = useState([]);

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ city: "" });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const data = await getAllBands(token);
        const list = Array.isArray(data) ? data : [];

        if (cancelled) return;

        setBands(list);

        const uniqueCities = [
          ...new Set(
            list
              .map((b) => b.bandLocation ?? b.city ?? b.location)
              .filter(Boolean)
              .map(String)
          ),
        ].sort((a, b) => a.localeCompare(b));

        setCities(uniqueCities);
      } catch (e) {
        if (!cancelled) setError(e.message || "Failed to load bands");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const filteredBands = useMemo(() => {
    const q = search.trim().toLowerCase();

    return bands.filter((b) => {
      const name = (b.bandName ?? b.name ?? "").toLowerCase();
      const loc = b.city;

      const nameOk = !q || name.includes(q);
      const cityOk = !filters.city || String(loc) === filters.city;

      return nameOk && cityOk;
    });
  }, [bands, search, filters.city]);

  if (loading) return <p style={{ padding: 40 }}>Loading bands...</p>;
  if (error) return <p style={{ padding: 40, color: "red" }}>{error}</p>;

  return (
    <div className="band-finder-page">
      <div className="band-search">
        <input
          type="text"
          placeholder="Search for Bands"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="band-finder-layout">
        <aside className="band-filters">
          <label>City</label>
          <select
            value={filters.city}
            onChange={(e) => setFilters((p) => ({ ...p, city: e.target.value }))}
          >
            <option value="">All</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </aside>

        <div className="band-grid">
          {filteredBands.map((band) => {
            const name = band.bandName ?? band.name ?? "Band";
            const loc = band.bandLocation ?? band.city ?? band.location ?? "";

            return (
              <Link key={band.id} to={`/band/${band.id}`} className="band-card">
                <img src={placeholder} alt={name} />
                <h4>{name}</h4>
                <p className="muted">Location: {loc}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
