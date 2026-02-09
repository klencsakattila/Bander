// src/services/MessageService.js
import { apiFetch } from "./apiClient";

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


// POST /messages  body: { thread_id, sender_id, message }
export function createMessage({ thread_id, sender_id, message }, token) {
  if (!thread_id || !sender_id || !message)
    throw new Error("thread_id, sender_id and message are required");

  return apiFetch(`/messages`, {
    method: "POST",
    body: { thread_id, sender_id, message },
    token,
  });
}

// DELETE /messages/:id
export function deleteMessage(id, token) {
  if (!id) throw new Error("id is required");
  return apiFetch(`/messages/${id}`, {
    method: "DELETE",
    token,
  });
}
