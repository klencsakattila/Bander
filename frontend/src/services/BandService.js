import { apiFetch } from "./apiClient";

const clampInt = (v, def, min, max) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return def;
  return Math.min(max, Math.max(min, Math.floor(n)));
};

export async function getBandsLimit(limit = 10, offset = 0, token) {
  const safeLimit = clampInt(limit, 10, 1, 20);
  const safeOffset = clampInt(offset, 0, 0, Number.MAX_SAFE_INTEGER);
  return apiFetch(`/bands/limit/${safeLimit}/${safeOffset}`, { token });
}

export async function getLatestBandPosts(limit = 3, offset = 0, token) {
  const safeLimit = clampInt(limit, 3, 1, 20);
  const safeOffset = clampInt(offset, 0, 0, Number.MAX_SAFE_INTEGER);
  return apiFetch(`/bands/post/limit/${safeLimit}/${safeOffset}`, { token });
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

export async function createBandPost(
  { band_id, post_type, post_message, expires_at },
  token
  ) {
  if (!band_id) throw new Error("band_id is required");
  if (!post_type) throw new Error("post_type is required");
  if (!post_message) throw new Error("post_message is required");
  if (!expires_at) throw new Error("expires_at is required");

  return apiFetch(`/bands/post`, {
    method: "POST",
    body: { band_id, post_type, post_message, expires_at },
    token,
  });
}
  

export function uploadBandAvatar(bandId, file, token) {
  if (!bandId) throw new Error("bandId is required");
  if (!file) throw new Error("file is required");

  const fd = new FormData();
  fd.append("file", file); // keep "image" if backend expects it

  return apiFetch(`/bands/${bandId}/profile-image`, {
    method: "POST",
    body: fd,
    token,
  });
}

export function uploadBandBanner(bandId, file, token) {
  if (!bandId) throw new Error("bandId is required");
  if (!file) throw new Error("file is required");

  const fd = new FormData();
  fd.append("file", file);

  return apiFetch(`/bands/${bandId}/banner-image`, {
    method: "POST",
    body: fd,
    token,
  });
}