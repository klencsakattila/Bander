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
import { getUsersLimit, resetUserPassword } from "../../services/UserService";
import { getBandsLimit, getLatestBandPosts } from "../../services/BandService";

const TABS = {
  QUEUE: "queue",
  ACTIONS: "actions",
};

function generatePassword(length = 16) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let result = "";
  for (let i = 0; i < length; i += 1) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
}

function normalizeReportsPayload(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.reports)) return payload.reports;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("hu-HU", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getEntityType(r) {
  if (r?.reporteduserid || r?.reported_user_id || r?.reportedUserId) return "User";
  if (r?.reportedbandid || r?.reported_band_id || r?.reportedBandId) return "Band";
  if (r?.reportedpostid || r?.reported_post_id || r?.reportedPostId) return "Post";
  return "Unknown";
}

function getEntityId(r) {
  return (
    r?.reporteduserid ??
    r?.reported_user_id ??
    r?.reportedUserId ??
    r?.reportedbandid ??
    r?.reported_band_id ??
    r?.reportedBandId ??
    r?.reportedpostid ??
    r?.reported_post_id ??
    r?.reportedPostId ??
    null
  );
}

function getReporterId(r) {
  return r?.reporterid ?? r?.reporter_id ?? r?.reporterId ?? r?.reporter?.id ?? null;
}

function mapReport(r) {
  const id = r?.id ?? r?.report_id ?? r?.reportId;
  const status = r?.report_status ?? r?.reportstatus ?? r?.status ?? "open";
  const createdAt = r?.createdAt ?? r?.created_at ?? r?.createdat ?? r?.created ?? null;
  const updatedAt = r?.updatedAt ?? r?.updated_at ?? r?.updatedat ?? null;
  const message = r?.report_message ?? r?.reportmessage ?? r?.message ?? "";
  const subject =
    r?.subject ??
    (message ? (message.length > 72 ? `${message.slice(0, 72)}…` : message) : getEntityType(r));
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
    updatedAt,
    subject,
    message: message || "—",
    name,
    reporterId: getReporterId(r),
    entityType: getEntityType(r),
    entityId: getEntityId(r),
  };
}

function ReportDetailsModal({ report, onClose, onReview, onResolve, onDelete }) {
  if (!report) return null;

  return (
    <div className="adm-modal-backdrop" onClick={onClose}>
      <div className="adm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="adm-modal-head">
          <div>
            <div className="adm-kicker">Report details</div>
            <h3>Report #{report.id}</h3>
          </div>
          <button className="adm-icon-btn" onClick={onClose} aria-label="Close details modal">✕</button>
        </div>

        <div className="adm-details-grid">
          <div className="adm-detail-card">
            <span className="adm-detail-label">Status</span>
            <strong className={`adm-status-chip is-${report.status}`}>{report.status}</strong>
          </div>
          <div className="adm-detail-card">
            <span className="adm-detail-label">Reporter</span>
            <strong>{report.name}</strong>
            <small>ID: {report.reporterId ?? "—"}</small>
          </div>
          <div className="adm-detail-card">
            <span className="adm-detail-label">Target</span>
            <strong>{report.entityType}</strong>
            <small>ID: {report.entityId ?? "—"}</small>
          </div>
          <div className="adm-detail-card">
            <span className="adm-detail-label">Created</span>
            <strong>{formatDate(report.createdAt)}</strong>
            <small>{report.createdAt || "—"}</small>
          </div>
          <div className="adm-detail-card adm-detail-card--wide">
            <span className="adm-detail-label">Message</span>
            <p className="adm-report-message-full">{report.message}</p>
          </div>
          <div className="adm-detail-card adm-detail-card--wide">
            <span className="adm-detail-label">Raw payload</span>
            <pre className="adm-raw-pre">{JSON.stringify(report.raw, null, 2)}</pre>
          </div>
        </div>

        <div className="adm-modal-actions">
          {report.status === "open" && (
            <button className="adm-btn adm-btn-secondary" onClick={() => onReview(report.id)}>
              Mark reviewing
            </button>
          )}
          {report.status !== "resolved" && (
            <button className="adm-btn adm-btn-success" onClick={() => onResolve(report.id)}>
              Resolve
            </button>
          )}
          <button className="adm-btn adm-btn-danger" onClick={() => onDelete(report.id)}>
            Delete report
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminActionCard({ title, text, value, onChange, placeholder, onSubmit, buttonLabel, loading, danger = false }) {
  return (
    <article className="adm-panel adm-action-panel">
      <div className="adm-panel-head compact">
        <div>
          <h2>{title}</h2>
          <p>{text}</p>
        </div>
      </div>

      <div className="adm-inline-form">
        <input type="number" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
        <button className={`adm-btn ${danger ? "adm-btn-danger" : "adm-btn-primary"}`} disabled={loading} onClick={onSubmit}>
          {buttonLabel}
        </button>
      </div>
    </article>
  );
}

export default function AdminModerationPage() {
  const { token } = useAuth();
  const { showToast } = useToast();

  const [tab, setTab] = useState(TABS.QUEUE);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({ users: 0, bands: 0, reports: 0, events: 0 });
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
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
    return () => {
      alive = false;
    };
  }, [token, showToast]);

  const filteredReports = useMemo(() => {
    const q = query.trim().toLowerCase();
    return reports.filter((r) => {
      const matchesQ =
        !q ||
        String(r.id ?? "").includes(q) ||
        String(r.reporterId ?? "").includes(q) ||
        String(r.entityId ?? "").includes(q) ||
        (r.name || "").toLowerCase().includes(q) ||
        (r.subject || "").toLowerCase().includes(q) ||
        (r.message || "").toLowerCase().includes(q) ||
        (r.entityType || "").toLowerCase().includes(q);
      const matchesStatus = status === "all" ? true : r.status === status;
      return matchesQ && matchesStatus;
    });
  }, [reports, query, status]);

  async function handleReview(reportId) {
    try {
      await updateReportStatus(reportId, "reviewing", token);
      setReports((prev) => prev.map((r) => (r.id === reportId ? { ...r, status: "reviewing" } : r)));
      setSelectedReport((prev) => (prev?.id === reportId ? { ...prev, status: "reviewing" } : prev));
      showToast("Report moved to reviewing.", "success");
    } catch (e) {
      showToast(String(e?.message || "Failed to update report"), "error");
    }
  }

  async function handleResolve(reportId) {
    try {
      await updateReportStatus(reportId, "resolved", token);
      setReports((prev) => prev.map((r) => (r.id === reportId ? { ...r, status: "resolved" } : r)));
      setSelectedReport((prev) => (prev?.id === reportId ? { ...prev, status: "resolved" } : prev));
      showToast("Report resolved.", "success");
    } catch (e) {
      showToast(String(e?.message || "Failed to resolve report"), "error");
    }
  }

  async function handleDeleteReport(reportId) {
    const ok = window.confirm(`Delete report #${reportId}? This cannot be undone.`);
    if (!ok) return;

    try {
      await deleteReport(reportId, token);
      setReports((prev) => prev.filter((r) => r.id !== reportId));
      setSelectedReport((prev) => (prev?.id === reportId ? null : prev));
      showToast("Report deleted.", "success");
    } catch (e) {
      showToast(String(e?.message || "Failed to delete report"), "error");
    }
  }

  async function handleLockUser() {
    if (!banUserId) return showToast("Enter a user ID first.", "error");
    try {
      setActionLoading(true);
      const newPassword = generatePassword(16);
      await resetUserPassword(Number(banUserId), newPassword, token);
      showToast(`User ${banUserId} locked. Temporary password generated.`, "success");
      setBanUserId("");
    } catch (e) {
      showToast(String(e?.message || "Failed to lock user"), "error");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDeleteBand() {
    if (!banBandId) return showToast("Enter a band ID first.", "error");
    const ok = window.confirm(`Delete band #${banBandId}? This cannot be undone.`);
    if (!ok) return;
    try {
      setActionLoading(true);
      await deleteBandById(Number(banBandId), token);
      showToast(`Band ${banBandId} deleted.`, "success");
      setBanBandId("");
    } catch (e) {
      showToast(String(e?.message || "Failed to delete band"), "error");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDeleteEvent() {
    if (!deleteEventId) return showToast("Enter an event/post ID first.", "error");
    const ok = window.confirm(`Delete event/post #${deleteEventId}? This cannot be undone.`);
    if (!ok) return;
    try {
      setActionLoading(true);
      await deleteEventById(Number(deleteEventId), token);
      showToast(`Event/Post ${deleteEventId} deleted.`, "success");
      setDeleteEventId("");
    } catch (e) {
      showToast(String(e?.message || "Failed to delete event/post"), "error");
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="adm-shell">
      <aside className={`adm-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="adm-sidebar-head">
          <div>
            <div className="adm-sidebar-title">Admin</div>
            <div className="adm-sidebar-subtitle">Moderation</div>
          </div>
          <button className="adm-close-mobile" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">✕</button>
        </div>

        <nav className="adm-nav">
          <button className={`adm-nav-link ${tab === TABS.QUEUE ? "active" : ""}`} onClick={() => { setTab(TABS.QUEUE); setSidebarOpen(false); }}>
            <span className="adm-nav-dot" />
            Reports queue
          </button>
          <button className={`adm-nav-link ${tab === TABS.ACTIONS ? "active" : ""}`} onClick={() => { setTab(TABS.ACTIONS); setSidebarOpen(false); }}>
            <span className="adm-nav-dot" />
            Manual actions
          </button>
        </nav>
      </aside>

      <main className="adm-main">
        <header className="adm-page-head">
          <div className="adm-page-head-left">
            <button className="adm-burger" onClick={() => setSidebarOpen((s) => !s)} aria-label="Open navigation">
              ☰
            </button>
            <div>
              <div className="adm-eyebrow">Moderation overview</div>
              <h1>Moderation dashboard</h1>
              <p>Review reports, inspect payloads and resolve issues without the layout falling apart.</p>
            </div>
          </div>
          <div className="adm-page-head-right">
            <span className="adm-env-pill">Admin tools</span>
          </div>
        </header>

        <section className="adm-stats-grid">
          <article className="adm-stat-card"><span>Reports</span><strong>{stats.reports}</strong></article>
          <article className="adm-stat-card"><span>Users</span><strong>{stats.users}</strong></article>
          <article className="adm-stat-card"><span>Bands</span><strong>{stats.bands}</strong></article>
          <article className="adm-stat-card"><span>Events</span><strong>{stats.events}</strong></article>
        </section>

        {tab === TABS.QUEUE && (
          <section className="adm-panel">
            <div className="adm-panel-head">
              <div>
                <h2>Reports</h2>
                <p>Search, filter and handle moderation reports in a stable table layout.</p>
              </div>
              <div className="adm-controls">
                <input type="text" placeholder="Search by ID, reporter, target, message..." value={query} onChange={(e) => setQuery(e.target.value)} />
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="all">All statuses</option>
                  <option value="open">Open</option>
                  <option value="reviewing">Reviewing</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>

            {loading && <div className="adm-loading">Loading reports…</div>}

            {!loading && (
              <>
                <div className="adm-table-wrap">
                  <table className="adm-table">
                    <colgroup>
                      <col style={{ width: "72px" }} />
                      <col style={{ width: "16%" }} />
                      <col style={{ width: "14%" }} />
                      <col style={{ width: "32%" }} />
                      <col style={{ width: "14%" }} />
                      <col style={{ width: "10%" }} />
                      <col style={{ width: "220px" }} />
                    </colgroup>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Reporter</th>
                        <th>Target</th>
                        <th>Message</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th className="adm-th-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredReports.map((r) => (
                        <tr key={r.id}>
                          <td className="adm-mono">#{r.id}</td>
                          <td>
                            <div className="adm-cell-stack">
                              <strong>{r.name}</strong>
                              <span className="adm-muted">Reporter ID: {r.reporterId ?? "—"}</span>
                            </div>
                          </td>
                          <td>
                            <div className="adm-cell-stack">
                              <strong>{r.entityType}</strong>
                              <span className="adm-muted">Target ID: {r.entityId ?? "—"}</span>
                            </div>
                          </td>
                          <td className="adm-subject-cell">
                            <div className="adm-cell-stack">
                              <strong className="adm-line-clamp-1">{r.subject}</strong>
                              <span className="adm-muted adm-line-clamp-2">{r.message}</span>
                            </div>
                          </td>
                          <td className="adm-date-cell">{formatDate(r.createdAt)}</td>
                          <td><span className={`adm-status-chip is-${r.status}`}>{r.status}</span></td>
                          <td className="adm-actions-cell">
                            <div className="adm-actions-row">
                              <button className="adm-btn adm-btn-ghost" onClick={() => setSelectedReport(r)}>Details</button>
                              {r.status === "open" && <button className="adm-btn adm-btn-secondary" onClick={() => handleReview(r.id)}>Reviewing</button>}
                              {r.status !== "resolved" && <button className="adm-btn adm-btn-success" onClick={() => handleResolve(r.id)}>Resolve</button>}
                              <button className="adm-btn adm-btn-danger" onClick={() => handleDeleteReport(r.id)}>Reject</button>
                            </div>
                          </td>
                        </tr>
                      ))}

                      {filteredReports.length === 0 && (
                        <tr>
                          <td colSpan="7" className="adm-empty-row">No reports found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="adm-report-list-mobile">
                  {filteredReports.map((r) => (
                    <article className="adm-report-card" key={`mobile-${r.id}`}>
                      <div className="adm-report-card-top">
                        <strong>#{r.id}</strong>
                        <span className={`adm-status-chip is-${r.status}`}>{r.status}</span>
                      </div>
                      <div className="adm-report-body">
                        <div className="adm-cell-stack">
                          <strong>{r.name}</strong>
                          <span className="adm-muted">Reporter ID: {r.reporterId ?? "—"}</span>
                        </div>
                        <div className="adm-cell-stack">
                          <strong>{r.entityType}</strong>
                          <span className="adm-muted">Target ID: {r.entityId ?? "—"}</span>
                        </div>
                        <p className="adm-report-message-full">{r.message}</p>
                        <span className="adm-muted">Created: {formatDate(r.createdAt)}</span>
                      </div>
                      <div className="adm-mobile-actions">
                        <button className="adm-btn adm-btn-ghost" onClick={() => setSelectedReport(r)}>Details</button>
                        {r.status === "open" && <button className="adm-btn adm-btn-secondary" onClick={() => handleReview(r.id)}>Reviewing</button>}
                        {r.status !== "resolved" && <button className="adm-btn adm-btn-success" onClick={() => handleResolve(r.id)}>Resolve</button>}
                        <button className="adm-btn adm-btn-danger" onClick={() => handleDeleteReport(r.id)}>Reject</button>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}
          </section>
        )}

        {tab === TABS.ACTIONS && (
          <section className="adm-actions-grid">
            <AdminActionCard
              title="Lock user"
              text="Reset the user's password to a random 16-character code and block their login flow."
              value={banUserId}
              onChange={setBanUserId}
              placeholder="User ID"
              onSubmit={handleLockUser}
              buttonLabel="Lock user"
              loading={actionLoading}
              danger
            />
            <AdminActionCard
              title="Delete band"
              text="Permanently remove a band profile by its identifier."
              value={banBandId}
              onChange={setBanBandId}
              placeholder="Band ID"
              onSubmit={handleDeleteBand}
              buttonLabel="Delete band"
              loading={actionLoading}
              danger
            />
            <AdminActionCard
              title="Delete event"
              text="Remove an event or post by ID."
              value={deleteEventId}
              onChange={setDeleteEventId}
              placeholder="Event or post ID"
              onSubmit={handleDeleteEvent}
              buttonLabel="Delete event"
              loading={actionLoading}
              danger
            />
          </section>
        )}
      </main>

      <ReportDetailsModal
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
        onReview={handleReview}
        onResolve={handleResolve}
        onDelete={handleDeleteReport}
      />
    </div>
  );
}
