const API_URL = "http://localhost:3000"; 

export async function getAllUsers() {
  const res = await fetch(`${API_URL}/users`);

  if (!res.ok) {
    throw new Error("Failed to fetch users");
  }

  return await res.json();
}
export async function getUserById(userId) {
  const res = await fetch(`${API_URL}/users/${userId}`);
  if (!res.ok) throw new Error("Failed to fetch user details");
  return await res.json();
}

export async function getUsersTemp() {
  const userIds = [1, 2, 3];

  const results = await Promise.all(
    userIds.map(async (id) => {
      const res = await fetch(`${API_URL}/users/${id}`);
      if (!res.ok) return null;

      const data = await res.json(); // backend: array
      return data?.[0] ?? null;       // ha üres, akkor null
    })
  );

  // kiszűrjük a null/undefined elemeket
  return results.filter(Boolean);
}
