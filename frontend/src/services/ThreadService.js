// src/services/ThreadService.js
import { apiFetch } from "./apiClient";

// POST /threads  body: { user1_id, user2_id }
export async function createOrGetThread(user1Id, user2Id, token) {
  if (!user1Id || !user2Id) throw new Error("user1Id and user2Id are required");

  return apiFetch(`/thread`, {
    method: "POST",
    body: { user1_id: user1Id, user2_id: user2Id },
    token,
  });
}

// GET /threads/:id/:numberofmessages
export async function getThreadById(threadId, numberOfMessages = 20, token) {
  if (!threadId) throw new Error("threadId is required");

  const limit = Math.min(100, Math.max(1, Number(numberOfMessages) || 20));
  return apiFetch(`/thread/${threadId}/${limit}`, { token });
}
