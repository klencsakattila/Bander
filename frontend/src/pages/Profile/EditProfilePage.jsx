import "./EditProfileSettings.css";
import placeholder from "../../assets/images/default-avatar.png";
import { useEditProfileSettings } from "../../hooks/useUser";
import { useMemo, useState } from "react";
import ImageUploadField from "../../components/ImageUploadField";
import { useAuth } from "../../context/AuthContext";
import { MultiSelectDropdown } from "../../components/MultiSelectDropdown";
import { uploadUserProfileImage } from "../../services/UploadService";
import { useToast } from "../../context/ToastContext";

export default function EditProfileSettings() {
  const {
    loading,
    error,
    success,
    saving,
    form,
    fullName,
    onChange,
    onSubmit,
    instrumentOptions,
    genreOptions,
  } = useEditProfileSettings();

  const { userId } = useAuth();
  const { showToast } = useToast();

  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const token = useMemo(() => localStorage.getItem("token") || "", []);

  // Show success/error as toasts whenever they change
  useMemo(() => {
    if (success) showToast(success, "success");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [success]);

  useMemo(() => {
    if (error) showToast(String(error?.message || error), "error");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const parseCsvIds = (value) =>
    String(value || "")
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);

  const selectedInstrumentIds = useMemo(() => parseCsvIds(form.instruments), [form.instruments]);
  const selectedGenreIds = useMemo(() => parseCsvIds(form.styles), [form.styles]);

  const setCsvToForm = (field) => (ids) => {
    const csv = ids.join(",");
    onChange(field)({ target: { value: csv } });
  };

  // Map selected IDs -> labels for the profile card
  const getLabelById = (options, id) => {
    const found = options.find((o) => String(o.id) === String(id));
    return found?.name || found?.title || found?.label || id;
  };

  const selectedInstrumentLabels = useMemo(() => {
    if (!selectedInstrumentIds.length) return "—";
    return selectedInstrumentIds.map((id) => getLabelById(instrumentOptions, id)).join(", ");
  }, [selectedInstrumentIds, instrumentOptions]);

  const selectedGenreLabels = useMemo(() => {
    if (!selectedGenreIds.length) return "—";
    return selectedGenreIds.map((id) => getLabelById(genreOptions, id)).join(", ");
  }, [selectedGenreIds, genreOptions]);

  const idsToNames = (ids, options) =>
    (ids || [])
      .map((id) => options.find((o) => String(o.id) === String(id)))
      .map((o) => o?.name ?? o?.title ?? o?.label)
      .filter(Boolean);

  const handleSubmit = (e) => {
    const instrumentsNames = idsToNames(selectedInstrumentIds, instrumentOptions);
    const stylesNames = idsToNames(selectedGenreIds, genreOptions);
    return onSubmit(e, {
      instruments: instrumentsNames,
      styles: stylesNames,
      description: (form.description ?? "").trim() || null,
    });
  };

  if (loading) return <p style={{ padding: 40 }}>Loading profile...</p>;

  return (
    <div className="profile-settings-page">
      {/* Left Profile Card */}
      <div className="profile-card">
        {console.log(form)}
        <img
          src={avatarPreview || avatarUrl || form.profile_image_url || placeholder}
          alt="User avatar"
          className="profile-avatar"
        />
        <h3 className="profile-username">{form.username || "UserName"}</h3>

        <p className="profile-label">Full Name</p>
        <p className="profile-text">{fullName}</p>

        <p className="profile-label">Description for the artist</p>
        <p className="profile-text">{form.description || "—"}</p>

        <p className="profile-label">Instrument(s)</p>
        <p className="profile-text">{selectedInstrumentLabels}</p>

        <p className="profile-label">Style(s)</p>
        <p className="profile-text">{selectedGenreLabels}</p>

        <p className="profile-label">City</p>
        <p className="profile-text">{form.city || "—"}</p>

        <p className="profile-label">Birth date</p>
        <p className="profile-text">{form.birth_date || "—"}</p>
      </div>

      {/* Right Edit Form */}
      <form className="profile-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label>Name</label>
            <input value={form.first_name} onChange={onChange("first_name")} type="text" placeholder="First name" />
          </div>

          <div className="form-group">
            <label>Username</label>
            <input value={form.username} onChange={onChange("username")} type="text" placeholder="Username" />
          </div>

          <div className="form-group">
            <label>Surname</label>
            <input value={form.last_name} onChange={onChange("last_name")} type="text" placeholder="Last name" />
          </div>

          <div className="form-group">
            <MultiSelectDropdown
              label="Instrument(s)"
              options={instrumentOptions}
              selectedIds={selectedInstrumentIds}
              onChangeSelectedIds={setCsvToForm("instruments")}
              placeholder="Choose instruments"
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input value={form.email} onChange={onChange("email")} type="email" placeholder="Email" />
          </div>

          <div className="form-group">
            <MultiSelectDropdown
              label="Style(s)"
              options={genreOptions}
              selectedIds={selectedGenreIds}
              onChangeSelectedIds={setCsvToForm("styles")}
              placeholder="Choose styles"
            />
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

          <div className="form-group">
            <label>Description</label>
            <textarea value={form.description} onChange={onChange("description")} placeholder="Describe yourself" />
          </div>

          <div className="form-group">
            <label>City</label>
            <input value={form.city} onChange={onChange("city")} type="text" placeholder="City" />
          </div>

          <div className="form-group">
            <label>Birth date</label>
            <input
              value={form.birth_date}
              onChange={(e) => {
                // Use the value directly as typed — no Date object conversion to avoid UTC shift
                onChange("birth_date")({ target: { value: e.target.value } });
              }}
              type="date"
            />
          </div>

          <div className="form-group" style={{ gridColumn: "1 / -1" }}>
            <ImageUploadField
              label="Profile picture"
              initialUrl={form.profile_image_url || ""}
              aspect="1 / 1"
              helpText="Uploads to the server instantly."
              onError={(msg) => showToast(msg, "error")}
              onChange={async ({ file, previewUrl }) => {
                setAvatarPreview(previewUrl);
                if (!file) { setAvatarUrl(""); return; }
                try {
                  setUploadingAvatar(true);
                  const result = await uploadUserProfileImage(userId, file, token);
                  setAvatarUrl(result.profile_image_url);
                } catch (err) {
                  showToast(err?.message || "Upload failed", "error");
                } finally {
                  setUploadingAvatar(false);
                }
              }}
            />
          </div>
        </div>

        <button className="save-btn" disabled={saving || uploadingAvatar}>
          {saving ? "Saving..." : uploadingAvatar ? "Uploading..." : "Save Details"}
        </button>
      </form>
    </div>
  );
}
