import { useState } from "react";
import ReportModal from "./ReportModal";
import "./ReportButton.css";

export default function ReportActionLinkSafe({ targetType, targetId }) {
  const [open, setOpen] = useState(false);

  function toggle(e) {
    e.preventDefault();
    e.stopPropagation();
    setOpen((v) => !v);
  }

  function close(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setOpen(false);
  }

  return (
    <div
      className="report-action"
      onClick={(e) => {
        // ne triggerelje a Link-et
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <button type="button" className="report-btn" onClick={toggle}>
        Report
      </button>

      {open && (
        <div
          className="report-popover"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <ReportModal targetType={targetType} targetId={targetId} onClose={close} />
        </div>
      )}
    </div>
  );
}