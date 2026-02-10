import { apiFetch } from "./apiClient";

// GET /reports/:id
export function getReportById(id, token) {
  if (!id) throw new Error("id is required");
  return apiFetch(`/reports/${id}`, { token });
}

// POST /reports
// body: { reporter_id, reported_user_id?, reported_band_id?, reported_post_id?, report_message }
export function createReport(
  { reporter_id, reported_user_id = null, reported_band_id = null, reported_post_id = null, report_message },
  token
) {
  if (!reporter_id) throw new Error("reporter_id is required");
  if (!report_message) throw new Error("report_message is required");

  return apiFetch(`/reports`, {
    method: "POST",
    body: { reporter_id, reported_user_id, reported_band_id, reported_post_id, report_message },
    token, // backend doesn't require token for createReport, but sending is fine
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
