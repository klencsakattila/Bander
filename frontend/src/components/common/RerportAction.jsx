import { useState } from "react";
import ReportModal from "./ReportModal";
import "./ReportButton.css";

export default function ReportAction({ targetType, targetId }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="report-action">
      <button
        type="button"
        className="report-btn"
        onClick={() => setOpen((v) => !v)}
        aria-label="Report"
      >
        Report
      </button>

      {open && (
        <div className="report-popover">
          <ReportModal
            targetType={targetType}
            targetId={targetId}
            onClose={() => setOpen(false)}
          />
        </div>
      )}
    </div>
  );
}