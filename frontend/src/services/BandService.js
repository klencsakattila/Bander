const API_URL = "http://localhost:3000"; // change if needed

export async function getAllBands() {
  const res = await fetch(`${API_URL}/band`);

  if (!res.ok) {
    throw new Error("Failed to fetch bands");
  }

  return await res.json();
}

export async function getLatestBandPosts(limit) {
  const res = await fetch(`${API_URL}/band/post/${limit}`);

  if (!res.ok) {
    throw new Error("Failed to fetch band posts");
  }

  return await res.json();
}
