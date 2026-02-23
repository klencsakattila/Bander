import { useMemo, useState } from "react";
import "./ReportButton.css";
import { useAuth } from "../../context/AuthContext";
import { createReport } from "../../services/ModerationService";
import { useToast } from "../../context/ToastContext";

const DEFAULT_REASONS = [
  { value: "spam", label: "Spam / reklám" },
  { value: "harassment", label: "Zaklatás / gyűlöletbeszéd" },
  { value: "inappropriate", label: "Nem megfelelő tartalom" },
  { value: "impersonation", label: "Megszemélyesítés" },
  { value: "scam", label: "Csalás / átverés" },
  { value: "other", label: "Egyéb" },
];

export default function ReportModal({ targetType, targetId, onClose }) {
  const { token } = useAuth();
  const { showToast } = useToast();

  const [reason, setReason] = useState("spam");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState("");

  const title = useMemo(() => {
    switch (targetType) {
      case "user":
        return "Felhasználó jelentése";
      case "band":
        return "Zenekar jelentése";
      case "post":
        return "Bejegyzés jelentése";
      default:
        return "Jelentés";
    }
  }, [targetType]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Be kell jelentkezned a jelentéshez.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        targetType,
        targetId,
        reason,
        message: message.trim(),
      };

      const created = await createReport(token, payload);

      console.log("✅ Report created:", created); // <- itt látod a választ
      showToast("Jelentés sikeresen elküldve!", "success");
        onClose();

      // ha automatikusan be akarod zárni 1s múlva:
      // setTimeout(onClose, 900);
    } catch (err) {
      console.error("❌ Report create failed:", err);
      showToast("Nem sikerült elküldeni a jelentést.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="report-modal">
      <div className="report-modal-header">
        <h3>{title}</h3>
        <button className="report-x" onClick={onClose} aria-label="Close">
          ✕
        </button>
      </div>

      {ok ? (
        <div className="report-success">
          <p>Köszi! A jelentést rögzítettük.</p>
          <button onClick={onClose}>Bezárás</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="report-form">
          <label>
            Ok
            <select value={reason} onChange={(e) => setReason(e.target.value)}>
              {DEFAULT_REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            Leírás (opcionális)
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Írd le röviden mi a probléma..."
              rows={4}
            />
          </label>

          {error && <p className="report-error">{error}</p>}

          <div className="report-actions">
            <button type="button" className="secondary" onClick={onClose}>
              Mégse
            </button>
            <button type="submit" disabled={loading}>
              {loading ? "Küldés..." : "Jelentés küldése"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}