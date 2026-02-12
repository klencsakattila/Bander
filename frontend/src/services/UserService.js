import { apiFetch } from "./apiClient";

export async function getUsersLimit(limit = 20, offset = 0, token) {
  const safeLimit = Math.min(20, Math.max(1, Number(limit) || 20));
  const safeOffset = Math.max(0, Number(offset) || 0);
  return apiFetch(`/users/limit/${safeLimit}/${safeOffset}`, { token });
}

export async function getUserById(userid, token) {
  if (!userid) throw new Error("userid is required");
  return apiFetch(`/users/${userid}`, { token });
}

export async function updateUser(
  id,
  { username, email, first_name, last_name, city, birth_date, password_hash } = {},
  token
) {
  if (!id) throw new Error("id is required");

  const body = {};
  if (username !== undefined) body.username = username;
  if (email !== undefined) body.email = email;
  if (first_name !== undefined) body.first_name = first_name;
  if (last_name !== undefined) body.last_name = last_name;
  if (city !== undefined) body.city = city;
  if (birth_date !== undefined) body.birth_date = birth_date;
  if (password_hash !== undefined) body.password_hash = password_hash;

  return apiFetch(`/users/${id}`, {
    method: "PATCH",
    body,
    token,
  });
}

export async function deleteUser(id, token) {
  if (!id) throw new Error("id is required");
  return apiFetch(`/users/${id}`, {
    method: "DELETE",
    token,
  });
}