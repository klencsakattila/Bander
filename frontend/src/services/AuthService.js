import { apiFetch } from "./apiClient";

export async function signUp(email, password) {
  return apiFetch("/users/register", {
    method: "POST",
    body: { email, password },
  });
}
