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
} from "../../services/BandService";
import { formatISODate } from "../../utils/date";

export default function EditBandPage() {
  const { id } = useParams(); // /bands/manage/:id or /bands/create
  const navigate = useNavigate();
  const bandId = id ? Number(id) : null;

  const { token, userId, isAuth } = useAuth();
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
    }),
    [bandId]
  );

  const [band, setBand] = useState(demoBand);
  const [posts, setPosts] = useState([]);

  const [loading, setLoading] = useState(Boolean(isEditMode));
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  // Band form (backend supports name + city)
  const [form, setForm] = useState({ name: "", city: "" });

  // Member pickup
  const [users, setUsers] = useState([]);
  const [memberForm, setMemberForm] = useState({ user_id: "", role: "member" });
  const [memberLoading, setMemberLoading] = useState(false);

  // Event/Post creation (backend REQUIRES expires_at)
  const [eventForm, setEventForm] = useState({
    post_type: "announcement",
    post_message: "",
    expires_at: "", // yyyy-mm-dd
  });
  const [eventLoading, setEventLoading] = useState(false);

  const onChange = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));
  const onMemberChange = (key) => (e) => setMemberForm((p) => ({ ...p, [key]: e.target.value }));
  const onEventChange = (key) => (e) => setEventForm((p) => ({ ...p, [key]: e.target.value }));

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

        const data = await getBandById(bandId, token);
        const row = Array.isArray(data) ? data[0] : data;
        if (!row) throw new Error("Band not found");

        const mapped = {
          id: row.id ?? bandId,
          name: row.name ?? row.bandName ?? row.band_name ?? "",
          city: row.city ?? row.bandLocation ?? row.location ?? "",
          description: row.description ?? "",
          instruments: row.instruments ?? "",
          genres: row.genres ?? "",
          openSpots: row.openSpots ?? "",
        };

        if (!cancelled) {
          setBand(mapped);
          setForm({ name: mapped.name, city: mapped.city });
        }
      } catch (e) {
        if (!cancelled) setError("Band not found");
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

        const onlyThisBand = list.filter((p) => Number(p?.band_id) === Number(bandId));
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
        // CREATE
        const created = await createBand({ name, city }, token);
        const row = Array.isArray(created) ? created[0] : created;
        const newBandId = row?.id ?? row?.band_id ?? row?.bandId;

        if (!newBandId) throw new Error("Create succeeded but bandId missing in response");

        // Add yourself as admin
        if (userId) {
          await addBandMember({ band_id: newBandId, user_id: userId, role: "admin" }, token);
        }

        setStatus("Band created!");
        navigate(`/bands/manage/${newBandId}`, { replace: true });
      } else {
        // UPDATE
        await updateBand(bandId, { name, city }, token);
        setStatus("Saved!");
      }

      setTimeout(() => setStatus(""), 1500);
    } catch (err) {
      setError(err?.message || "Save failed");
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

      await addBandMember({ band_id: bandId, user_id: uid, role: memberForm.role }, token);

      setStatus("Member added!");
      setTimeout(() => setStatus(""), 1500);

      setMemberForm({ user_id: "", role: "member" });
    } catch (err) {
      setError(err?.message || "Failed to add member");
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
          expires_at: eventForm.expires_at, // ✅ required by backend
        },
        token
      );

      setStatus("Event created!");
      setTimeout(() => setStatus(""), 1500);

      setEventForm({ post_type: "announcement", post_message: "", expires_at: "" });

      // refresh posts
      const postData = await getLatestBandPosts(50, token);
      const list = Array.isArray(postData) ? postData : [];
      setPosts(list.filter((p) => Number(p?.band_id) === Number(bandId)));
    } catch (err) {
      setError(err?.message || "Failed to create event");
    } finally {
      setEventLoading(false);
    }
  }

  if (loading) return <p style={{ padding: 40 }}>Loading…</p>;
  if (error) return <p style={{ padding: 40, color: "red" }}>{error}</p>;

  const bandTitle = band?.name || form.name || (isEditMode ? "Band" : "Create a band");

  return (
    <div className="edit-band-page">
      <div className="edit-band-wrapper">
        {/* LEFT CARD */}
        <aside className="band-card">
          <img className="band-avatar" src={placeholder} alt={bandTitle} />
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
        </section>
      </div>

      {status && <div className="toast">{status}</div>}
    </div>
  );
}
