import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import "./MessagePage.css";

export default function MessagesPage() {
  const { userId } = useParams(); // optional if route /messages/:userId

  // Demo participant (other user)
  const otherUser = useMemo(() => {
    // later fetch user by id; for now:
    return { id: userId ?? "2", name: "Attila" };
  }, [userId]);

  // Demo thread messages (used if you don't have backend yet)
  const demoMessages = useMemo(
    () => [
      { id: 1, sender: "other", text: "Szia! Láttam a profilod, zenélsz még?" },
      { id: 2, sender: "me", text: "Szia! Igen, most épp bandát keresek." },
      { id: 3, sender: "other", text: "Kiraly, milyen stílusban?" },
      { id: 4, sender: "me", text: "Rock / Pop, főleg hétvégén próbák." },
      { id: 5, sender: "other", text: "Oké, dobjunk össze egy próbát!" },
    ],
    []
  );

  // For now start with demo messages.
  // Later replace this with backend-loaded messages.
  const [messages, setMessages] = useState(demoMessages);

  const [draft, setDraft] = useState("");

  function handleSend(e) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;

    const newMsg = {
      id: Date.now(),
      sender: "me",
      text,
    };

    setMessages((prev) => [...prev, newMsg]);
    setDraft("");
  }

  return (
    <div className="messages-page">
      <header className="messages-header">
        <h2>Messages with {otherUser.name}</h2>
      </header>

      <main className="messages-wrapper">
        <section className="messages-panel">
          {/* Message list */}
          <div className="messages-list">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`message-row ${m.sender === "me" ? "right" : "left"}`}
              >
                <div
                  className={`message-bubble ${
                    m.sender === "me" ? "me" : "other"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input bar */}
          <form className="message-input" onSubmit={handleSend}>
            <input
              type="text"
              placeholder="Write a message…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
            <button type="submit">Send</button>
          </form>
        </section>
      </main>
    </div>
  );
}
