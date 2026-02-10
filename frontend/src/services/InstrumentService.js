// src/services/InstrumentService.js
import { apiFetch } from "./apiClient";

export function getAllInstruments(token) {
  return apiFetch(`/instrument`, { token });
}

export function getInstrumentById(id, token) {
  if (!id) throw new Error("id is required");
  return apiFetch(`/instrument/${id}`, { token });
}

// admin only
export function createInstrument({ name }, token) {
  if (!name) throw new Error("name is required");
  return apiFetch(`/instrument`, {
    method: "POST",
    body: { name },
    token,
  });
}
