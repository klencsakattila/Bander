import { useEffect, useMemo, useRef, useState } from "react";

export function MultiSelectDropdown({
  label,
  options,
  selectedIds,
  onChangeSelectedIds,
  placeholder = "Select...",
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const selectedLabels = useMemo(() => {
    if (!selectedIds?.length) return "";
    const map = new Map(options.map((o) => [String(o.id), o]));
    return selectedIds
      .map((id) => map.get(String(id)))
      .filter(Boolean)
      .map((o) => o.name ?? o.title ?? o.label ?? String(o.id))
      .join(", ");
  }, [selectedIds, options]);

  const toggleId = (id) => {
    const sid = String(id);
    const set = new Set((selectedIds || []).map(String));
    if (set.has(sid)) set.delete(sid);
    else set.add(sid);
    onChangeSelectedIds(Array.from(set));
  };

  const allSelected = options.length > 0 && selectedIds?.length === options.length;

  const toggleAll = () => {
    if (allSelected) onChangeSelectedIds([]);
    else onChangeSelectedIds(options.map((o) => String(o.id)));
  };

  return (
    <div className="msd" ref={rootRef}>
      {label ? <label className="msd-label">{label}</label> : null}

      <button
        type="button"
        className="msd-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className={`msd-trigger-text ${selectedLabels ? "" : "is-placeholder"}`}>
          {selectedLabels || placeholder}
        </span>
        <span className="msd-caret" aria-hidden="true">▾</span>
      </button>

      {open && (
        <div className="msd-menu" role="listbox" aria-multiselectable="true">
          <button type="button" className="msd-item msd-item--all" onClick={toggleAll}>
            <input readOnly type="checkbox" checked={allSelected} />
            <span>{allSelected ? "Clear all" : "Select all"}</span>
          </button>

          <div className="msd-divider" />

          <div className="msd-scroll">
            {options.map((opt) => {
              const id = String(opt.id);
              const text = opt.name ?? opt.title ?? opt.label ?? `#${id}`;
              const checked = (selectedIds || []).map(String).includes(id);

              return (
                <button
                  key={id}
                  type="button"
                  className="msd-item"
                  onClick={() => toggleId(id)}
                >
                  <input readOnly type="checkbox" checked={checked} />
                  <span>{text}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
