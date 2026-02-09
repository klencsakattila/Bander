// src/services/GenreService.js
import { apiFetch } from "./apiClient";

export function getAllGenres(token) {
  return apiFetch(`/genres`, { token });
}

export function getGenreById(id, token) {
  if (!id) throw new Error("id is required");
  return apiFetch(`/genres/${id}`, { token });
}

// admin only
export function createGenre({ name }, token) {
  if (!name) throw new Error("name is required");
  return apiFetch(`/genres`, {
    method: "POST",
    body: { name },
    token,
  });
}
