export async function updateBand(bandId, { name, city } = {}, token) {
    if (!bandId) throw new Error("bandId is required");
  
    // opcionális: ne küldj üres body-t
    const body = {};
    if (name !== undefined) body.name = name;
    if (city !== undefined) body.city = city;
  
    return apiFetch(`/bands/${bandId}`, {
      method: "PATCH",
      body,
      token,
    });
  }
  
  export async function addBandMember({ band_id, user_id, role }, token) {
    if (!band_id || !user_id) throw new Error("band_id and user_id are required");
  
    return apiFetch(`/bands/newuser`, {
      method: "PUT",
      body: { band_id, user_id, role: role || null },
      token,
    });
  }
  
  export async function deleteBand(bandId, token) {
    if (!bandId) throw new Error("bandId is required");
  
    return apiFetch(`/bands/${bandId}`, {
      method: "DELETE",
      token,
    });
  }
  