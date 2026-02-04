import { apiFetch } from "./apiClient";


export async function registerUser({ email, password }) {
  if (!email || !password) throw new Error("email and password are required");
  return apiFetch(`/users/register`, {
    method: "POST",
    body: { email, password },
  });
}

export async function loginUser({ email, password }) {
  if (!email || !password) throw new Error("email and password are required");
  return apiFetch(`/users/login`, {
    method: "POST",
    body: { email, password },
  });
}
