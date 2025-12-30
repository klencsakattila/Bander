import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./BandFinderPage.css";
import placeholder from "../../assets/images/default-avatar.png";
import { getAllBands } from "../../services/BandService";

export default function BandFinderPage() {
  const [bands, setBands] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  // All filters (as requested)
  const [filters, setFilters] = useState({
    city: "",
    instrumentNeeded: "",
    genre: "",
  });

  // Filter options populated from backend data
  const [cities, setCities] = useState([]);
  const [instrumentsNeeded, setInstrumentsNeeded] = useState([]);
  const [genres, setGenres] = useState([]);

  useEffect(() => {
    async function loadBands() {
      try {
        const data = await getAllBands();
        setBands(data);

        // Cities from bandLocation
        const uniqueCities = [
          ...new Set(data.map((b) => b.bandLocation).filter(Boolean)),
        ].sort((a, b) => a.localeCompare(b));
        setCities(uniqueCities);

        // These depend on your backend band shape.
        // If later you add fields like:
        // b.instrumentsNeeded (string[] or string) and b.genres (string[] or string)
        // then these will auto-populate.

        const extractToArray = (value) => {
          if (!value) return [];
          if (Array.isArray(value)) return value;
          // Allow comma-separated string
          if (typeof value === "string") {
            return value
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean);
          }
          return [];
        };

        const uniqueInstruments = [
          ...new Set(
            data.flatMap((b) => extractToArray(b.instrumentsNeeded || b.instrumentNeeded))
          ),
        ].sort((a, b) => a.localeCompare(b));
        setInstrumentsNeeded(uniqueInstruments);

        const uniqueGenres = [
          ...new Set(data.flatMap((b) => extractToArray(b.genres || b.genre))),
        ].sort((a, b) => a.localeCompare(b));
        setGenres(uniqueGenres);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadBands();
  }, []);

  const filteredBands = useMemo(() => {
    const q = search.trim().toLowerCase();

    return bands.filter((band) => {
      const name = (band.bandName || "").toLowerCase();
      const location = band.bandLocation || "";

      // optional fields
      const instruments = Array.isArray(band.instrumentsNeeded)
        ? band.instrumentsNeeded
        : typeof band.instrumentsNeeded === "string"
          ? band.instrumentsNeeded.split(",").map((s) => s.trim())
          : [];

      const bandGenres = Array.isArray(band.genres)
        ? band.genres
        : typeof band.genres === "string"
          ? band.genres.split(",").map((s) => s.trim())
          : [];

      const matchesSearch = !q || name.includes(q);
      const matchesCity = !filters.city || location === filters.city;

      const matchesInstrument =
        !filters.instrumentNeeded ||
        instruments.some((i) => i.toLowerCase() === filters.instrumentNeeded.toLowerCase());

      const matchesGenre =
        !filters.genre ||
        bandGenres.some((g) => g.toLowerCase() === filters.genre.toLowerCase());

      return matchesSearch && matchesCity && matchesInstrument && matchesGenre;
    });
  }, [bands, search, filters]);

  if (loading) {
    return <p style={{ padding: "40px" }}>Loading bands...</p>;
  }

  return (
    <div className="band-finder-page">
      {/* Search */}
      <div className="band-search">
        <input
          type="text"
          placeholder="Search for Bands"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="search-icon">🔍</span>
      </div>

      <div className="band-finder-layout">
        {/* Filters */}
        <aside className="band-filters">
          <label>City</label>
          <select
            value={filters.city}
            onChange={(e) => setFilters((prev) => ({ ...prev, city: e.target.value }))}
          >
            <option value="">All</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>

          <label>Instrument(s) needed</label>
          <select
            value={filters.instrumentNeeded}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, instrumentNeeded: e.target.value }))
            }
          >
            <option value="">All</option>
            {instrumentsNeeded.length === 0 ? (
              <option value="" disabled>
                (No data from backend)
              </option>
            ) : (
              instrumentsNeeded.map((inst) => (
                <option key={inst} value={inst}>
                  {inst}
                </option>
              ))
            )}
          </select>

          <label>Genre(s)</label>
          <select
            value={filters.genre}
            onChange={(e) => setFilters((prev) => ({ ...prev, genre: e.target.value }))}
          >
            <option value="">All</option>
            {genres.length === 0 ? (
              <option value="" disabled>
                (No data from backend)
              </option>
            ) : (
              genres.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))
            )}
          </select>
        </aside>

        {/* Results */}
        <div className="band-grid">
          {filteredBands.map((band) => (
            <Link key={band.id} to={`/band/${band.id}`} className="band-card">
              <img src={placeholder} alt={band.bandName} />

              <h4>{band.bandName}</h4>
              <p className="muted">Description for the band</p>

              {/* These will show real values once backend provides them */}
              <p className="muted">Instrument(s)</p>
              <p className="muted">Genre(s)</p>
              <p className="muted">open spots</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
