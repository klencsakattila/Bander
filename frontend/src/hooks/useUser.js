import { useEffect, useMemo, useState } from "react";
import { getUserById, updateUser } from "../services/UserService";
import { useAuth } from "../context/AuthContext";

function normalizeUser(data) {
  if (!data) return null;
  if (Array.isArray(data)) return data[0] || null;
  return data;
}

// Parse a date string as local date (avoid UTC off-by-one)
function toLocalDateString(value) {
  if (!value) return "";
  const s = String(value);
  // If already in YYYY-MM-DD format, use it directly (no UTC parsing)
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  // ISO string with time component -> take only the date part from local time
  const d = new Date(s);
  if (isNaN(d.getTime())) return s.slice(0, 10);
  // Use local year/month/day to avoid timezone shifting
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Convert array of names to CSV of IDs using options list
function namesToIdsCsv(names, options) {
  if (!names || !Array.isArray(names) || !options?.length) return "";
  return names
    .map((name) => {
      const found = options.find(
        (o) => (o.name ?? o.title ?? o.label ?? "").toLowerCase() === String(name).toLowerCase()
      );
      return found ? String(found.id) : null;
    })
    .filter(Boolean)
    .join(",");
}

export function useEditProfileSettings() {
  const { token, userId, isAuth } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [user, setUser] = useState(null);

  // Instrument and genre options stored here for re-use
  const [instrumentOptions, setInstrumentOptions] = useState([]);
  const [genreOptions, setGenreOptions] = useState([]);

  const [form, setForm] = useState({
    first_name: "",
    username: "",
    last_name: "",
    email: "",
    city: "",
    birth_date: "",
    password: "",
    instruments: "", // CSV of IDs
    styles: "",      // CSV of IDs
    description: "",
    profile_image_url: "",
  });

  function populateFormFromUser(u, instOpts, genreOpts) {
    const birth = toLocalDateString(u.birth_date);

    // Backend returns instruments/styles as arrays of names
    const instNames = Array.isArray(u.instruments) ? u.instruments : [];
    const styleNames = Array.isArray(u.styles) ? u.styles : [];

    const instrumentsCsv = namesToIdsCsv(instNames, instOpts);
    const stylesCsv = namesToIdsCsv(styleNames, genreOpts);

    setForm((p) => ({
      ...p,
      first_name: u.first_name ?? "",
      last_name: u.last_name ?? "",
      username: u.username ?? "",
      email: u.email ?? "",
      city: u.city ?? "",
      birth_date: birth,
      password: "",
      instruments: instrumentsCsv,
      styles: stylesCsv,
      description: u.description ?? "",
      profile_image_url: u.profile_image_url ?? "",
    }));
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError("");
        setSuccess("");

        if (!isAuth) {
          setError("You must be logged in to edit your profile.");
          return;
        }

        if (!userId) {
          setError("Missing logged-in user id.");
          return;
        }

        // Import services dynamically to avoid circular deps
        const { getAllInstruments } = await import("../services/InstrumentService");
        const { getAllGenres } = await import("../services/GenreService");

        const [data, instRes, genreRes] = await Promise.all([
          getUserById(userId, token),
          getAllInstruments(token).catch(() => []),
          getAllGenres(token).catch(() => []),
        ]);

        if (cancelled) return;

        const u = normalizeUser(data);
        if (!u) {
          setError("User not found.");
          return;
        }

        const instruments = Array.isArray(instRes) ? instRes : instRes?.data ?? [];
        const genres = Array.isArray(genreRes) ? genreRes : genreRes?.data ?? [];

        setUser(u);
        setInstrumentOptions(instruments);
        setGenreOptions(genres);
        populateFormFromUser(u, instruments, genres);
      } catch (e) {
        if (!cancelled) setError(e?.message || "Failed to load user");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [token, userId, isAuth]);

  const fullName = useMemo(() => {
    const fn = form.first_name?.trim();
    const ln = form.last_name?.trim();
    return `${fn} ${ln}`.trim() || "—";
  }, [form.first_name, form.last_name]);

  function onChange(field) {
    return (e) => setForm((p) => ({ ...p, [field]: e.target.value }));
  }

  async function onSubmit(e, extra = {}) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      if (!isAuth) throw new Error("Not logged in.");
      if (!userId) throw new Error("Missing logged-in user id.");

      const payload = {
        first_name: (form.first_name ?? "").trim() || null,
        last_name: (form.last_name ?? "").trim() || null,
        username: (form.username ?? "").trim() || null,
        email: (form.email ?? "").trim() || null,
        city: (form.city ?? "").trim() || null,
        birth_date: form.birth_date || null,
        profile_image_url: (form.profile_image_url ?? "").trim() || null,
        ...extra,
      };

      if (form.password && String(form.password).trim().length > 0) {
        payload.password_hash = String(form.password).trim();
      }

      const updated = await updateUser(userId, payload, token);
      setUser(updated);

      const birth = toLocalDateString(updated?.birth_date);

      // Re-resolve instruments/styles from updated data
      const instNames = Array.isArray(updated?.instruments) ? updated.instruments : [];
      const styleNames = Array.isArray(updated?.styles) ? updated.styles : [];
      const instrumentsCsv = namesToIdsCsv(instNames, instrumentOptions);
      const stylesCsv = namesToIdsCsv(styleNames, genreOptions);

      setForm((p) => ({
        ...p,
        first_name: updated?.first_name ?? "",
        last_name: updated?.last_name ?? "",
        username: updated?.username ?? "",
        email: updated?.email ?? "",
        city: updated?.city ?? "",
        birth_date: birth,
        password: "",
        instruments: instrumentsCsv || p.instruments,
        styles: stylesCsv || p.styles,
        profile_image_url: updated?.profile_image_url ?? p.profile_image_url ?? "",
      }));

      setSuccess("Profile updated successfully.");
    } catch (e2) {
      setError(e2?.message || "Failed to update user");
    } finally {
      setSaving(false);
    }
  }

  return {
    token,
    userId,
    isAuth,
    loading,
    saving,
    error,
    success,
    user,
    form,
    setForm,
    fullName,
    onChange,
    onSubmit,
    instrumentOptions,
    genreOptions,
  };
}
