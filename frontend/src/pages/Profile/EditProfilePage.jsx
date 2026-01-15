import { useEffect, useMemo, useState } from "react";
import "./EditProfileSettings.css";
import placeholder from "../../assets/images/default-avatar.png";
import { useAuth } from "../../context/AuthContext";
import { getUserById } from "../../services/UserService";

export default function EditProfileSettings() {
  // IMPORTANT:
  // AuthContext-nek tudnia kell a logged-in user id-ját (pl. token decode-ból)
  const { token, userId, isAuth } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  const [user, setUser] = useState(null);

  const [form, setForm] = useState({
    first_name: "",
    username: "",
    last_name: "",
    email: "",
    city: "",
    birth_date: "", // yyyy-mm-dd
    password: "",

    // UI-only (not in your SQL schema currently)
    instruments: "",
    styles: "",
    description: "",
  });

  const normalizeUser = (data) => {
    if (!data) return null;
    // your backend sends result array for getUserById
    if (Array.isArray(data)) return data[0] || null;
    return data;
  };

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
          // This means AuthContext doesn't provide userId yet
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

          // UI-only fields still local
          instruments: "",
          styles: "",
          description: "",
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

    // ❗ nincs backend update, csak UI feedback
    setSuccess("Saving is not available yet.");
  } catch (e2) {
    setError(e2?.message || "Failed");
  } finally {
    setSaving(false);
  }
}


  if (loading) return <p style={{ padding: 40 }}>Loading profile...</p>;
  if (error) return <p style={{ padding: 40, color: "red" }}>{error}</p>;

  return (
    <div className="profile-settings-page">
      {/* Left Profile Card */}
      <div className="profile-card">
        <img src={placeholder} alt="User avatar" className="profile-avatar" />

        <h3 className="profile-username">{form.username || "UserName"}</h3>

        <p className="profile-label">Full Name</p>
        <p className="profile-text">{fullName}</p>

        {/* UI-only (not stored in DB currently) */}
        <p className="profile-label">Description for the artist</p>
        <p className="profile-text">{form.description || "—"}</p>

        <p className="profile-label">Instrument(s)</p>
        <p className="profile-text">{form.instruments || "—"}</p>

        <p className="profile-label">Style(s)</p>
        <p className="profile-text">{form.styles || "—"}</p>

        {/* DB fields */}
        <p className="profile-label">City</p>
        <p className="profile-text">{form.city || "—"}</p>

        <p className="profile-label">Birth date</p>
        <p className="profile-text">{form.birth_date || "—"}</p>
      </div>

      {/* Right Edit Form */}
      <form className="profile-form" onSubmit={onSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label>Name</label>
            <input value={form.first_name} onChange={onChange("first_name")} type="text" placeholder="Value" />
          </div>

          <div className="form-group">
            <label>Username</label>
            <input value={form.username} onChange={onChange("username")} type="text" placeholder="Value" />
          </div>

          <div className="form-group">
            <label>Surname</label>
            <input value={form.last_name} onChange={onChange("last_name")} type="text" placeholder="Value" />
          </div>

          {/* UI-only */}
          <div className="form-group">
            <label>Instrument(s)</label>
            <input value={form.instruments} onChange={onChange("instruments")} type="text" placeholder="Value" />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input value={form.email} onChange={onChange("email")} type="email" placeholder="Value" />
          </div>

          {/* UI-only */}
          <div className="form-group">
            <label>Style(s)</label>
            <input value={form.styles} onChange={onChange("styles")} type="text" placeholder="Value" />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              value={form.password}
              onChange={onChange("password")}
              type="password"
              placeholder="Leave empty to keep current"
            />
          </div>

          {/* UI-only */}
          <div className="form-group">
            <label>Description</label>
            <textarea value={form.description} onChange={onChange("description")} placeholder="Value" />
          </div>

          <div className="form-group">
            <label>City</label>
            <input value={form.city} onChange={onChange("city")} type="text" placeholder="Value" />
          </div>

          <div className="form-group">
            <label>Birth date</label>
            <input value={form.birth_date} onChange={onChange("birth_date")} type="date" />
          </div>
        </div>

        {success && <p style={{ color: "green", marginTop: 12 }}>{success}</p>}
        {error && <p style={{ color: "red", marginTop: 12 }}>{error}</p>}

        <button className="save-btn" disabled={saving}>
          {saving ? "Saving..." : "Save Details"}
        </button>
      </form>
    </div>
  );
}
