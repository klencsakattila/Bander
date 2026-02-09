import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./ArtistFinderPage.css";
import placeholder from "../../assets/images/default-avatar.png";
import { useAuth } from "../../context/AuthContext";
import { getUsersLimit } from "../../services/UserService";
import { getAllGenres } from "../../services/GenreService";
import { getAllInstruments } from "../../services/InstrumentService";
import { useInfiniteList } from "../../hooks/useInfiniteList";
import { useFilterOptions } from "../../hooks/useFilterOptions";
import { user } from "../../utils/fieldGetters";

export default function ArtistFinderPage() {
  const { token } = useAuth();
  const LIMIT = 20;

  const fetchPage = useCallback(() => getUsersLimit(20, token), [token]);

  const { items: artists, loading, error, bottomRef, loadingMore, hasMore } =
    useInfiniteList({
      enabled: Boolean(token),
      fetchPage,
      getId: (u) => u?.id,
  });

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ city: "", instrument: "", genre: "", band: "" });
  const [genreList, setGenreList] = useState([]);
  const [instrumentList, setInstrumentList] = useState([]);
  const [filtersLoading, setFiltersLoading] = useState(true);

  // Fetch genres and instruments from backend
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setFiltersLoading(true);
        const [genres, instruments] = await Promise.all([
          getAllGenres(token),
          getAllInstruments(token),
        ]);
        if (!cancelled) {
          setGenreList(Array.isArray(genres) ? genres : []);
          setInstrumentList(Array.isArray(instruments) ? instruments : []);
        }
      } catch (e) {
        console.error("Failed to load filters:", e);
        if (!cancelled) {
          setGenreList([]);
          setInstrumentList([]);
        }
      } finally {
        if (!cancelled) setFiltersLoading(false);
      }
    })();
    return () => (cancelled = true);
  }, [token]);

  const opts = useFilterOptions(artists, {
    cities: user.city,
    bands: user.band,
  });

  // Extract genre and instrument names from backend data
  const genreNames = useMemo(() => {
    return genreList.map((g) => g?.name || g).filter(Boolean).sort();
  }, [genreList]);

  const instrumentNames = useMemo(() => {
    return instrumentList.map((i) => i?.name || i).filter(Boolean).sort();
  }, [instrumentList]);

  const filteredArtists = useMemo(() => {
    const q = search.trim().toLowerCase();

    return artists.filter((a) => {
      const cityOk = !filters.city || user.city(a) === filters.city;
      const inst = user.instruments(a);
      const instrumentOk = !filters.instrument || inst.includes(filters.instrument);
      const gen = user.genres(a);
      const genreOk = !filters.genre || gen.includes(filters.genre);
      const b = user.band(a);
      const bandOk = !filters.band || b === filters.band;

      const fullName = `${user.firstName(a)} ${user.lastName(a)}`.trim();
      const hay = `${user.username(a)} ${fullName} ${user.city(a)} ${inst.join(" ")} ${gen.join(" ")} ${b}`.toLowerCase();
      const searchOk = !q || hay.includes(q);

      return cityOk && instrumentOk && genreOk && bandOk && searchOk;
    });
  }, [artists, search, filters]);

  if (loading) return <p style={{ padding: 40 }}>Loading artists...</p>;
  if (error) return <p style={{ padding: 40, color: "red" }}>{error}</p>;

  return (
    <div className="artist-finder-page">
      <div className="artist-search">
        <input placeholder="Search for Artists" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="artist-finder-layout">
        <aside className="artist-filters">
          <label>City</label>
          <select value={filters.city} onChange={(e) => setFilters((p) => ({ ...p, city: e.target.value }))}>
            <option value="">All</option>
            {opts.cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <label>Instrument(s)</label>
          <select value={filters.instrument} onChange={(e) => setFilters((p) => ({ ...p, instrument: e.target.value }))}>
            <option value="">All</option>
            {instrumentNames.map((i) => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>

          <label>Genre(s)</label>
          <select value={filters.genre} onChange={(e) => setFilters((p) => ({ ...p, genre: e.target.value }))}>
            <option value="">All</option>
            {genreNames.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>

          <label>Band</label>
          <select value={filters.band} onChange={(e) => setFilters((p) => ({ ...p, band: e.target.value }))}>
            <option value="">All</option>
            {opts.bands.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>

          <p style={{ marginTop: 10, fontSize: 12, opacity: 0.8 }}>
            Showing {filteredArtists.length} / {artists.length} {!hasMore ? "(end)" : ""}
          </p>
        </aside>

        <div className="artist-grid">
          {filteredArtists.map((a) => {
            const fullName = `${user.firstName(a)} ${user.lastName(a)}`.trim();
            return (
              <Link key={user.id(a)} to={`/artist/${user.id(a)}`} className="artist-card">
                <img src={placeholder} alt={user.username(a) || "artist"} />
                <h4>{user.username(a) || "Unknown"}</h4>
                <p>{fullName || "Artist"}</p>
                <p>{user.city(a) || ""}</p>
              </Link>
            );
          })}

          <div ref={bottomRef} style={{ height: 1 }} />
          {loadingMore && <p style={{ padding: 20 }}>Loading more…</p>}
        </div>
      </div>
    </div>
  );
}
