import { useEffect, useMemo, useState } from "react";
import "./AdminModerationPage.css";
import { useAuth } from "../../context/AuthContext";
import {
  getReports,
  updateReportStatus,
  deleteReport,
  deleteUserById,
  deleteBandById,
  deleteEventById,
} from "../../services/ModerationService";

const TABS = {
  QUEUE: "queue",
  ACTIONS: "actions",
};

function normalizeReportsPayload(payload) {
  // supports multiple backend shapes:
  // 1) [ ... ]
  // 2) { reports: [ ... ] }
  // 3) { data: [ ... ] }
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.reports)) return payload.reports;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function mapReport(r) {
  const id = r?.id ?? r?.report_id ?? r?.reportId;

  const status = r?.report_status ?? r?.status ?? "open";

  const createdAt = r?.createdAt ?? r?.created_at ?? r?.created ?? null;

  const subject =
    r?.subject ??
    r?.report_message ??
    r?.message ??
    (r?.reported_post_id
      ? "Post"
      : r?.reported_band_id
      ? "Band"
      : r?.reported_user_id
      ? "User"
      : "Report");

  const name =
    r?.reporter_name ??
    r?.reporterUsername ??
    r?.reporter_username ??
    r?.reporter?.username ??
    r?.reporter?.name ??
    r?.name ??
    "—";

  return {
    raw: r,
    id,
    status,
    createdAt,
    subject,
    name,
  };
}

export default function AdminModerationPage() {
  const { token } = useAuth();

  const [tab, setTab] = useState(TABS.QUEUE);

  const [stats, setStats] = useState({
    users: 0,
    bands: 0,
    reports: 0,
    events: 0,
  });

  // Queue
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reports, setReports] = useState([]);

  // Filters
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all"); // all | open | reviewing | resolved

  // Manual actions
  const [banUserId, setBanUserId] = useState("");
  const [banUserReason, setBanUserReason] = useState("");

  const [banBandId, setBanBandId] = useState("");
  const [banBandReason, setBanBandReason] = useState("");

  const [deleteEventId, setDeleteEventId] = useState("");
  const [deleteEventReason, setDeleteEventReason] = useState("");

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setLoading(true);
        setError("");

        if (!token) throw new Error("Missing token (admin auth required)");

        const payload = await getReports(token);
        const list = normalizeReportsPayload(payload).map(mapReport);

        if (!alive) return;

        setReports(list);
        setStats((prev) => ({
          ...prev,
          reports: list.length,
        }));
      } catch (e) {
        if (!alive) return;
        setError(String(e?.message || "Failed to load moderation data"));
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [token]);

  const filteredReports = useMemo(() => {
    const q = query.trim().toLowerCase();

    return reports.filter((r) => {
      const matchesQ =
        !q ||
        String(r.id ?? "").includes(q) ||
        (r.name || "").toLowerCase().includes(q) ||
        (r.subject || "").toLowerCase().includes(q);

      const matchesStatus = status === "all" ? true : r.status === status;
      return matchesQ && matchesStatus;
    });
  }, [reports, query, status]);

  async function handleResolve(reportId) {
    try {
      await updateReportStatus(reportId, "resolved", token);
      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, status: "resolved" } : r))
      );
    } catch (e) {
      alert(String(e?.message || "Failed to resolve report"));
    }
  }

  async function handleMarkReviewing(reportId) {
    try {
      await updateReportStatus(reportId, "reviewing", token);
      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, status: "reviewing" } : r))
      );
    } catch (e) {
      alert(String(e?.message || "Failed to update report status"));
    }
  }

  async function handleReject(reportId) {
    // backend doesn't support "rejected" status -> reject = delete
    try {
      await deleteReport(reportId, token);
      setReports((prev) => prev.filter((r) => r.id !== reportId));
      setStats((prev) => ({ ...prev, reports: Math.max(0, prev.reports - 1) }));
    } catch (e) {
      alert(String(e?.message || "Failed to reject/delete report"));
    }
  }

  async function submitBanUser(e) {
    e.preventDefault();
    if (!banUserId) return alert("UserID is required");

    try {
      await deleteUserById(banUserId, token);
      alert(`User ${banUserId} deleted`);
      setBanUserId("");
      setBanUserReason("");
    } catch (err) {
      alert(String(err?.message || "Failed to delete user"));
    }
  }

  async function submitBanBand(e) {
    e.preventDefault();
    if (!banBandId) return alert("BandID is required");

    try {
      await deleteBandById(banBandId, token);
      alert(`Band ${banBandId} deleted`);
      setBanBandId("");
      setBanBandReason("");
    } catch (err) {
      alert(String(err?.message || "Failed to delete band"));
    }
  }

  async function submitDeleteEvent(e) {
    e.preventDefault();
    if (!deleteEventId) return alert("EventID is required");

    try {
      await deleteEventById(deleteEventId, token);
      alert(`Event ${deleteEventId} deleted`);
      setDeleteEventId("");
      setDeleteEventReason("");
    } catch (err) {
      alert(String(err?.message || "Failed to delete event"));
    }
  }

  return (
    <div className="adm-shell">
      {/* Sidebar */}
      <aside className="adm-sidebar">
        <div className="adm-brand">
          <div className="adm-logo" />
          <div>
            <div className="adm-title">Admin</div>
            <div className="adm-subtitle">Dashboard</div>
          </div>
        </div>

        <nav className="adm-nav">
          <button className="adm-nav-item is-active" type="button">
            Moderation
          </button>
          <button className="adm-nav-item" type="button">
            Users
          </button>
          <button className="adm-nav-item" type="button">
            Bands
          </button>
          <button className="adm-nav-item" type="button">
            Events
          </button>
        </nav>

        <div className="adm-sidebar-foot">
          <div className="adm-hint">Tip</div>
          <div className="adm-hint-text">
            Use the queue for reports and the actions tab for manual admin tasks.
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="adm-main">
        <header className="adm-header">
          <div>
            <h1 className="adm-h1">Moderation Overview</h1>
            <p className="adm-p">
              Review reports, resolve issues, and run manual actions.
            </p>
          </div>

          <div className="adm-header-actions">
            <div className="adm-chip">Environment: Local</div>
            <button className="adm-btn adm-btn-ghost" type="button">
              Export
            </button>
          </div>
        </header>

        {/* Stats */}
        <section className="adm-stats">
          <StatCard label="Users" value={stats.users} />
          <StatCard label="Bands" value={stats.bands} />
          <StatCard label="Reports" value={stats.reports} accent />
          <StatCard label="Events" value={stats.events} />
        </section>

        {/* Tabs */}
        <section className="adm-tabs">
          <button
            type="button"
            className={`adm-tab ${tab === TABS.QUEUE ? "is-active" : ""}`}
            onClick={() => setTab(TABS.QUEUE)}
          >
            Moderation Queue
          </button>
          <button
            type="button"
            className={`adm-tab ${tab === TABS.ACTIONS ? "is-active" : ""}`}
            onClick={() => setTab(TABS.ACTIONS)}
          >
            Manual Actions
          </button>
        </section>

        {/* Queue */}
        {tab === TABS.QUEUE && (
          <section className="adm-card">
            <div className="adm-card-head">
              <div>
                <h2 className="adm-h2">Reports</h2>
                <p className="adm-muted">
                  Search, filter, and handle moderation reports.
                </p>
              </div>

              <div className="adm-filters">
                <input
                  className="adm-input"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by ID, name, subject..."
                />
                <select
                  className="adm-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="all">All statuses</option>
                  <option value="open">Open</option>
                  <option value="reviewing">Reviewing</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>

            {loading && <div className="adm-loading">Loading reports…</div>}
            {error && <div className="adm-error">{String(error)}</div>}

            {!loading && !error && (
              <div className="adm-table-wrap">
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Reporter</th>
                      <th>Subject</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th className="adm-th-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReports.map((r) => (
                      <tr key={r.id}>
                        <td className="adm-mono">#{r.id}</td>
                        <td>{r.name}</td>
                        <td>{r.subject}</td>
                        <td className="adm-muted">{r.createdAt || "—"}</td>
                        <td>
                          <StatusPill status={r.status} />
                        </td>
                        <td className="adm-td-right">
                          <div className="adm-row-actions">
                            <button
                              type="button"
                              className="adm-btn adm-btn-small"
                              disabled={r.status === "resolved"}
                              onClick={() => handleMarkReviewing(r.id)}
                            >
                              Reviewing
                            </button>
                            <button
                              type="button"
                              className="adm-btn adm-btn-small"
                              disabled={r.status === "resolved"}
                              onClick={() => handleResolve(r.id)}
                            >
                              Resolve
                            </button>
                            <button
                              type="button"
                              className="adm-btn adm-btn-ghost adm-btn-small"
                              onClick={() => handleReject(r.id)}
                            >
                              Reject (delete)
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {filteredReports.length === 0 && (
                      <tr>
                        <td colSpan={6} className="adm-empty">
                          No reports found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* Manual Actions */}
        {tab === TABS.ACTIONS && (
          <section className="adm-actions-grid">
            {/* Ban User */}
            <div className="adm-card">
              <div className="adm-card-head">
                <div>
                  <h2 className="adm-h2">Ban User</h2>
                  <p className="adm-muted">Delete a user account by ID.</p>
                </div>
              </div>

              <form className="adm-form" onSubmit={submitBanUser}>
                <div className="adm-form-row">
                  <div className="adm-form-group">
                    <label>UserID</label>
                    <input
                      className="adm-input"
                      value={banUserId}
                      onChange={(e) => setBanUserId(e.target.value)}
                      placeholder="e.g. 123"
                    />
                  </div>
                  <div className="adm-form-group">
                    <label>Reason</label>
                    <input
                      className="adm-input"
                      value={banUserReason}
                      onChange={(e) => setBanUserReason(e.target.value)}
                      placeholder="optional"
                    />
                  </div>
                </div>

                <button className="adm-btn" type="submit">
                  Ban User
                </button>
              </form>
            </div>

            {/* Ban Band */}
            <div className="adm-card">
              <div className="adm-card-head">
                <div>
                  <h2 className="adm-h2">Ban Band</h2>
                  <p className="adm-muted">Delete a band profile by ID.</p>
                </div>
              </div>

              <form className="adm-form" onSubmit={submitBanBand}>
                <div className="adm-form-row">
                  <div className="adm-form-group">
                    <label>BandID</label>
                    <input
                      className="adm-input"
                      value={banBandId}
                      onChange={(e) => setBanBandId(e.target.value)}
                      placeholder="e.g. 55"
                    />
                  </div>
                  <div className="adm-form-group">
                    <label>Reason</label>
                    <input
                      className="adm-input"
                      value={banBandReason}
                      onChange={(e) => setBanBandReason(e.target.value)}
                      placeholder="optional"
                    />
                  </div>
                </div>

                <button className="adm-btn" type="submit">
                  Ban Band
                </button>
              </form>
            </div>

            {/* Delete Event */}
            <div className="adm-card">
              <div className="adm-card-head">
                <div>
                  <h2 className="adm-h2">Delete Event</h2>
                  <p className="adm-muted">Remove an event by EventID.</p>
                </div>
              </div>

              <form className="adm-form" onSubmit={submitDeleteEvent}>
                <div className="adm-form-row">
                  <div className="adm-form-group">
                    <label>EventID</label>
                    <input
                      className="adm-input"
                      value={deleteEventId}
                      onChange={(e) => setDeleteEventId(e.target.value)}
                      placeholder="e.g. 999"
                    />
                  </div>
                  <div className="adm-form-group">
                    <label>Reason</label>
                    <input
                      className="adm-input"
                      value={deleteEventReason}
                      onChange={(e) => setDeleteEventReason(e.target.value)}
                      placeholder="optional"
                    />
                  </div>
                </div>

                <button className="adm-btn" type="submit">
                  Delete Event
                </button>
              </form>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div className={`adm-stat ${accent ? "is-accent" : ""}`}>
      <div className="adm-stat-label">{label}</div>
      <div className="adm-stat-value">{value}</div>
    </div>
  );
}

function StatusPill({ status }) {
  const cls =
    status === "resolved"
      ? "is-green"
      : status === "reviewing"
      ? "is-amber"
      : "is-gray";

  const text =
    status === "resolved"
      ? "Resolved"
      : status === "reviewing"
      ? "Reviewing"
      : "Open";

  return <span className={`adm-pill ${cls}`}>{text}</span>;
}
