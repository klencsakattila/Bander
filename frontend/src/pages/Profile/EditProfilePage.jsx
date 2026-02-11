import "./EditProfileSettings.css";
import placeholder from "../../assets/images/default-avatar.png";
import { useEditProfileSettings } from "../../hooks/useUser";
import { useEffect, useMemo, useState } from "react";

import { getAllInstruments } from "../../services/InstrumentService";
import { getAllGenres } from "../../services/GenreService";
import { MultiSelectDropdown } from "../../components/MultiSelectDropdown"; // adjust path


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

  const [instrumentOptions, setInstrumentOptions] = useState([]);
  const [genreOptions, setGenreOptions] = useState([]);
  const [optionsError, setOptionsError] = useState("");

  // Read token the same way your services expect it
  const token = useMemo(() => {
    // change this if you store token differently
    return localStorage.getItem("token") || "";
  }, []);

  const parseCsvIds = (value) =>
    String(value || "")
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);

  const selectedInstrumentIds = useMemo(
    () => parseCsvIds(form.instruments),
    [form.instruments]
  );
    const selectedGenreIds = useMemo(() => parseCsvIds(form.styles), [form.styles]);
  
  const setCsvToForm = (field) => (ids) => {
    const csv = ids.join(",");
    onChange(field)({ target: { value: csv } });
  };

  useEffect(() => {
    let alive = true;

    async function loadOptions() {
      const instRes = await getAllInstruments(token);
      const genreRes = await getAllGenres(token);

      if (typeof instRes === "string") {
        throw new Error(`Instruments API returned non-JSON: ${instRes.slice(0, 80)}`);
      }
      if (typeof genreRes === "string") {
        throw new Error(`Genres API returned non-JSON: ${genreRes.slice(0, 80)}`);
      }

      const instruments = Array.isArray(instRes) ? instRes : instRes?.data ?? [];
      const genres = Array.isArray(genreRes) ? genreRes : genreRes?.data ?? [];

      console.log("instRes type:", typeof instRes, instRes);
      console.log("genreRes type:", typeof genreRes, genreRes);

      if (alive) {
        setInstrumentOptions(instruments);
        setGenreOptions(genres);
      }
    }

    loadOptions();
    return () => {
      alive = false;
    };
  }, [token]);

  // Map selected IDs -> labels for the left profile card
  const getLabelById = (options, id) => {
    const found = options.find((o) => String(o.id) === String(id));
    // fallback: if API uses different keys
    return found?.name || found?.title || found?.label || id;
  };

  const selectedInstrumentLabels = useMemo(() => {
    if (!selectedInstrumentIds.length) return "—";
    return selectedInstrumentIds
      .map((id) => getLabelById(instrumentOptions, id))
      .join(", ");
  }, [selectedInstrumentIds, instrumentOptions]);

  const selectedGenreLabels = useMemo(() => {
    if (!selectedGenreIds.length) return "—";
    return selectedGenreIds.map((id) => getLabelById(genreOptions, id)).join(", ");
  }, [selectedGenreIds, genreOptions]);



  if (loading) return <p style={{ padding: 40 }}>Loading profile...</p>;
  if (error) return <p style={{ padding: 40, color: "red" }}>{String(error?.message || error)}</p>;


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
        <p className="profile-text">{selectedInstrumentLabels}</p>

        <p className="profile-label">Style(s)</p>
        <p className="profile-text">{selectedGenreLabels}</p>

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
            <input
              value={form.first_name}
              onChange={onChange("first_name")}
              type="text"
              placeholder="Value"
            />
          </div>

          <div className="form-group">
            <label>Username</label>
            <input
              value={form.username}
              onChange={onChange("username")}
              type="text"
              placeholder="Value"
            />
          </div>

          <div className="form-group">
            <label>Surname</label>
            <input
              value={form.last_name}
              onChange={onChange("last_name")}
              type="text"
              placeholder="Value"
            />
          </div>

          {/* UI-only -> MULTI-SELECT dropdown */}
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
            <input
              value={form.email}
              onChange={onChange("email")}
              type="email"
              placeholder="Value"
            />
          </div>

          {/* UI-only -> MULTI-SELECT dropdown */}
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

          {/* UI-only */}
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={form.description}
              onChange={onChange("description")}
              placeholder="Value"
            />
          </div>

          <div className="form-group">
            <label>City</label>
            <input
              value={form.city}
              onChange={onChange("city")}
              type="text"
              placeholder="Value"
            />
          </div>

          <div className="form-group">
            <label>Birth date</label>
            <input
              value={form.birth_date}
              onChange={onChange("birth_date")}
              type="date"
            />
          </div>
        </div>

        {optionsError && (
          <p style={{ color: "red", marginTop: 12 }}>{optionsError}</p>
        )}

        {success && <p style={{ color: "green", marginTop: 12 }}>{success}</p>}
        {error && <p style={{ color: "red", marginTop: 12 }}>{String(error?.message || error)}</p>}

        <button className="save-btn" disabled={saving}>
          {saving ? "Saving..." : "Save Details"}
        </button>
      </form>
    </div>
  );
}
