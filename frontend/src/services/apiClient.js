const API_URL = "http://localhost:3000";

export async function apiFetch(path, { token, method = "GET", body } = {}) {
  const url = `${API_URL}${path}`;

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    // ✅ this will tell you exactly what failed
    throw new Error(`[${method}] ${url} -> ${res.status} ${res.statusText}\n${text}`);
  }

  if (res.status === 204) return null;
  return res.json();
}
