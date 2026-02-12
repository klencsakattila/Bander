// src/utils/mediaUrl.js

// Put your backend origin here (same host/port your API runs on)
const BACKEND_ORIGIN = "http://localhost:3000";

export function mediaUrl(u) {
  if (!u) return "";
  const url = String(u).trim();
  if (!url) return "";

  // already absolute or blob/data
  if (
    /^(https?:)?\/\//i.test(url) ||
    url.startsWith("blob:") ||
    url.startsWith("data:")
  ) {
    return url;
  }

  // backend returns "/uploads/..." -> make absolute
  if (url.startsWith("/")) return `${BACKEND_ORIGIN}${url}`;

  return url;
}

export function pickMedia(obj, keys) {
  for (const k of keys) {
    const v = obj?.[k];
    if (typeof v === "string" && v.trim()) return mediaUrl(v);
  }
  return "";
}
