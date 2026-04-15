const API_URL = "http://localhost:3000";

const looksLikeJson = (text) => /^[\s\r\n]*[{[]/.test(text);

export async function apiFetch(path, { token, method = "GET", body } = {}) {
  const url = `${API_URL}${path}`;
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  const headers = {
    ...(token ? { "x-access-token": token } : {}),
    ...(!isFormData && body ? { "Content-Type": "application/json" } : {}),
  };

  console.log("apiFetch token:", token);
  console.log("apiFetch headers:", headers);

  const res = await fetch(url, {
    method,
    headers,
    ...(body ? { body: isFormData ? body : JSON.stringify(body) } : {}),
  });

  const text = await res.text().catch(() => "");

  if (!res.ok) {
    throw new Error(`[${method}] ${url} -> ${res.status} ${res.statusText}\n${text}`);
  }

  if (res.status === 204) return null;
  if (!text) return null;

  if (looksLikeJson(text)) {
    try {
      return JSON.parse(text);
    } catch {
      throw new Error(`Failed to parse JSON response from ${url}\n${text}`);
    }
  }

  return text;
}