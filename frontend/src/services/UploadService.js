const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000"; 
// adjust if your API base is different

export async function uploadUserProfileImage(userId, file, token) {
  if (!userId) throw new Error("Missing userId");
  if (!file) throw new Error("Missing file");

  const formData = new FormData();
  formData.append("file", file); // ✅ MUST be "file"

  const res = await fetch(`${API_BASE}/users/${userId}/profile-image`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`, // if your backend checks auth
      // ❌ DO NOT set Content-Type for FormData
    },
    body: formData,
  });

  // handle plain text errors too
  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await res.json()
    : await res.text();

  if (!res.ok) {
    throw new Error(typeof data === "string" ? data : data?.message || "Upload failed");
  }

  // backend returns { profile_image_url: "/uploads/users/..." }
  return data;
}
