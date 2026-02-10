const API_URL = "http://localhost:3000";

const looksLikeJson = (text) => /^[\s\r\n]*[{[]/.test(text);

export async function apiFetch(path, { token, method = "GET", body } = {}) {
  const url = `${API_URL}${path}`;

  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(body ? { "Content-Type": "application/json" } : {}),
  };

  const res = await fetch(url, {
    method,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  // Read as text FIRST so we can handle HTML/non-JSON gracefully
  const text = await res.text().catch(() => "");

  // Error handling (keep your helpful debug output)
  if (!res.ok) {
    throw new Error(
      `[${method}] ${url} -> ${res.status} ${res.statusText}\n${text}`
    );
  }

  // No content
  if (res.status === 204) return null;

  // If backend returns HTML (or empty), don't crash JSON parsing
  if (!text) return null;

  if (looksLikeJson(text)) {
    try {
      return JSON.parse(text);
    } catch {
      // fall through to return raw text
    }
  }

  // Return raw text for non-JSON responses (prevents Unexpected token '<')
  return text;
}
