// src/services/MessageService.js
import { apiFetch } from "./apiClient";

/**
 * EXPECTED BACKEND:
 * GET  /messages/with/:userId?limit=10&before=<cursor>
 * -> returns { items: Message[], nextCursor: string|null }
 *
 * POST /messages/with/:userId
 * body: { text: string }
 * -> returns created message
 *
 * If your backend returns a plain array instead of {items,nextCursor},
 * this service normalizes it.
 */

export async function getMessagesWithUser(otherUserId, { token, limit = 10, before = null } = {}) {
  const qs = new URLSearchParams();
  qs.set("limit", String(limit));
  if (before) qs.set("before", String(before));

  const data = await apiFetch(`/messages/with/${otherUserId}?${qs.toString()}`, { token });

  // Normalize response
  if (Array.isArray(data)) {
    // no cursor info from backend
    return { items: data, nextCursor: data.length ? data[0]?.created_at ?? null : null };
  }

  return {
    items: data.items ?? [],
    nextCursor: data.nextCursor ?? null,
  };
}

export async function sendMessageToUser(otherUserId, { token, text } = {}) {
  return apiFetch(`/messages/with/${otherUserId}`, {
    token,
    method: "POST",
    body: { text },
  });
}
