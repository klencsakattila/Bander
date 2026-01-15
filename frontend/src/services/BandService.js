import { apiFetch } from "./apiClient";

export async function getAllBands(token) {
  return apiFetch(`/bands/limit/10`, { token });
}

export async function getLatestBandPosts(limit = 3, token) {
  const safeLimit = Math.min(20, Math.max(1, Number(limit) || 3));
  return apiFetch(`/bands/post/limit/${safeLimit}`, { token });
}

export async function getBandById(bandId, token) {
  return apiFetch(`/bands/${bandId}`, { token });
}
