import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./ArtistFinderPage.css";
import placeholder from "../../assets/images/default-avatar.png";
import { useAuth } from "../../context/AuthContext";
import { getUsersLimit } from "../../services/UserService";

export default function ArtistFinderPage() {
  const { token } = useAuth();

  const [artists, setArtists] = useState([]);
  const [cities, setCities] = useState([]);

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ city: "" });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");

        const data = await getUsersLimit(20, token); // max 20 from backend
        setArtists(data);

        const uniqueCities = [...new Set(data.map(u => u.city).filter(Boolean))].sort();
        setCities(uniqueCities);
      } catch (e) {
        setError(e.message || "Failed to load artists");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [token]);

  const filteredArtists = useMemo(() => {
    const q = search.trim().toLowerCase();
    return artists.filter((a) => {
      const name = (a.username || a.userName || "").toLowerCase();
      const cityOk = !filters.city || a.city === filters.city;
      const searchOk = !q || name.includes(q);
      return cityOk && searchOk;
    });
  }, [artists, search, filters.city]);

  if (loading) return <p style={{ padding: 40 }}>Loading artists...</p>;
  if (error) return <p style={{ padding: 40, color: "red" }}>{error}</p>;

  return (
    <div className="artist-finder-page">
      <div className="artist-search">
        <input
          type="text"
          placeholder="Search for Artists"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="artist-finder-layout">
        <aside className="artist-filters">
          <label>City</label>
          <select
            value={filters.city}
            onChange={(e) => setFilters((p) => ({ ...p, city: e.target.value }))}
          >
            <option value="">All</option>
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </aside>

        <div className="artist-grid">
          {filteredArtists.map((artist) => (
            <Link
              key={artist.id}
              to={`/artist/${artist.id}`}
              className="artist-card"
            >
              <img src={placeholder} alt={artist.username || artist.userName} />
              <h4>{artist.username || artist.userName}</h4>
              <p>{artist.first_name || artist.firstName} {artist.last_name || artist.lastName}</p>
              <p>{artist.city}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
