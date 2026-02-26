import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./BandFinderPage.css";
import placeholder from "../../assets/images/default-avatar.png";
import { useAuth } from "../../context/AuthContext";
import { getBandsLimit } from "../../services/BandService";
import { useFilterOptions } from "../../hooks/useFilterOptions";
import { band as bandG } from "../../utils/fieldGetters";
import { pickMedia } from "../../utils/mediaUrl";
import ReportModal from "../../components/common/ReportModal";

const PAGE_SIZE = 10;

export default function BandFinderPage() {
  const { token } = useAuth();

  const [bands, setBands] = useState([]);
  const [offset, setOffset] = useState(0);

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ city: "" });

  const [loading, setLoading] = useState(true);      // initial load
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [error, setError] = useState("");

  const [reportOpen, setReportOpen] = useState(false);
  const [reportTargetId, setReportTargetId] = useState(null);

  function openReport(e, bandId) {
    e.preventDefault();
    e.stopPropagation();
    setReportTargetId(bandId);
    setReportOpen(true);
  }

  function closeReport() {
    setReportOpen(false);
    setReportTargetId(null);
  }

  async function loadFirstPage() {
    let cancelled = false;
    try {
      setError("");
      setLoading(true);
      setHasMore(true);
      setOffset(0);

      const data = await getBandsLimit(PAGE_SIZE, 0, token);
      const rows = Array.isArray(data) ? data : [];

      if (!cancelled) {
        setBands(rows);
        setHasMore(rows.length === PAGE_SIZE);
        setOffset(rows.length); // next offset
      }
    } catch (e) {
      if (!cancelled) setError(e?.message || "Failed to load bands");
    } finally {
      if (!cancelled) setLoading(false);
    }
    return () => (cancelled = true);
  }

  async function loadMore() {
    if (!hasMore || loadingMore) return;

    try {
      setError("");
      setLoadingMore(true);

      const data = await getBandsLimit(PAGE_SIZE, offset, token);
      const rows = Array.isArray(data) ? data : [];

      // avoid duplicates if backend returns overlapping data
      setBands((prev) => {
        const seen = new Set(prev.map((b) => bandG.id(b)));
        const next = rows.filter((b) => !seen.has(bandG.id(b)));
        return [...prev, ...next];
      });

      setHasMore(rows.length === PAGE_SIZE);
      setOffset((prev) => prev + rows.length);
    } catch (e) {
      setError(e?.message || "Failed to load more bands");
    } finally {
      setLoadingMore(false);
    }
  }

  useEffect(() => {
    // reset when token changes (login/logout)
    loadFirstPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        <input
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
            {opts.cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <button
            style={{ marginTop: 12 }}
            onClick={loadFirstPage}
            type="button"
          >
            Refresh
          </button>
        </aside>

        <div>
          <div className="band-grid">
            {filtered.map((b) => (
              <Link
                key={bandG.id(b)}
                to={`/band/${bandG.id(b)}`}
                className="band-card"
              >
                <img
                  src={
                    pickMedia(b, [
                      "profile_image_url",   // your real DB field
                      "avatar_url",
                      "avatarUrl",
                      "profile_image",
                      "profile_img",
                      "image",
                      "img",
                    ]) || placeholder
                  }
                  alt={bandG.name(b)}
                />

                <h4>{bandG.name(b)}</h4>
                <p className="muted">Location: {bandG.city(b)}</p>

                <button
                  type="button"
                  className="band-report-btn"
                  onClick={(e) => openReport(e, bandG.id(b))}
                >
                  Report
                </button>
              </Link>
            ))}
          </div>

          {/* Load more */}
          <div style={{ padding: "20px 0", display: "flex", justifyContent: "center" }}>
            {hasMore ? (
              <button onClick={loadMore} disabled={loadingMore} type="button">
                {loadingMore ? "Loading..." : "Load more"}
              </button>
            ) : (
              <p className="muted">No more bands.</p>
            )}
          </div>

          {reportOpen && reportTargetId && (
            <ReportModal
              targetType="band"
              targetId={reportTargetId}
              onClose={closeReport}
            />
          )}
        </div>
      </div>
    </div>
  );
}
