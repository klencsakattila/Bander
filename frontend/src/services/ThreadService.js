// src/services/ThreadService.js
import { apiFetch } from "./apiClient";

// GET /threads/:id/:numberofmessages
export function getThreadById(threadId, numberOfMessages = 20, token) {
  if (!threadId) throw new Error("threadId is required");
  const limit = Math.min(100, Math.max(1, Number(numberOfMessages) || 20));
  return apiFetch(`/threads/${threadId}/${limit}`, { token });
}

// POST /threads  body: { user1_id, user2_id }
export function createThread({ user1_id, user2_id }, token) {
  if (!user1_id || !user2_id) throw new Error("user1_id and user2_id are required");
  return apiFetch(`/threads`, {
    method: "POST",
    body: { user1_id, user2_id },
    token,
  });
}
