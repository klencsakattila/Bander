import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./MessagePage.css";
import { useAuth } from "../../context/AuthContext";
import { getMessagesWithUser, sendMessageToUser } from "../../services/MessageService";

export default function MessagesPage() {
  const { userId } = useParams(); // other user id
  const navigate = useNavigate();
  const { token, isAuth, userId: myUserId } = useAuth();

  const otherUser = useMemo(() => ({ id: userId }), [userId]);

  const listRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");

  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [sending, setSending] = useState(false);

  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState("");

  // --- guard / auth ---
  useEffect(() => {
    if (!isAuth) navigate("/login", { replace: true });
  }, [isAuth, navigate]);

  // block chatting with yourself (in case user types URL)
  useEffect(() => {
    if (myUserId && userId && String(myUserId) === String(userId)) {
      navigate("/", { replace: true });
    }
  }, [myUserId, userId, navigate]);

  // --- initial load (latest 10) ---
  useEffect(() => {
    if (!userId || !token) return;

    let alive = true;

    async function load() {
      try {
        setLoadingInitial(true);
        setError("");

        const { items, nextCursor: cursor } = await getMessagesWithUser(userId, {
          token,
          limit: 10,
          before: null,
        });

        if (!alive) return;

        // IMPORTANT: your backend should return messages in chronological order (old->new) OR you sort here.
        // We'll assume it returns old->new for a chat view:
        setMessages(items);
        setNextCursor(cursor);
        setHasMore(Boolean(cursor) && items.length > 0);

        // scroll to bottom after first paint
        requestAnimationFrame(() => {
          const el = listRef.current;
          if (el) el.scrollTop = el.scrollHeight;
        });
      } catch (e) {
        if (!alive) return;
        console.error(e);
        setError(e.message || "Failed to load messages");
      } finally {
        if (alive) setLoadingInitial(false);
      }
    }

    load();

    return () => {
      alive = false;
    };
  }, [userId, token]);

  // --- load older when user scrolls to top ---
  async function loadOlder() {
    if (!userId || !token) return;
    if (!hasMore || loadingOlder || loadingInitial) return;
    if (!nextCursor) return;

    const el = listRef.current;
    if (!el) return;

    const prevScrollHeight = el.scrollHeight;
    const prevScrollTop = el.scrollTop;

    try {
      setLoadingOlder(true);

      const { items, nextCursor: cursor } = await getMessagesWithUser(userId, {
        token,
        limit: 10,
        before: nextCursor,
      });

      // Prepend older items
      setMessages((prev) => [...items, ...prev]);

      // update cursor / hasMore
      setNextCursor(cursor);
      setHasMore(Boolean(cursor) && items.length > 0);

      // keep viewport stable (so it doesn't jump)
      requestAnimationFrame(() => {
        const newScrollHeight = el.scrollHeight;
        el.scrollTop = prevScrollTop + (newScrollHeight - prevScrollHeight);
      });
    } catch (e) {
      console.error(e);
      setError(e.message || "Failed to load older messages");
    } finally {
      setLoadingOlder(false);
    }
  }

  function onScroll() {
    const el = listRef.current;
    if (!el) return;

    // when near top, fetch older
    if (el.scrollTop <= 20) {
      loadOlder();
    }
  }

  // --- send message ---
  async function handleSend(e) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || !userId || !token) return;

    try {
      setSending(true);

      const created = await sendMessageToUser(userId, { token, text });

      // Append new message (fallback shape if backend returns something else)
      const newMsg = created ?? {
        id: Date.now(),
        sender_id: myUserId,
        text,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, newMsg]);
      setDraft("");

      // auto-scroll bottom
      requestAnimationFrame(() => {
        const el = listRef.current;
        if (el) el.scrollTop = el.scrollHeight;
      });
    } catch (e) {
      console.error(e);
      setError(e.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  }

  // --- rendering helpers ---
  function isMine(msg) {
    // adapt to your backend fields:
    // could be msg.sender === "me", msg.sender_id, msg.from_user_id, etc.
    const senderId = msg.sender_id ?? msg.from_user_id ?? msg.senderId ?? null;
    if (senderId == null) return false;
    return String(senderId) === String(myUserId);
  }

  if (loadingInitial) {
    return <p style={{ padding: "40px" }}>Loading messages...</p>;
  }

  return (
    <div className="messages-page">
      <header className="messages-header">
        <h2>Messages</h2>
        <div className="messages-subtitle">Chat with user {otherUser.name}</div>
      </header>

      <main className="messages-wrapper">
        <section className="messages-panel">
          {error && <div style={{ padding: "10px", color: "red" }}>{error}</div>}

          {/* Message list */}
          <div className="messages-list" ref={listRef} onScroll={onScroll}>
            {loadingOlder && (
              <div style={{ textAlign: "center", padding: "8px", opacity: 0.7 }}>
                Loading older...
              </div>
            )}

            {messages.map((m) => (
              <div key={m.id} className={`message-row ${isMine(m) ? "right" : "left"}`}>
                <div className={`message-bubble ${isMine(m) ? "me" : "other"}`}>
                  {m.text ?? m.message ?? ""}
                </div>
              </div>
            ))}

            {!hasMore && messages.length > 0 && (
              <div style={{ textAlign: "center", padding: "8px", opacity: 0.6 }}>
                No older messages
              </div>
            )}
          </div>

          {/* Input bar */}
          <form className="message-input" onSubmit={handleSend}>
            <input
              type="text"
              placeholder="Write a message…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              disabled={sending}
            />
            <button type="submit" disabled={sending || !draft.trim()}>
              {sending ? "Sending..." : "Send"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}