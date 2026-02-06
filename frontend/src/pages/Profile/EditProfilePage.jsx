import "./EditProfileSettings.css";
import placeholder from "../../assets/images/default-avatar.png";
import { useEditProfileSettings } from "../../hooks/useUser";

export default function EditProfileSettings() {
  // IMPORTANT:
  // AuthContext-nek tudnia kell a logged-in user id-ját (pl. token decode-ból)
  const {
    loading,
    error,
    success,
    saving,
    form,
    fullName,
    onChange,
    onSubmit,
  } = useEditProfileSettings();


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
