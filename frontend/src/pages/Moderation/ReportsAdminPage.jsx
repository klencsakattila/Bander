import { useEffect, useMemo, useState } from "react";
import "./ReportsAdminPage.css";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { getReports, updateReportStatus, getReportById } from "../../services/ModerationService";

const STATUS_OPTIONS = [
  { value: "open", label: "Open" },
  { value: "processing", label: "Processing" },
  { value: "closed", label: "Closed" },
];

export default function ReportsAdminPage() {
  const { token } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reports, setReports] = useState([]);
  const [statusFilter, setStatusFilter] = useState("open");
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await getReports(token, { status: statusFilter });
      setReports(data || []);
      setSelectedId(null);
      setDetail(null);
    } catch (err) {
      const msg = err?.message || "Failed to load reports.";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  async function openDetail(id) {
    setSelectedId(id);
    setDetail(null);
    try {
      const d = await getReportById(token, id);
      setDetail(d);
    } catch (err) {
      setDetail({ error: err?.message || "Failed to load report details." });
    }
  }

  const selected = useMemo(() => {
    if (!selectedId) return null;
    return reports.find((r) => r.id === selectedId) || null;
  }, [selectedId, reports]);

  async function changeStatus(id, nextStatus) {
    setSaving(true);
    try {
      await updateReportStatus(token, id, { status: nextStatus });
      setReports((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: nextStatus } : r))
      );
      if (detail && detail.id === id) setDetail({ ...detail, status: nextStatus });
      showToast("Status updated.", "success");
    } catch (err) {
      showToast(err?.message || "Failed to save status.", "error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="admin-reports"><p>Loading...</p></div>;
  if (error) return <div className="admin-reports"><p className="err">{error}</p></div>;

  return (
    <div className="admin-reports">
      <div className="admin-reports-header">
        <h2>Reports</h2>
        <div className="filters">
          <label>
            Status
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </label>
          <button onClick={load} disabled={loading}>Refresh</button>
        </div>
      </div>

      <div className="admin-reports-grid">
        <div className="list">
          {reports.length === 0 ? (
            <p className="muted">No reports in this status.</p>
          ) : (
            reports.map((r) => (
              <button
                key={r.id}
                className={`row ${selectedId === r.id ? "active" : ""}`}
                onClick={() => openDetail(r.id)}
              >
                <div className="row-top">
                  <span className="badge">{r.targetType}</span>
                  <span className="badge secondary">{r.reason}</span>
                  <span className="time">{formatMaybeDate(r.createdAt)}</span>
                </div>
                <div className="row-mid">
                  <b>#{r.id}</b> – targetId: {r.targetId}
                </div>
                <div className="row-bottom">
                  Status: <b>{r.status}</b>
                </div>
              </button>
            ))
          )}
        </div>

        <div className="detail">
          {!selected ? (
            <p className="muted">Select a report on the left.</p>
          ) : detail?.error ? (
            <p className="err">{detail.error}</p>
          ) : (
            <>
              <h3>Report #{selected.id}</h3>
              <div className="detail-box">
                <p><b>Target:</b> {selected.targetType} (id: {selected.targetId})</p>
                <p><b>Reason:</b> {selected.reason}</p>
                <p><b>Status:</b> {detail?.status ?? selected.status}</p>
                <p><b>Created:</b> {formatMaybeDate(selected.createdAt)}</p>
                <p><b>Message:</b> {detail?.message || selected.message || <span className="muted">—</span>}</p>
              </div>
              <div className="detail-actions">
                {STATUS_OPTIONS.map((s) => (
                  <button
                    key={s.value}
                    disabled={saving || (detail?.status ?? selected.status) === s.value}
                    onClick={() => changeStatus(selected.id, s.value)}
                  >
                    Set: {s.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function formatMaybeDate(v) {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  return d.toLocaleString();
}
