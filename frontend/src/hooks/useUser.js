import { useEffect, useMemo, useState } from "react";
import { getUserById, updateUser } from "../services/UserService";
import { useAuth } from "../context/AuthContext";

function normalizeUser(data) {
  if (!data) return null;
  if (Array.isArray(data)) return data[0] || null;
  return data;
}

export function useEditProfileSettings() {
  const { token, userId, isAuth } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [user, setUser] = useState(null);

  const [form, setForm] = useState({
    first_name: "",
    username: "",
    last_name: "",
    email: "",
    city: "",
    birth_date: "",
    password: "",

    // UI-only
    instruments: "",
    styles: "",
    description: "",
  });

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
          setError("Missing logged-in user id. Add userId to AuthContext (decode token).");
          return;
        }

        const data = await getUserById(userId, token);
        const u = normalizeUser(data);

        if (cancelled) return;

        if (!u) {
          setError("User not found.");
          return;
        }

        setUser(u);

        const birth = u.birth_date ? String(u.birth_date).slice(0, 10) : "";

        setForm((p) => ({
          ...p,
          first_name: u.first_name ?? "",
          last_name: u.last_name ?? "",
          username: u.username ?? "",
          email: u.email ?? "",
          city: u.city ?? "",
          birth_date: birth,
          password: "",

          // UI-only local marad
          instruments: p.instruments ?? "",
          styles: p.styles ?? "",
          description: p.description ?? "",
        }));
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

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      if (!isAuth) throw new Error("Not logged in.");
      if (!userId) throw new Error("Missing logged-in user id.");

      const payload = {
        first_name: form.first_name?.trim() || null,
        last_name: form.last_name?.trim() || null,
        username: form.username?.trim() || null,
        email: form.email?.trim() || null,
        city: form.city?.trim() || null,
        birth_date: form.birth_date || null,
      };

      if (form.password && form.password.trim().length > 0) {
        payload.password_hash = form.password.trim(); // backend ezt várja
      }

      const updated = await updateUser(userId, payload, token);
      setUser(updated);

      const birth = updated?.birth_date ? String(updated.birth_date).slice(0, 10) : "";

      setForm((p) => ({
        ...p,
        first_name: updated.first_name ?? "",
        last_name: updated.last_name ?? "",
        username: updated.username ?? "",
        email: updated.email ?? "",
        city: updated.city ?? "",
        birth_date: birth,
        password: "",
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
  };
}
