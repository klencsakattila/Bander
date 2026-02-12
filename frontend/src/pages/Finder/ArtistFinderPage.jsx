import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./ArtistFinderPage.css";
import placeholder from "../../assets/images/default-avatar.png";
import { useAuth } from "../../context/AuthContext";
import { getUsersLimit, getUserById } from "../../services/UserService";
import { getAllGenres } from "../../services/GenreService";
import { getAllInstruments } from "../../services/InstrumentService";
import { useFilterOptions } from "../../hooks/useFilterOptions";
import { user } from "../../utils/fieldGetters";
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";
const toAbsUrl = (u) =>
  u && typeof u === "string" && u.startsWith("/uploads/")
    ? `${API_BASE}${u}`
    : u;


export default function ArtistFinderPage() {
  const { token } = useAuth();
  const LIMIT = 20;

  const [artists, setArtists] = useState([]);
  const [offset, setOffset] = useState(0);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    city: "",
    instrument: "",
    genre: "",
    band: "",
  });

  const [genreList, setGenreList] = useState([]);
  const [instrumentList, setInstrumentList] = useState([]);
  const [filtersLoading, setFiltersLoading] = useState(true);

  // 🔥 Track which users already hydrated
  const hydratedIdsRef = useRef(new Set());

  // ===============================
  // HYDRATE USERS (instrument/genre)
  // ===============================
  const hydrateUsers = useCallback(
    async (rows) => {
      if (!token || !rows?.length) return;

      const toHydrate = rows.filter((u) => {
        const id = user.id(u);
        return id && !hydratedIdsRef.current.has(id);
      });

      if (!toHydrate.length) return;

      toHydrate.forEach((u) => hydratedIdsRef.current.add(user.id(u)));

      try {
        const detailed = await Promise.all(
          toHydrate.map(async (u) => {
            const id = user.id(u);
            const data = await getUserById(id, token);
            const row = Array.isArray(data) ? data[0] : data;
            return row ? { id, row } : null;
          })
        );

        setArtists((prev) =>
          prev.map((u) => {
            const id = user.id(u);
            const found = detailed.find((x) => x?.id === id);
            if (!found) return u;

            const r = found.row;

            return {
              ...u,
              instruments: r?.instruments ?? u?.instruments,
              genres: r?.genres ?? r?.styles ?? r?.musical_styles ?? u?.genres,
              band: r?.band ?? u?.band,

              // ✅ profile picture from backend
              profile_image_url: r?.profile_image_url ?? u?.profile_image_url ?? "",
            };

          })
        );
      } catch (e) {
        console.error("Hydration failed:", e);
      }
    },
    [token]
  );

  // ===============================
  // LOAD FIRST PAGE
  // ===============================
  const loadFirstPage = useCallback(async () => {
    if (!token) return;

    try {
      setError("");
      setLoading(true);
      setHasMore(true);
      hydratedIdsRef.current.clear();

      const data = await getUsersLimit(LIMIT, 0, token);
      const rows = Array.isArray(data) ? data : [];

      setArtists(rows);
      setOffset(rows.length);
      setHasMore(rows.length === LIMIT);

      // 🔥 hydrate
      hydrateUsers(rows);
    } catch (e) {
      setError(e?.message || "Failed to load artists");
      setArtists([]);
      setOffset(0);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [token, hydrateUsers]);

  // ===============================
  // LOAD MORE
  // ===============================
  const loadMore = useCallback(async () => {
    if (!token || loadingMore || !hasMore) return;

    try {
      setError("");
      setLoadingMore(true);

      const data = await getUsersLimit(LIMIT, offset, token);
      const rows = Array.isArray(data) ? data : [];

      setArtists((prev) => {
        const seen = new Set(prev.map((u) => user.id(u)));
        const next = rows.filter((u) => !seen.has(user.id(u)));
        return [...prev, ...next];
      });

      setOffset((prev) => prev + rows.length);
      setHasMore(rows.length === LIMIT);

      // 🔥 hydrate new rows
      hydrateUsers(rows);
    } catch (e) {
      setError(e?.message || "Failed to load more artists");
    } finally {
      setLoadingMore(false);
    }
  }, [token, offset, hasMore, loadingMore, hydrateUsers]);

  // ===============================
  // INITIAL LOAD
  // ===============================
  useEffect(() => {
    loadFirstPage();
  }, [loadFirstPage]);

  // ===============================
  // LOAD FILTER DATA
  // ===============================
  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!token) return;
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

  // ===============================
  // FILTER OPTIONS
  // ===============================
  const opts = useFilterOptions(artists, {
    cities: user.city,
    bands: user.band,
  });

  const genreNames = useMemo(
    () => genreList.map((g) => g?.name || g).filter(Boolean).sort(),
    [genreList]
  );

  const instrumentNames = useMemo(
    () => instrumentList.map((i) => i?.name || i).filter(Boolean).sort(),
    [instrumentList]
  );

  // ===============================
  // FILTER LOGIC
  // ===============================
  const filteredArtists = useMemo(() => {
    const q = search.trim().toLowerCase();

    return artists.filter((a) => {
      const cityOk = !filters.city || user.city(a) === filters.city;

      const inst = user.instruments(a);
      const instrumentOk =
        !filters.instrument || inst.includes(filters.instrument);

      const gen = user.genres(a);
      const genreOk = !filters.genre || gen.includes(filters.genre);

      const b = user.band(a);
      const bandOk = !filters.band || b === filters.band;

      const fullName = `${user.firstName(a)} ${user.lastName(a)}`.trim();
      const hay = `${user.username(a)} ${fullName} ${user.city(a)} ${inst.join(
        " "
      )} ${gen.join(" ")} ${b}`.toLowerCase();

      const searchOk = !q || hay.includes(q);

      return cityOk && instrumentOk && genreOk && bandOk && searchOk;
    });
  }, [artists, search, filters]);


  // ===============================
  // RENDER
  // ===============================
  if (loading) return <p style={{ padding: 40 }}>Loading artists...</p>;
  if (error) return <p style={{ padding: 40, color: "red" }}>{error}</p>;

  return (
    <div className="artist-finder-page">
      <div className="artist-search">
        <input
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
            onChange={(e) =>
              setFilters((p) => ({ ...p, city: e.target.value }))
            }
          >
            <option value="">All</option>
            {opts.cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <label>Instrument(s)</label>
          <select
            value={filters.instrument}
            onChange={(e) =>
              setFilters((p) => ({ ...p, instrument: e.target.value }))
            }
            disabled={filtersLoading}
          >
            <option value="">All</option>
            {instrumentNames.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>

          <label>Genre(s)</label>
          <select
            value={filters.genre}
            onChange={(e) =>
              setFilters((p) => ({ ...p, genre: e.target.value }))
            }
            disabled={filtersLoading}
          >
            <option value="">All</option>
            {genreNames.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>

          <label>Band</label>
          <select
            value={filters.band}
            onChange={(e) =>
              setFilters((p) => ({ ...p, band: e.target.value }))
            }
          >
            <option value="">All</option>
            {opts.bands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          <p style={{ marginTop: 10, fontSize: 12, opacity: 0.8 }}>
            Showing {filteredArtists.length} / {artists.length}{" "}
            {!hasMore ? "(end)" : ""}
          </p>

          <button
            type="button"
            onClick={loadFirstPage}
            style={{ marginTop: 12 }}
          >
            Refresh list
          </button>
        </aside>

        <div>
          <div className="artist-grid">
            {filteredArtists.map((a) => {
              const fullName = `${user.firstName(a)} ${user.lastName(a)}`.trim();

              return (
                <Link
                  key={user.id(a)}
                  to={`/artist/${user.id(a)}`}
                  className="artist-card"
                >
                  <img
                    src={toAbsUrl(a?.profile_image_url) || placeholder}
                    alt={user.username(a) || "artist"}
                  />

                  <h4>{user.username(a) || "Unknown"}</h4>
                  <p>{fullName || "Artist"}</p>
                  <p>{user.city(a) || ""}</p>

                  {/* 🔥 Optional: show instruments & genres */}
                  <p className="muted">
                    {user.instruments(a).slice(0, 2).join(", ")}
                  </p>
                  <p className="muted">
                    {user.genres(a).slice(0, 2).join(", ")}
                  </p>
                </Link>
              );
            })}
          </div>

          <div style={{ padding: 20, display: "flex", justifyContent: "center" }}>
            {hasMore ? (
              <button
                type="button"
                onClick={loadMore}
                disabled={loadingMore}
              >
                {loadingMore ? "Loading..." : "Load more"}
              </button>
            ) : (
              <p style={{ opacity: 0.7 }}>No more artists.</p>
            )}
          </div>
        </div>
      </div>
    </div>
); }