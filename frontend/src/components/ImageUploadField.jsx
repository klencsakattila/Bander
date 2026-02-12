import { useEffect, useMemo, useRef, useState } from "react";
import "./ImageUploadField.css";

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * ImageUploadField
 * - works without backend: stores DataURL in localStorage (optional)
 * - returns `file` + `previewUrl` to parent via onChange
 */
export default function ImageUploadField({
  label,
  initialUrl,
  storageKey, // e.g. "bander:user:avatar:8"
  onChange, // ({ file, previewUrl }) => void
  aspect = "1 / 1", // css aspect-ratio
  helpText,
}) {
  const inputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState("");

  // decide initial preview:
  const bootUrl = useMemo(() => {
    if (storageKey) {
      const cached = localStorage.getItem(storageKey);
      if (cached) return cached;
    }
    return initialUrl || "";
  }, [storageKey, initialUrl]);

  useEffect(() => {
    setPreviewUrl(bootUrl);
  }, [bootUrl]);

  async function handlePick(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    // basic guard
    if (!file.type.startsWith("image/")) {
      alert("Please choose an image file.");
      e.target.value = "";
      return;
    }
    // optional: size guard (e.g. 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image is too large. Please choose a file under 5MB.");
      e.target.value = "";
      return;
    }

    const dataUrl = await fileToDataUrl(file);
    setPreviewUrl(dataUrl);

    if (storageKey) localStorage.setItem(storageKey, dataUrl);

    onChange?.({ file, previewUrl: dataUrl });
  }

  function handleRemove() {
    setPreviewUrl("");
    if (storageKey) localStorage.removeItem(storageKey);
    if (inputRef.current) inputRef.current.value = "";
    onChange?.({ file: null, previewUrl: "" });
  }

  return (
    <div className="img-upload-field">
      {label && <label className="img-upload-label">{label}</label>}

      <div className="img-upload-row">
        <div className="img-upload-preview" style={{ aspectRatio: aspect }}>
          {previewUrl ? (
            <img src={previewUrl} alt={label || "preview"} />
          ) : (
            <div className="img-upload-empty">No image</div>
          )}
        </div>

        <div className="img-upload-actions">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handlePick}
          />

          <div className="img-upload-buttons">
            <button
              type="button"
              className="img-btn"
              onClick={() => inputRef.current?.click()}
            >
              Choose file
            </button>

            <button
              type="button"
              className="img-btn danger"
              onClick={handleRemove}
              disabled={!previewUrl}
            >
              Remove
            </button>
          </div>

          {helpText && <p className="img-upload-help">{helpText}</p>}
        </div>
      </div>
    </div>
  );
}
