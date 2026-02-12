import { apiFetch } from "./apiClient";

// POST /messages  body: { thread_id, sender_id, message }
export async function createMessage({ thread_id, sender_id, message }, token) {
  if (!thread_id || !sender_id || !message) {
    throw new Error("thread_id, sender_id and message are required");
  }

  return apiFetch(`/message`, {
    method: "POST",
    body: { thread_id, sender_id, message },
    token,
  });
}

// DELETE /messages/:id
export async function deleteMessage(id, token) {
  if (!id) throw new Error("id is required");
  return apiFetch(`/message/${id}`, {
    method: "DELETE",
    token,
  });
}
