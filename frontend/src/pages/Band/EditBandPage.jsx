import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import "./EditBandPage.css";
import placeholder from "../../assets/images/default-avatar.png";


export default function EditBandPage() {
  const { id } = useParams();

  // demo band data
  const demoBand = useMemo(
    () => ({
      id: id ?? 1,
      name: "BandName",
      description: "Description for the band",
      city: "Budapest",
      instruments: "Instrument(s)",
      genres: "Genre(s)",
      openSpots: "open spots",
      contactName: "Value",
      contactEmail: "Value",
      members: "Value",
    }),
    [id]
  );

  const [band, setBand] = useState(demoBand);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  // left form (band details)
  const [form, setForm] = useState({
    contactName: demoBand.contactName,
    contactEmail: demoBand.contactEmail,
    members: demoBand.members,
  });

  // right form (new event)
  const [eventForm, setEventForm] = useState({
    name: "",
    date: "",
    description: "",
  });

  useEffect(() => {
    setBand(demoBand);
    setForm({
      contactName: demoBand.contactName,
      contactEmail: demoBand.contactEmail,
      members: demoBand.members,
    });
  }, [demoBand]);

  const onChange = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));
  const onEventChange = (key) => (e) => setEventForm((p) => ({ ...p, [key]: e.target.value }));

  function handleSaveDetails(e) {
    e.preventDefault();
    setStatus("Saved (demo).");
    setTimeout(() => setStatus(""), 1500);


    // await updateBand(id, form)
  }

  function handleCreateEvent(e) {
    e.preventDefault();
    setStatus("Event created (demo).");
    setTimeout(() => setStatus(""), 1500);
    
    // await createBandEvent(id, eventForm)

    setEventForm({ name: "", date: "", description: "" });
  }

  return (
    <div className="edit-band-page">
      <div className="edit-band-wrapper">
        {/* LEFT CARD */}
        <aside className="band-card">
          <img className="band-avatar" src={placeholder} alt={band.name} />

          <h3 className="band-title">{band.name}</h3>

          <div className="band-meta">
            <p>{band.description}</p>
            <p>{band.instruments}</p>
            <p>{band.genres}</p>
            <p>{band.openSpots}</p>
          </div>
        </aside>

        {/* FORMS */}
        <section className="band-forms">
          {/* Band details column */}
          <div className="form-col">
            <h4 className="form-title">Name</h4>
            <div className="field">
              <label>Name</label>
              <input value={form.contactName} onChange={onChange("contactName")} placeholder="Value" />
            </div>

            <h4 className="form-subtitle">Contact Info</h4>

            <div className="field">
              <label>Email</label>
              <input value={form.contactEmail} onChange={onChange("contactEmail")} placeholder="Value" />
            </div>

            <div className="field">
              <label>Members</label>
              <select value={form.members} onChange={onChange("members")}>
                <option value="Value">Value</option>
                <option value="Member 1">Member 1</option>
                <option value="Member 2">Member 2</option>
              </select>
            </div>

            <button className="btn primary" onClick={handleSaveDetails}>
              Save Details
            </button>
          </div>

          {/* New event column */}
          <div className="form-col">
            <h4 className="form-title">New Event</h4>

            <div className="field">
              <label>Name</label>
              <input value={eventForm.name} onChange={onEventChange("name")} placeholder="Value" />
            </div>

            <div className="field">
              <label>Date</label>
              <input value={eventForm.date} onChange={onEventChange("date")} placeholder="Value" />
            </div>

            <div className="field">
              <label>Description</label>
              <input
                value={eventForm.description}
                onChange={onEventChange("description")}
                placeholder="Value"
              />
            </div>

            <button className="btn primary" onClick={handleCreateEvent}>
              Set up new Event!
            </button>
          </div>
        </section>
      </div>

      {status && <div className="toast">{status}</div>}
    </div>
  );
}
