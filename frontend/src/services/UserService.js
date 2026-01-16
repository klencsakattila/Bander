import { apiFetch } from "./apiClient";

export async function getUsersLimit(limit = 10, token) {
  const safeLimit = Math.min(20, Math.max(1, Number(limit) || 10));
  return apiFetch(`/users/limit/${safeLimit}`, { token });
}

export async function getUserById(id, token) {
  return apiFetch(`/users/${id}`, { token });
}


export async function getUsersTemp() {
  const userIds = [1, 2, 3];

  const results = await Promise.all(
    userIds.map(async (id) => {
      const res = await fetch(`${API_URL}/users/${id}`);
      if (!res.ok) return null;

      const data = await res.json(); // backend: array
      return data?.[0] ?? null;       // ha üres, akkor null
    })
  );

  // kiszűrjük a null/undefined elemeket
  return results.filter(Boolean);
}
