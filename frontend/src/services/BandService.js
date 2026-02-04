import { apiFetch } from "./apiClient";

export async function getBandsLimit(limit = 10, token) {
  const safeLimit = Math.min(20, Math.max(1, Number(limit) || 10));
  return apiFetch(`/bands/limit/${safeLimit}`, { token });
}

export async function getAllBands(token) {
  return getBandsLimit(10, token);
}

export async function getLatestBandPosts(limit = 3, token) {
  const safeLimit = Math.min(20, Math.max(1, Number(limit) || 3));
  return apiFetch(`/bands/post/limit/${safeLimit}`, { token });
}

export async function getBandById(bandId, token) {
  if (!bandId) throw new Error("bandId is required");
  return apiFetch(`/bands/${bandId}`, { token });
}

export async function createBand({ name, city }, token) {
  if (!name) throw new Error("Band name is required");
  return apiFetch(`/bands/newband`, {
    method: "POST",
    body: { name, city: city || null },
    token,
  });
}

export async function updateBand(bandId, { name, city } = {}, token) {
  if (!bandId) throw new Error("bandId is required");

  // opcionális: ne küldj üres body-t
  const body = {};
  if (name !== undefined) body.name = name;
  if (city !== undefined) body.city = city;

  return apiFetch(`/bands/${bandId}`, {
    method: "PATCH",
    body,
    token,
  });
}

export async function addBandMember({ band_id, user_id, role }, token) {
  if (!band_id || !user_id) throw new Error("band_id and user_id are required");

  return apiFetch(`/bands/newuser`, {
    method: "PUT",
    body: { band_id, user_id, role: role || null },
    token,
  });
}

export async function deleteBand(bandId, token) {
  if (!bandId) throw new Error("bandId is required");

  return apiFetch(`/bands/${bandId}`, {
    method: "DELETE",
    token,
  });
}
