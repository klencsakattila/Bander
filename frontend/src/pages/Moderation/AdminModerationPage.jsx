import { useEffect, useMemo, useState } from "react";
import "./AdminModerationPage.css";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import {
  getReports,
  updateReportStatus,
  deleteReport,
  deleteBandById,
  deleteEventById,
} from "../../services/ModerationService";
import { getUsersLimit } from "../../services/UserService";
import { getBandsLimit, getLatestBandPosts } from "../../services/BandService";
import { resetUserPassword } from "../../services/UserService";

const TABS = {
  QUEUE: "queue",
  ACTIONS: "actions",
};

function generatePassword(length = 16) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function normalizeReportsPayload(payload) {
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
  return { raw: r, id, status, createdAt, subject, name };
}

export default function AdminModerationPage() {
  const { token } = useAuth();
  const { showToast } = useToast();

  const [tab, setTab] = useState(TABS.QUEUE);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [stats, setStats] = useState({ users: 0, bands: 0, reports: 0, events: 0 });

  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  // Manual action state
  const [banUserId, setBanUserId] = useState("");
  const [banBandId, setBanBandId] = useState("");
  const [deleteEventId, setDeleteEventId] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setLoading(true);
        if (!token) throw new Error("Missing token (admin auth required)");

        // Fetch all data in parallel for real stats
        const [reportsPayload, usersPayload, bandsPayload, eventsPayload] = await Promise.all([
          getReports(token).catch(() => []),
          getUsersLimit(999, 0, token).catch(() => []),
          getBandsLimit(999, 0, token).catch(() => []),
          getLatestBandPosts(999, 0, token).catch(() => []),
        ]);

        if (!alive) return;

        const list = normalizeReportsPayload(reportsPayload).map(mapReport);
        const usersList = Array.isArray(usersPayload) ? usersPayload : [];
        const bandsList = Array.isArray(bandsPayload) ? bandsPayload : [];
        const eventsList = Array.isArray(eventsPayload) ? eventsPayload : [];

        setReports(list);
        setStats({
          reports: list.length,
          users: usersList.length,
          bands: bandsList.length,
          events: eventsList.length,
        });
      } catch (e) {
        if (!alive) return;
        showToast(String(e?.message || "Failed to load moderation data"), "error");
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => { alive = false; };
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
      showToast("Report resolved.", "success");
    } catch (e) {
      showToast(String(e?.message || "Failed to resolve report"), "error");
    }
  }

  async function handleMarkReviewing(reportId) {
    try {
      await updateReportStatus(reportId, "reviewing", token);
      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, status: "reviewing" } : r))
      );
      showToast("Report marked as reviewing.", "success");
    } catch (e) {
      showToast(String(e?.message || "Failed to update report status"), "error");
    }
  }

  async function handleReject(reportId) {
    try {
      await deleteReport(reportId, token);
      setReports((prev) => prev.filter((r) => r.id !== reportId));
      setStats((prev) => ({ ...prev, reports: Math.max(0, prev.reports - 1) }));
      showToast("Report rejected and deleted.", "success");
    } catch (e) {
      showToast(String(e?.message || "Failed to reject/delete report"), "error");
    }
  }

  // Ban user = set random 16-char password (account preserved, login blocked)
  async function submitBanUser(e) {
    e.preventDefault();
    if (!banUserId.trim()) return showToast("UserID is required", "error");
    try {
      setActionLoading(true);
      const newPass = generatePassword(16);
      await resetUserPassword(banUserId.trim(), newPass, token);
      showToast(`User ${banUserId} has been locked (password reset).`, "success");
      setBanUserId("");
    } catch (err) {
      showToast(String(err?.message || "Failed to lock user"), "error");
    } finally {
      setActionLoading(false);
    }
  }

  async function submitBanBand(e) {
    e.preventDefault();
    if (!banBandId.trim()) return showToast("BandID is required", "error");
    try {
      setActionLoading(true);
      await deleteBandById(banBandId.trim(), token);
      showToast(`Band ${banBandId} deleted.`, "success");
      setBanBandId("");
      setStats((prev) => ({ ...prev, bands: Math.max(0, prev.bands - 1) }));
    } catch (err) {
      showToast(String(err?.message || "Failed to delete band"), "error");
    } finally {
      setActionLoading(false);
    }
  }

  async function submitDeleteEvent(e) {
    e.preventDefault();
    if (!deleteEventId.trim()) return showToast("EventID is required", "error");
    try {
      setActionLoading(true);
      await deleteEventById(deleteEventId.trim(), token);
      showToast(`Event ${deleteEventId} deleted.`, "success");
      setDeleteEventId("");
      setStats((prev) => ({ ...prev, events: Math.max(0, prev.events - 1) }));
    } catch (err) {
      showToast(String(err?.message || "Failed to delete event"), "error");
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="adm-shell">
      {/* Mobile hamburger */}
      <button
        className="adm-hamburger"
        type="button"
        onClick={() => setSidebarOpen((v) => !v)}
        aria-label="Toggle sidebar"
      >
        <span /><span /><span />
      </button>

      {/* Sidebar */}
      <aside className={`adm-sidebar ${sidebarOpen ? "is-open" : ""}`}>
        <div className="adm-brand">
          <div className="adm-logo" />
          <div>
            <div className="adm-title">Admin</div>
            <div className="adm-subtitle">Dashboard</div>
          </div>
        </div>

        <nav className="adm-nav">
          <button
            className={`adm-nav-item ${tab === TABS.QUEUE ? "is-active" : ""}`}
            type="button"
            onClick={() => { setTab(TABS.QUEUE); setSidebarOpen(false); }}
          >
            Moderation Queue
          </button>
          <button
            className={`adm-nav-item ${tab === TABS.ACTIONS ? "is-active" : ""}`}
            type="button"
            onClick={() => { setTab(TABS.ACTIONS); setSidebarOpen(false); }}
          >
            Manual Actions
          </button>
        </nav>

        <div className="adm-sidebar-foot">
          <div className="adm-hint">Tip</div>
          <div className="adm-hint-text">
            Use the queue for reports and manual actions for administrative tasks.
          </div>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div className="adm-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <main className="adm-main">
        <header className="adm-header">
          <div>
            <h1 className="adm-h1">Moderation Overview</h1>
            <p className="adm-p">Review reports, resolve issues, and run manual actions.</p>
          </div>
          <div className="adm-header-actions">
            <div className="adm-chip">Environment: Local</div>
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
                  <option value="open">Open</option>
                  <option value="reviewing">Reviewing</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>

            {loading && <div className="adm-loading">Loading reports…</div>}

            {!loading && (
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
                        <td className="adm-subject-cell">{r.subject}</td>
                        <td className="adm-muted adm-date-cell">{r.createdAt || "—"}</td>
                        <td><StatusPill status={r.status} /></td>
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
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {filteredReports.length === 0 && (
                      <tr>
                        <td colSpan={6} className="adm-empty">No reports found.</td>
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
            {/* Lock User */}
            <div className="adm-card">
              <div className="adm-card-head">
                <div>
                  <h2 className="adm-h2">Lock User</h2>
                  <p className="adm-muted">
                    Resets the user's password to a random 16-character code, preventing login
                    while preserving the account.
                  </p>
                </div>
              </div>
              <form className="adm-form" onSubmit={submitBanUser}>
                <div className="adm-form-group">
                  <label>UserID</label>
                  <input
                    className="adm-input"
                    value={banUserId}
                    onChange={(e) => setBanUserId(e.target.value)}
                    placeholder="e.g. 123"
                  />
                </div>
                <button className="adm-btn adm-btn-danger" type="submit" disabled={actionLoading}>
                  {actionLoading ? "Processing..." : "Lock User"}
                </button>
              </form>
            </div>

            {/* Delete Band */}
            <div className="adm-card">
              <div className="adm-card-head">
                <div>
                  <h2 className="adm-h2">Delete Band</h2>
                  <p className="adm-muted">Permanently remove a band profile by ID.</p>
                </div>
              </div>
              <form className="adm-form" onSubmit={submitBanBand}>
                <div className="adm-form-group">
                  <label>BandID</label>
                  <input
                    className="adm-input"
                    value={banBandId}
                    onChange={(e) => setBanBandId(e.target.value)}
                    placeholder="e.g. 55"
                  />
                </div>
                <button className="adm-btn adm-btn-danger" type="submit" disabled={actionLoading}>
                  {actionLoading ? "Processing..." : "Delete Band"}
                </button>
              </form>
            </div>

            {/* Delete Event */}
            <div className="adm-card">
              <div className="adm-card-head">
                <div>
                  <h2 className="adm-h2">Delete Event</h2>
                  <p className="adm-muted">Remove an event/post by EventID.</p>
                </div>
              </div>
              <form className="adm-form" onSubmit={submitDeleteEvent}>
                <div className="adm-form-group">
                  <label>EventID</label>
                  <input
                    className="adm-input"
                    value={deleteEventId}
                    onChange={(e) => setDeleteEventId(e.target.value)}
                    placeholder="e.g. 999"
                  />
                </div>
                <button className="adm-btn adm-btn-danger" type="submit" disabled={actionLoading}>
                  {actionLoading ? "Processing..." : "Delete Event"}
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
      <div className="adm-stat-value">{value ?? "—"}</div>
    </div>
  );
}

function StatusPill({ status }) {
  const cls =
    status === "resolved" ? "is-green" : status === "reviewing" ? "is-amber" : "is-gray";
  const text =
    status === "resolved" ? "Resolved" : status === "reviewing" ? "Reviewing" : "Open";
  return <span className={`adm-pill ${cls}`}>{text}</span>;
}
