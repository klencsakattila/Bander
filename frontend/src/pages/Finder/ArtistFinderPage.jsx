import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./ArtistFinderPage.css";
import placeholder from "../../assets/images/default-avatar.png";
import { useAuth } from "../../context/AuthContext";
import { getUsersLimit } from "../../services/UserService";

export default function ArtistFinderPage() {
  const { token } = useAuth();

  const [artists, setArtists] = useState([]);

  // Filter options (from backend data)
  const [cities, setCities] = useState([]);
  const [instruments, setInstruments] = useState([]);
  const [genres, setGenres] = useState([]);
  const [bands, setBands] = useState([]);

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    city: "",
    instrument: "",
    genre: "",
    band: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ---- field helpers (snake_case + camelCase tolerant) ----
  const usernameOf = (u) => u?.username ?? u?.userName ?? "";
  const firstNameOf = (u) => u?.first_name ?? u?.firstName ?? "";
  const lastNameOf = (u) => u?.last_name ?? u?.lastName ?? "";
  const cityOf = (u) => u?.city ?? u?.City ?? "";

  // instruments can be string "guitar, drums" OR array ["guitar","drums"]
  const instrumentsOf = (u) => {
    const v =
      u?.instruments ??
      u?.Instruments ??
      u?.instrument ??
      u?.Instrument ??
      u?.played_instruments ??
      u?.playedInstruments ??
      [];

    if (Array.isArray(v)) return v.filter(Boolean).map(String);
    if (typeof v === "string")
      return v
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

    return [];
  };

  const genresOf = (u) => {
    const v = u?.genres ?? u?.Genres ?? u?.genre ?? u?.Genre ?? [];
    if (Array.isArray(v)) return v.filter(Boolean).map(String);
    if (typeof v === "string")
      return v
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    return [];
  };

  // Band: try to derive a display value from different shapes
  const bandOf = (u) => {
    // common possibilities:
    // u.band -> "My Band"
    // u.bandName -> "My Band"
    // u.band_name -> "My Band"
    // u.bandId -> 12 (id only - still filterable)
    const v = u?.band ?? u?.bandName ?? u?.band_name ?? u?.Band ?? u?.BandName ?? u?.bandId ?? u?.BandId ?? "";
    return v === null || v === undefined ? "" : String(v);
  };

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const data = await getUsersLimit(20, token);
        const list = Array.isArray(data) ? data : [];

        if (cancelled) return;

        setArtists(list);

        // Build filter options from BACKEND data
        const citySet = new Set();
        const instrumentSet = new Set();
        const genreSet = new Set();
        const bandSet = new Set();

        for (const u of list) {
          const c = cityOf(u);
          if (c) citySet.add(String(c));

          for (const inst of instrumentsOf(u)) instrumentSet.add(String(inst));
          for (const g of genresOf(u)) genreSet.add(String(g));

          const b = bandOf(u);
          if (b) bandSet.add(String(b));
        }

        setCities([...citySet].sort((a, b) => a.localeCompare(b)));
        setInstruments([...instrumentSet].sort((a, b) => a.localeCompare(b)));
        setGenres([...genreSet].sort((a, b) => a.localeCompare(b)));
        setBands([...bandSet].sort((a, b) => a.localeCompare(b)));
      } catch (e) {
        if (!cancelled) setError(e?.message || "Failed to load artists");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const filteredArtists = useMemo(() => {
    const q = search.trim().toLowerCase();

    return artists.filter((a) => {
      const cityOk = !filters.city || cityOf(a) === filters.city;

      const instList = instrumentsOf(a);
      const instrumentOk = !filters.instrument || instList.includes(filters.instrument);

      const genreList = genresOf(a);
      const genreOk = !filters.genre || genreList.includes(filters.genre);

      const bandVal = bandOf(a);
      const bandOk = !filters.band || bandVal === filters.band;

      const username = usernameOf(a);
      const fullName = `${firstNameOf(a)} ${lastNameOf(a)}`.trim();

      const searchHaystack = `${username} ${fullName} ${cityOf(a)} ${instList.join(" ")} ${genreList.join(" ")} ${bandVal}`.toLowerCase();
      const searchOk = !q || searchHaystack.includes(q);

      return cityOk && instrumentOk && genreOk && bandOk && searchOk;
    });
  }, [artists, search, filters.city, filters.instrument, filters.genre, filters.band]);

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
        {/* ✅ NO INLINE LAYOUT STYLES HERE — CSS controls the look */}
        <aside className="artist-filters">
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

          <label>Instrument(s)</label>
          <select
            value={filters.instrument}
            onChange={(e) => setFilters((p) => ({ ...p, instrument: e.target.value }))}
          >
            <option value="">All</option>
            {instruments.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>

          <label>Genre(s)</label>
          <select
            value={filters.genre}
            onChange={(e) => setFilters((p) => ({ ...p, genre: e.target.value }))}
          >
            <option value="">All</option>
            {genres.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>

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

          {/* Optional small info line (no extra layout changes) */}
          <p style={{ marginTop: 10, fontSize: 12, opacity: 0.8 }}>
            Showing {filteredArtists.length} / {artists.length}
          </p>
        </aside>

        <div className="artist-grid">
          {filteredArtists.map((artist) => {
            const username = usernameOf(artist);
            const fullName = `${firstNameOf(artist)} ${lastNameOf(artist)}`.trim();

            return (
              <Link key={artist.id} to={`/artist/${artist.id}`} className="artist-card">
                <img src={placeholder} alt={username || "artist"} />
                <h4>{username || "Unknown"}</h4>
                <p>{fullName || "Artist"}</p>
                <p>{cityOf(artist) || ""}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
