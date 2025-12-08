const API_URL = "http://localhost:3000"; // change if needed

export async function getAllUsers() {
  const res = await fetch(`${API_URL}/user`);

  if (!res.ok) {
    throw new Error("Failed to fetch users");
  }

  return await res.json();
}
