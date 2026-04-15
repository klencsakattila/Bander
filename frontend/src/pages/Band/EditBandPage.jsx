import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./EditBandPage.css";
import placeholder from "../../assets/images/default-avatar.png";
import eventBadge from "../../assets/images/event-badge.png";

import { useAuth } from "../../context/AuthContext";
import { getUsersLimit } from "../../services/UserService";
import {
  createBand,
  updateBand,
  addBandMember,
  getBandById,
  getLatestBandPosts,
  createBandPost,
  uploadBandAvatar,
  uploadBandBanner,
} from "../../services/BandService";
import { formatISODate } from "../../utils/date";
import { useToast } from "../../context/ToastContext";

function pickUrl(obj, keys) {
  for (const k of keys) {
    const v = obj?.[k];
    if (typeof v === "string" && v.trim()) return v;
  }
  return "";
}

const BACKEND_ORIGIN = "http://localhost:3000"; // <-- change to your backend URL

const normalizeUrl = (u) => {
  if (!u) return "";
  const url = String(u).trim();
  if (!url) return "";

  // already absolute (http/https) or local blob/data
  if (
    /^(https?:)?\/\//i.test(url) ||
    url.startsWith("blob:") ||
    url.startsWith("data:")
  ) {
    return url;
  }

  // backend returns "/uploads/..." -> make absolute
  if (url.startsWith("/")) return `${BACKEND_ORIGIN}${url}`;

  return url;
};


export default function EditBandPage() {
  const { id } = useParams(); // /bands/manage/:id or /bands/create
  const navigate = useNavigate();
  const bandId = id ? Number(id) : null;

  const { token, userId, isAuth } = useAuth();
  const { showToast } = useToast();
  const isEditMode = Boolean(bandId);

  const demoBand = useMemo(
    () => ({
      id: bandId ?? null,
      name: "",
      city: "",
      description: "",
      instruments: "",
      genres: "",
      openSpots: "",
      avatarUrl: "",
      bannerUrl: "",
    }),
    [bandId]
  );

  const [band, setBand] = useState(demoBand);
  const [posts, setPosts] = useState([]);

  const [loading, setLoading] = useState(Boolean(isEditMode));
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const [form, setForm] = useState({ name: "", city: "" });

  const [users, setUsers] = useState([]);
  const [memberForm, setMemberForm] = useState({ user_id: "", role: "member" });
  const [memberLoading, setMemberLoading] = useState(false);

  const [eventForm, setEventForm] = useState({
    post_type: "announcement",
    post_message: "",
    expires_at: "",
  });
  const [eventLoading, setEventLoading] = useState(false);

  // ✅ Image upload state
  const [avatarFile, setAvatarFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [bannerPreview, setBannerPreview] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const onChange = (key) => (e) =>
    setForm((p) => ({ ...p, [key]: e.target.value }));
  const onMemberChange = (key) => (e) =>
    setMemberForm((p) => ({ ...p, [key]: e.target.value }));
  const onEventChange = (key) => (e) =>
    setEventForm((p) => ({ ...p, [key]: e.target.value }));

  // cleanup previews
  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
      if (bannerPreview) URL.revokeObjectURL(bannerPreview);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load band details (edit mode)
  useEffect(() => {
    let cancelled = false;

    async function loadBand() {
      try {
        setLoading(true);
        setError("");
      
        if (!isEditMode) {
          setBand(demoBand);
          setForm({ name: "", city: "" });
          return;
        }
        console.log("bandId:", bandId);

        const data = await getBandById(bandId, token);
        const row = Array.isArray(data) ? data[0] : data;
        if (!row) throw new Error("Band not found");
      
        // helpers (keep these in your file once; if you already added them above, remove duplicates
      
      const mapped = {
        id: row.id ?? bandId,
        name: row.name ?? row.bandName ?? row.band_name ?? "",
        city: row.city ?? row.bandLocation ?? row.location ?? "",
        description: row.description ?? "",
        instruments: row.instruments ?? "",
        genres: row.genres ?? "",
        openSpots: row.openSpots ?? row.open_spots ?? "",

        // ✅ pick avatar + normalize (supports many possible backend keys + relative paths)
        avatarUrl: normalizeUrl(
          pickUrl(row, [
            "profile_image_url",
            "avatar_url",
            "avatar",
            "profile_img",
            "profile_image",
            "image",
            "img",
            "band_avatar",
            "bandAvatar",
            "picture",
            "photo",
            "profilePicture",
          ])
        ),

        // ✅ pick banner + normalize
        bannerUrl: normalizeUrl(
          pickUrl(row, [
            "banner_image_url",
            "banner_url",
            "banner",
            "banner_img",
            "banner_image",
            "cover",
            "cover_url",
            "band_banner",
            "bandBanner",
            "header_image",
            "headerImage",
          ])
        ),
      };
        console.log("band fetch row:", row);
        console.log("picked avatar:", pickUrl(row, ["avatar_url","avatarUrl","profile_img","image","img"]));
        console.log("picked banner:", pickUrl(row, ["banner_url","bannerUrl","banner_img","cover","cover_url"]));

      if (!cancelled) {
        setBand(mapped);
        setForm({ name: mapped.name, city: mapped.city });
      }
    } catch (e) {
      console.error("loadBand error:", e);
      if (!cancelled) showToast(e?.message || "Failed to load band", "error");
    } finally {
      if (!cancelled) setLoading(false);
    }
  }
    loadBand();
    return () => {
      cancelled = true;
    };
  }, [bandId, isEditMode, token, demoBand]);

  // Load users for member pickup
  useEffect(() => {
    let cancelled = false;

    async function loadUsers() {
      try {
        if (!token) return;
        const data = await getUsersLimit(20, token);
        const list = Array.isArray(data) ? data : [];
        if (!cancelled) setUsers(list);
      } catch {
        // ignore
      }
    }

    loadUsers();
    return () => {
      cancelled = true;
    };
  }, [token]);

  // Load posts for this band
  useEffect(() => {
    let cancelled = false;

    async function loadPosts() {
      try {
        if (!token || !bandId) return;
        const postData = await getLatestBandPosts(50, token);
        const list = Array.isArray(postData) ? postData : [];
        if (cancelled) return;

        const onlyThisBand = list.filter(
          (p) => Number(p?.band_id) === Number(bandId)
        );
        setPosts(onlyThisBand);
      } catch {
        if (!cancelled) setPosts([]);
      }
    }

    if (isEditMode) loadPosts();
    return () => {
      cancelled = true;
    };
  }, [token, bandId, isEditMode]);

  async function handleSaveBand(e) {
    e.preventDefault();
    if (!isAuth) return navigate("/login");

    try {
      setLoading(true);
      setError("");
      setStatus("");

      const name = form.name?.trim();
      const city = form.city?.trim() || null;

      if (!name) throw new Error("Band name is required");

      if (!isEditMode) {
        const created = await createBand({ name, city }, token);
        const row = Array.isArray(created) ? created[0] : created;
        const newBandId = row?.id ?? row?.band_id ?? row?.bandId;

        if (!newBandId)
          throw new Error("Create succeeded but bandId missing in response");

        if (userId) {
          await addBandMember(
            { band_id: newBandId, user_id: userId, role: "admin" },
            token
          );
        }

        setStatus("Band created!");
      showToast("Band created!", "success");
        navigate(`/bands/manage/${newBandId}`, { replace: true });
      } else {
        await updateBand(bandId, { name, city }, token);
        setStatus("Saved!");
      showToast("Saved!", "success");
      }

      setTimeout(() => setStatus(""), 1500);
    } catch (err) {
      showToast(err?.message || "Save failed", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddMember(e) {
    e.preventDefault();
    if (!isAuth) return navigate("/login");
    if (!bandId) return;

    try {
      setMemberLoading(true);
      setError("");
      setStatus("");

      const uid = Number(memberForm.user_id);
      if (!uid) throw new Error("Pick a user");

      await addBandMember(
        { band_id: bandId, user_id: uid, role: memberForm.role },
        token
      );

      setStatus("Member added!");
      showToast("Member added!", "success");
      setTimeout(() => setStatus(""), 1500);

      setMemberForm({ user_id: "", role: "member" });
    } catch (err) {
      showToast(err?.message || "Failed to add member", "error");
    } finally {
      setMemberLoading(false);
    }
  }

  async function handleCreateEvent(e) {
    e.preventDefault();
    if (!isAuth) return navigate("/login");
    if (!bandId) return;

    try {
      setEventLoading(true);
      setError("");
      setStatus("");

      const msg = eventForm.post_message.trim();
      if (!msg) throw new Error("Message is required");
      if (!eventForm.expires_at) throw new Error("Expiry date is required");

      await createBandPost(
        {
          band_id: bandId,
          post_type: eventForm.post_type,
          post_message: msg,
          expires_at: eventForm.expires_at,
        },
        token
      );

      setStatus("Event created!");
      showToast("Event created!", "success");
      setTimeout(() => setStatus(""), 1500);

      setEventForm({ post_type: "announcement", post_message: "", expires_at: "" });

      const postData = await getLatestBandPosts(50, token);
      const list = Array.isArray(postData) ? postData : [];
      setPosts(list.filter((p) => Number(p?.band_id) === Number(bandId)));
    } catch (err) {
      showToast(err?.message || "Failed to create event", "error");
    } finally {
      setEventLoading(false);
    }
  }

  // ✅ Avatar file select
  function onPickAvatar(e) {
    const f = e.target.files?.[0] || null;
    setAvatarFile(f);

    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview(f ? URL.createObjectURL(f) : "");
  }

  // ✅ Banner file select
  function onPickBanner(e) {
    const f = e.target.files?.[0] || null;
    setBannerFile(f);

    if (bannerPreview) URL.revokeObjectURL(bannerPreview);
    setBannerPreview(f ? URL.createObjectURL(f) : "");
  }

  // ✅ Upload avatar
  async function handleUploadAvatar() {
    if (!isAuth) return navigate("/login");
    if (!bandId) return showToast("Create the band first, then upload images.", "error");
    if (!avatarFile) return showToast("Pick an avatar image first.", "error");

    try {
      setUploadingAvatar(true);
      setError("");
      setStatus("");

      const resp = await uploadBandAvatar(bandId, avatarFile, token);

      const url =
        (typeof resp === "string" && resp) ||
        resp?.avatar_url ||
        resp?.avatarUrl ||
        resp?.profile_img ||
        resp?.url ||
        "";

      setBand((p) => ({ ...p, avatarUrl: url || avatarPreview || p.avatarUrl }));
      setStatus("Avatar uploaded!");
      showToast("Avatar uploaded!", "success");
      await refreshBand();

      setAvatarFile(null);
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
        setAvatarPreview("");
      }

      setTimeout(() => setStatus(""), 1500);
    } catch (err) {
      showToast(err?.message || "Avatar upload failed", "error");
    } finally {
      setUploadingAvatar(false);
    }
  }

  // ✅ Upload banner
  async function handleUploadBanner() {
    if (!isAuth) return navigate("/login");
    if (!bandId) return showToast("Create the band first, then upload images.", "error");
    if (!bannerFile) return showToast("Pick a banner image first.", "error");

    try {
      setUploadingBanner(true);
      setError("");
      setStatus("");

      const resp = await uploadBandBanner(bandId, bannerFile, token);

      const url =
        (typeof resp === "string" && resp) ||
        resp?.banner_url ||
        resp?.bannerUrl ||
        resp?.banner_img ||
        resp?.url ||
        "";

      setBand((p) => ({ ...p, bannerUrl: url || bannerPreview || p.bannerUrl }));
      setStatus("Banner uploaded!");
      showToast("Banner uploaded!", "success");
      await refreshBand();


      setBannerFile(null);
      if (bannerPreview) {
        URL.revokeObjectURL(bannerPreview);
        setBannerPreview("");
      }

      setTimeout(() => setStatus(""), 1500);
    } catch (err) {
      showToast(err?.message || "Banner upload failed", "error");
    } finally {
      setUploadingBanner(false);
    }
  }
  async function refreshBand() {
    if (!bandId || !token) return;
    const data = await getBandById(bandId, token);
    const row = Array.isArray(data) ? data[0] : data;
    if (!row) return;

    setBand((prev) => ({
      ...prev,
      avatarUrl: normalizeUrl(
        pickUrl(row, [
          "avatarUrl",
          "avatar_url",
          "avatar",
          "profile_img",
          "profile_image",
          "image",
          "img",
          "band_avatar",
          "bandAvatar",
          "picture",
          "photo",
        ])
      ) || prev.avatarUrl,
      bannerUrl: normalizeUrl(
        pickUrl(row, [
          "bannerUrl",
          "banner_url",
          "banner",
          "banner_img",
          "banner_image",
          "cover",
          "cover_url",
          "band_banner",
          "bandBanner",
          "header_image",
          "headerImage",
        ])
      ) || prev.bannerUrl,
    }));
  }


  if (loading) return <p style={{ padding: 40 }}>Loading…</p>;
  const bandTitle = band?.name || form.name || (isEditMode ? "Band" : "Create a band");

  const bannerSrc = bannerPreview || band.bannerUrl || "";
  const avatarSrc = avatarPreview || band.avatarUrl || placeholder;

  return (
    <div className="edit-band-page">
      <div className="edit-band-wrapper">
        {/* LEFT CARD */}
        <aside className="band-card">
          {/* Banner */}
          <div className="band-banner-wrap">
            {bannerSrc ? (
              <img className="band-banner" src={bannerSrc} alt={`${bandTitle} banner`} />
            ) : (
              <div className="band-banner band-banner--empty" />
            )}
          </div>

          {/* Avatar */}
          <img className="band-avatar" src={avatarSrc} alt={bandTitle} />

          <h3 className="band-title">{bandTitle}</h3>

          <div className="band-meta">
            <p>{band.city || "—"}</p>
            <p>Open spots: {band.openSpots || "No open spots available."}</p>
          </div>

        </aside>

        {/* FORMS */}
        <section className="band-forms">
          {/* Band create/update + member pickup */}
          <div className="form-col">
            <h4 className="form-title">{isEditMode ? "Manage band" : "Create band"}</h4>

            <div className="field">
              <label>Band name</label>
              <input value={form.name} onChange={onChange("name")} placeholder="Band name" />
            </div>

            <div className="field">
              <label>City</label>
              <input value={form.city} onChange={onChange("city")} placeholder="City" />
            </div>

            <button className="btn primary" onClick={handleSaveBand} disabled={loading}>
              {isEditMode ? "Save changes" : "Create band"}
            </button>

            {isEditMode && (
              <>
                <h4 className="form-subtitle" style={{ marginTop: 18 }}>
                  Add member
                </h4>

                <div className="field">
                  <label>User</label>
                  <select value={memberForm.user_id} onChange={onMemberChange("user_id")}>
                    <option value="">Pick a user</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.username ?? `User #${u.id}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label>Role</label>
                  <select value={memberForm.role} onChange={onMemberChange("role")}>
                    <option value="member">member</option>
                    <option value="admin">admin</option>
                    <option value="leader">leader</option>
                  </select>
                </div>

                <button className="btn primary" onClick={handleAddMember} disabled={memberLoading}>
                  {memberLoading ? "Adding..." : "Add member"}
                </button>
              </>
            )}
          </div>

          {/* Event/Post creation + latest list */}
          <div className="form-col">
            <h4 className="form-title">New Event</h4>

            {!isEditMode ? (
              <p style={{ opacity: 0.8 }}>Create the band first, then you can create events.</p>
            ) : (
              <>
                <div className="field">
                  <label>Type</label>
                  <select value={eventForm.post_type} onChange={onEventChange("post_type")}>
                    <option value="announcement">announcement</option>
                    <option value="search">search</option>
                    <option value="general">general</option>
                  </select>
                </div>

                <div className="field">
                  <label>Message</label>
                  <textarea
                    value={eventForm.post_message}
                    onChange={onEventChange("post_message")}
                    placeholder="Describe the event/post..."
                    rows={5}
                  />
                </div>

                <div className="field">
                  <label>Expires at</label>
                  <input
                    type="date"
                    value={eventForm.expires_at}
                    onChange={onEventChange("expires_at")}
                  />
                </div>

                <button className="btn primary" onClick={handleCreateEvent} disabled={eventLoading}>
                  {eventLoading ? "Creating..." : "Create event"}
                </button>

                <div style={{ marginTop: 18 }}>
                  <h4 className="form-subtitle">Latest posts</h4>

                  {posts.length ? (
                    posts.map((p) => (
                      <div key={p.id} className="event-card" style={{ marginTop: 10 }}>
                        <img src={eventBadge} alt="Event" />
                        <p>
                          {p.post_type} – {formatISODate(p.created_at)} (expires{" "}
                          {formatISODate(p.expires_at)})
                        </p>
                        <p>{p.post_message}</p>
                      </div>
                    ))
                  ) : (
                    <p style={{ opacity: 0.8 }}>No posts yet.</p>
                  )}
                </div>
              </>
            )}
          </div>
          {/* Uploads column */}
          <div className="form-col">
            <h4 className="form-title">Band Images</h4>

            {!isEditMode ? (
              <p style={{ opacity: 0.8 }}>Create the band first, then you can upload images.</p>
            ) : (
              <div className="band-media">
                {/* Banner uploader */}
                <div className="band-media-block">
                  <div className="band-media-label">Banner</div>
            
                  <label className="band-banner-picker">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={onPickBanner}
                      className="band-file-hidden"
                    />

                    {bannerPreview || band.bannerUrl ? (
                      <img
                        className="band-banner-img"
                        src={bannerPreview || band.bannerUrl}
                        alt="Band banner"
                      />
                    ) : (
                      <div className="band-banner-empty">
                        <div className="band-banner-empty-title">Upload banner</div>
                        <div className="band-banner-empty-sub">Recommended: 1200×300</div>
                      </div>
                    )}

                    <div className="band-banner-overlay">
                      <span className="band-overlay-btn">Choose file</span>
                    </div>
                  </label>
                  
                  <div className="band-media-actions">
                    <div className="band-file-name">{bannerFile?.name || "No file selected"}</div>
                  
                    <div className="band-media-btns">
                      <button
                        type="button"
                        className="btn ghost"
                        onClick={() => {
                          setBannerFile(null);
                          if (bannerPreview) URL.revokeObjectURL(bannerPreview);
                          setBannerPreview("");
                        }}
                        disabled={!bannerFile && !bannerPreview}
                      >
                        Remove
                      </button>
                      
                      <button
                        type="button"
                        className="btn primary"
                        onClick={handleUploadBanner}
                        disabled={uploadingBanner || !bannerFile}
                      >
                        {uploadingBanner ? "Uploading..." : "Upload"}
                      </button>
                    </div>
                  </div>
                </div>
                      
                {/* Avatar uploader */}
                <div className="band-media-block">
                  <div className="band-media-label">Avatar</div>
                      
                  <label className="band-avatar-picker">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={onPickAvatar}
                      className="band-file-hidden"
                    />

                    <img
                      className="band-avatar-img"
                      src={avatarPreview || band.avatarUrl || placeholder}
                      alt="Band avatar"
                    />

                    <div className="band-avatar-overlay">
                      <span className="band-overlay-btn">Choose file</span>
                    </div>
                  </label>
                      
                  <div className="band-media-actions">
                    <div className="band-file-name">{avatarFile?.name || "No file selected"}</div>
                      
                    <div className="band-media-btns">
                      <button
                        type="button"
                        className="btn ghost"
                        onClick={() => {
                          setAvatarFile(null);
                          if (avatarPreview) URL.revokeObjectURL(avatarPreview);
                          setAvatarPreview("");
                        }}
                        disabled={!avatarFile && !avatarPreview}
                      >
                        Remove
                      </button>
                      
                      <button
                        type="button"
                        className="btn primary"
                        onClick={handleUploadAvatar}
                        disabled={uploadingAvatar || !avatarFile}
                      >
                        {uploadingAvatar ? "Uploading..." : "Upload"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

        </section>
      </div>

      {status && <div className="toast">{status}</div>}
    </div>
  );
}
