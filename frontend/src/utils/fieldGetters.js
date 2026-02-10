export const str = (v) => (v === null || v === undefined ? "" : String(v));

export const splitList = (v) => {
  if (!v) return [];
  if (Array.isArray(v)) return v.filter(Boolean).map(String);
  if (typeof v === "string")
    return v
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  if (typeof v === "object") {
    const one = v?.name ?? v?.title ?? v?.instrument ?? v?.genre;
    return one ? [String(one)] : [];
  }
  return [String(v)];
};

// ---- Users ----
export const user = {
  id: (u) => u?.id,
  username: (u) => u?.username ?? u?.userName ?? "",
  firstName: (u) => u?.first_name ?? u?.firstName ?? "",
  lastName: (u) => u?.last_name ?? u?.lastName ?? "",
  city: (u) => u?.city ?? u?.City ?? "",
  instruments: (u) =>
    splitList(
      u?.instruments ??
        u?.Instruments ??
        u?.instrument ??
        u?.Instrument ??
        u?.played_instruments ??
        u?.playedInstruments
    ),
  genres: (u) => splitList(u?.genres ?? u?.Genres ?? u?.genre ?? u?.Genre ?? u?.styles ?? u?.Styles),
  band: (u) =>
    str(
      u?.band ??
        u?.bandName ??
        u?.band_name ??
        u?.Band ??
        u?.BandName ??
        u?.bandId ??
        u?.BandId
    ),
};

// ---- Bands ----
export const band = {
  id: (b) => b?.id,
  name: (b) => b?.bandName ?? b?.name ?? "Band",
  city: (b) => b?.bandLocation ?? b?.city ?? b?.location ?? "",
};

// ---- Posts/Events ----
export const post = {
  id: (p) => p?.id,
  bandId: (p) => p?.band_id ?? p?.bandId,
  bandName: (p) => p?.band_name ?? p?.bandName ?? p?.name ?? "",
  type: (p) => p?.post_type ?? p?.postType ?? "",
  message: (p) => p?.post_message ?? p?.postMessage ?? "",
  createdAt: (p) => p?.created_at ?? p?.createdAt ?? "",
};

export const formatISODate = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return String(d).slice(0, 10);
  return dt.toISOString().slice(0, 10);
};
