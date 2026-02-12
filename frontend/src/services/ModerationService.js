import { apiFetch } from "./apiClient";

// GET /reports
export function getReports(token) {
  return apiFetch(`/reports`, { token });
}

// GET /reports/:id
export function getReportById(id, token) {
  if (!id) throw new Error("id is required");
  return apiFetch(`/reports/${id}`, { token });
}

// POST /reports
export function createReport(
  {
    reporter_id,
    reported_user_id = null,
    reported_band_id = null,
    reported_post_id = null,
    report_message,
  },
  token
) {
  if (!reporter_id) throw new Error("reporter_id is required");
  if (!report_message) throw new Error("report_message is required");

  return apiFetch(`/reports`, {
    method: "POST",
    body: {
      reporter_id,
      reported_user_id,
      reported_band_id,
      reported_post_id,
      report_message,
    },
    token,
  });
}

// DELETE /reports/:id
export function deleteReport(id, token) {
  if (!id) throw new Error("id is required");
  return apiFetch(`/reports/${id}`, {
    method: "DELETE",
    token,
  });
}

// PATCH /reports/:id (admin only)
// body: { report_status: "open" | "reviewing" | "resolved" }
export function updateReportStatus(id, report_status, token) {
  if (!id) throw new Error("id is required");
  if (!report_status) throw new Error("report_status is required");

  return apiFetch(`/reports/${id}`, {
    method: "PATCH",
    body: { report_status },
    token,
  });
}

// DELETE user (admin)
export function deleteUserById(userId, token) {
  if (!userId) throw new Error("userId is required");
  return apiFetch(`/users/${userId}`, {
    method: "DELETE",
    token,
  });
}

// DELETE /bands/:id
export function deleteBandById(bandId, token) {
  if (!bandId) throw new Error("bandId is required");
  return apiFetch(`/bands/${bandId}`, {
    method: "DELETE",
    token,
  });
}

// DELETE /events/:id
export function deleteEventById(eventId, token) {
  if (!eventId) throw new Error("eventId is required");
  return apiFetch(`/bands/post/${eventId}`, {
    method: "DELETE",
    token,
  });
}
