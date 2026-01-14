import { apiFetch } from "./apiClient";

export async function getAllBands(token) {
  return apiFetch(`/band`, { token });
}

export async function getLatestBandPosts(limit = 3, token) {
  const safeLimit = Math.min(20, Math.max(1, Number(limit) || 3));
  return apiFetch(`/band/post/${safeLimit}`, { token });
}

export async function getBandById(bandId, token) {
  return apiFetch(`/band/${bandId}`, { token });
}
