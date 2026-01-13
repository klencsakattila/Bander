import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./ArtistFinderPage.css";
import placeholder from "../../assets/images/default-avatar.png";
import { getUsersTemp } from "../../services/UserService";

export default function ArtistFinderPage() {
  const [artists, setArtists] = useState([]);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    city: "",
    instrument: "",
    genre: "",
    band: "",
  });
  const [loading, setLoading] = useState(true);
  
  const [cities, setCities] = useState([]);
  const [instruments, setInstruments] = useState([]);
  const [genres, setGenres] = useState([]);
  const [bands, setBands] = useState([]);

  useEffect(() => {
    async function loadArtists() {
      try {
        const data = await getUsersTemp();

        // normalize fields so UI never crashes on undefined
        const safeArtists = (data ?? [])
          .filter(Boolean)
          .map((artist) => ({
            ...artist,
            city: artist?.city ?? "",
            username: artist?.username ?? "",
            userName: artist?.userName ?? artist?.username ?? "",
            firstName: artist?.firstName ?? "",
            lastName: artist?.lastName ?? "",
            description: artist?.description ?? artist?.bio ?? "",
            // instruments might be string or array depending on future backend
            instruments: artist?.instruments ?? artist?.instrument ?? "",
            band: artist?.bandName ?? artist?.band ?? "",
          }));

        setArtists(safeArtists);

        const uniqueCities = [
          ...new Set(
            safeArtists
              .map((a) => (a.city ?? "").toString().trim())
              .filter((c) => c.length > 0)
          ),
        ];
        console.log("Unique Cities:", uniqueCities);

        const uniqueInstruments = [
          ...new Set(
            safeArtists
              .map((a) => (a.instruments ?? "").toString().trim())
              .filter((i) => i.length > 0)
          ),
        ];
        console.log("Unique Instruments:", uniqueInstruments);

        const uniqueGenres = [
          ...new Set(
            safeArtists
              .map((a) => (a.genre ?? "").toString().trim())
              .filter((g) => g.length > 0)
          ),
        ];

        const uniqueBands = [
          ...new Set(
            safeArtists
              .map((a) => (a.band ?? "").toString().trim())
              .filter((b) => b.length > 0)
          ),
        ];

        setCities(uniqueCities);
        setInstruments(uniqueInstruments);
        setGenres(uniqueGenres);
        setBands(uniqueBands);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadArtists();
  }, []);

  const lower = (v) => (v ?? "").toString().toLowerCase();

  const filteredArtists = artists.filter((artist) => {
  const nameMatch = lower(artist.userName || artist.username).includes(lower(search));

  const cityMatch =
    !filters.city || (artist.city ?? "") === filters.city;

  const instrumentMatch =
    !filters.instrument ||
    lower(
      Array.isArray(artist.instruments)
        ? artist.instruments.join(" ")
        : artist.instruments
    ).includes(lower(filters.instrument));

  const genreMatch =
    !filters.genre ||
    lower(
      Array.isArray(artist.genres)
        ? artist.genres.join(" ")
        : artist.genre
    ).includes(lower(filters.genre));

  const bandMatch =
    !filters.band ||
    lower(artist.band).includes(lower(filters.band));

  return nameMatch && cityMatch && instrumentMatch && genreMatch && bandMatch;
});

  if (loading) {
    return <p style={{ padding: "40px" }}>Loading artists...</p>;
  }

  return (
    <div className="artist-finder-page">
      {/* SEARCH */}
      <div className="artist-search">
        <input
          type="text"
          placeholder="Search for Artists"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="artist-finder-layout">
        {/* FILTERS */}
        <aside className="artist-filters">
          <label>City</label>
          <select
            value={filters.city}
            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
          >
            <option value="">All</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>

          <label>Instrument(s)</label>
          <select value={filters.instrument} onChange={(e) => setFilters({ ...filters, instrument: e.target.value })}>
            <option value="">All</option>
            {instruments.map((inst) => (
              <option key={inst} value={inst}>
                {inst}
              </option>
            ))}
          </select>

          <label>Genre(s)</label>
          <select value={filters.genre} onChange={(e) => setFilters({ ...filters, genre: e.target.value })}>
            <option value="">All</option>
            {genres.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>

          <label>Band</label>
          <select value={filters.band} onChange={(e) => setFilters({ ...filters, band: e.target.value })}>
            <option value="">All</option>
            {bands.map((band) => (
              <option key={band} value={band}>
                {band}
              </option>
            ))}
          </select>
        </aside>

        {/* RESULTS */}
        <div className="artist-grid">
          {filteredArtists.map((artist) => {
            const username = artist.userName || artist.username || "Unknown";
            const fullName = [artist.firstName, artist.lastName].filter(Boolean).join(" ");

            const instruments = Array.isArray(artist.instruments)
              ? artist.instruments.filter(Boolean).join(", ")
              : (artist.instruments ?? "").toString();

            return (
              <Link to={`/artist/${artist.id}`} key={artist.id} className="artist-card">
                <img className="artist-avatar" src={placeholder} alt={username} />

                <div className="artist-info">
                  <h4 className="artist-username">{username}</h4>

                  {fullName && <p className="artist-line">{fullName}</p>}
                  {artist.description && <p className="artist-line">{artist.description}</p>}
                  {instruments && <p className="artist-line">{instruments}</p>}
                  {artist.city && <p className="artist-line">{artist.city}</p>}
                  {artist.band && <p className="artist-line">{artist.band}</p>}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
