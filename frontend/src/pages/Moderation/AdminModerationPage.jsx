import { useEffect, useMemo, useState } from "react";
import "./AdminModerationPage.css";

// OPTIONAL: swap to your actual services
// import { getReports, resolveReport, banUser, banBand, deletePost, getAdminStats } from "../../services/ModerationService";
import { useAuth } from "../../context/AuthContext";

const TABS = {
  QUEUE: "queue",
  ACTIONS: "actions",
};

export default function AdminModerationPage() {
  const { token } = useAuth();

  const [tab, setTab] = useState(TABS.QUEUE);

  // Stats
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
  const [status, setStatus] = useState("all"); // all | pending | resolved | rejected

  // Manual actions
  const [banUserId, setBanUserId] = useState("");
  const [banUserReason, setBanUserReason] = useState("");

  const [banBandId, setBanBandId] = useState("");
  const [banBandReason, setBanBandReason] = useState("");

  const [deletePostId, setDeletePostId] = useState("");
  const [deletePostReason, setDeletePostReason] = useState("");

  // Mock data (replace with real API)
  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setLoading(true);
        setError("");

        // Replace these with real API calls:
        // const s = await getAdminStats(token);
        // const r = await getReports(token);

        const s = { users: 1200, bands: 120, reports: 20, events: 200 };

        const r = [
          { id: 1, name: "Kiss Pista", subject: "Band name", status: "pending", createdAt: "2026-02-10" },
          { id: 2, name: "Zsíros B. Ödön", subject: "Event", status: "resolved", createdAt: "2026-02-08" },
          { id: 3, name: "Kovács Péter", subject: "User harassment", status: "pending", createdAt: "2026-02-09" },
          { id: 4, name: "James Hathefield", subject: "Language", status: "pending", createdAt: "2026-02-07" },
          { id: 5, name: "Till Lindemann", subject: "Referral link", status: "pending", createdAt: "2026-02-06" },
        ];

        if (!alive) return;
        setStats(s);
        setReports(r);
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
        String(r.id).includes(q) ||
        (r.name || "").toLowerCase().includes(q) ||
        (r.subject || "").toLowerCase().includes(q);

      const matchesStatus = status === "all" ? true : r.status === status;
      return matchesQ && matchesStatus;
    });
  }, [reports, query, status]);

  async function handleResolve(reportId) {
    try {
      // await resolveReport(reportId, token);
      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, status: "resolved" } : r))
      );
    } catch (e) {
      alert(String(e?.message || "Failed to resolve report"));
    }
  }

  async function handleReject(reportId) {
    try {
      // await rejectReport(reportId, token);
      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, status: "rejected" } : r))
      );
    } catch (e) {
      alert(String(e?.message || "Failed to reject report"));
    }
  }

  async function submitBanUser(e) {
    e.preventDefault();
    if (!banUserId) return alert("UserID is required");
    try {
      // await banUser(banUserId, { reason: banUserReason }, token);
      alert(`User ${banUserId} banned (demo)`);
      setBanUserId("");
      setBanUserReason("");
    } catch (e2) {
      alert(String(e2?.message || "Failed to ban user"));
    }
  }

  async function submitBanBand(e) {
    e.preventDefault();
    if (!banBandId) return alert("BandID is required");
    try {
      // await banBand(banBandId, { reason: banBandReason }, token);
      alert(`Band ${banBandId} banned (demo)`);
      setBanBandId("");
      setBanBandReason("");
    } catch (e2) {
      alert(String(e2?.message || "Failed to ban band"));
    }
  }

  async function submitDeletePost(e) {
    e.preventDefault();
    if (!deletePostId) return alert("PostID is required");
    try {
      // await deletePost(deletePostId, { reason: deletePostReason }, token);
      alert(`Post ${deletePostId} deleted (demo)`);
      setDeletePostId("");
      setDeletePostReason("");
    } catch (e2) {
      alert(String(e2?.message || "Failed to delete post"));
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
            <p className="adm-p">Review reports, resolve issues, and run manual actions.</p>
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

        {/* Content */}
        {tab === TABS.QUEUE && (
          <section className="adm-card">
            <div className="adm-card-head">
              <div>
                <h2 className="adm-h2">Reports</h2>
                <p className="adm-muted">Search, filter, and handle moderation reports.</p>
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
                  <option value="pending">Pending</option>
                  <option value="resolved">Resolved</option>
                  <option value="rejected">Rejected</option>
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
                      <th>Name</th>
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
                              disabled={r.status !== "pending"}
                              onClick={() => handleResolve(r.id)}
                            >
                              Resolve
                            </button>
                            <button
                              type="button"
                              className="adm-btn adm-btn-ghost adm-btn-small"
                              disabled={r.status !== "pending"}
                              onClick={() => handleReject(r.id)}
                            >
                              Reject
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

        {tab === TABS.ACTIONS && (
          <section className="adm-actions-grid">
            <div className="adm-card">
              <div className="adm-card-head">
                <div>
                  <h2 className="adm-h2">Ban User</h2>
                  <p className="adm-muted">Disable a user account by ID.</p>
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

            <div className="adm-card">
              <div className="adm-card-head">
                <div>
                  <h2 className="adm-h2">Ban Band</h2>
                  <p className="adm-muted">Disable a band profile by ID.</p>
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

            <div className="adm-card">
              <div className="adm-card-head">
                <div>
                  <h2 className="adm-h2">Delete Post</h2>
                  <p className="adm-muted">Remove content by PostID.</p>
                </div>
              </div>

              <form className="adm-form" onSubmit={submitDeletePost}>
                <div className="adm-form-row">
                  <div className="adm-form-group">
                    <label>PostID</label>
                    <input
                      className="adm-input"
                      value={deletePostId}
                      onChange={(e) => setDeletePostId(e.target.value)}
                      placeholder="e.g. 999"
                    />
                  </div>
                  <div className="adm-form-group">
                    <label>Reason</label>
                    <input
                      className="adm-input"
                      value={deletePostReason}
                      onChange={(e) => setDeletePostReason(e.target.value)}
                      placeholder="optional"
                    />
                  </div>
                </div>

                <button className="adm-btn" type="submit">
                  Delete Post
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
      : status === "rejected"
      ? "is-gray"
      : "is-amber";

  const text =
    status === "resolved" ? "Resolved" : status === "rejected" ? "Rejected" : "Pending";

  return <span className={`adm-pill ${cls}`}>{text}</span>;
}
    