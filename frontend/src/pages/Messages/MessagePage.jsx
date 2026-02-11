import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./MessagePage.css";
import { useAuth } from "../../context/AuthContext";
import { createOrGetThread, getThreadById } from "../../services/ThreadService";
import { createMessage } from "../../services/MessageService";
import { getUserById } from "../../services/UserService";


export default function MessagesPage() {
  const { userId: otherUserId } = useParams(); // other user id
  const navigate = useNavigate();
  const { token, isAuth, userId: myUserId } = useAuth();
  const [otherUser, setOtherUser] = useState(null);


  const listRef = useRef(null);

  const [threadId, setThreadId] = useState(null);

  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");

  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [sending, setSending] = useState(false);

  const [limit, setLimit] = useState(20); // backend supports limit (DESC)
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState("");

  // --- guard / auth ---
  useEffect(() => {
    if (!isAuth) navigate("/login", { replace: true });
  }, [isAuth, navigate]);

  // block chatting with yourself
  useEffect(() => {
    if (myUserId && otherUserId && String(myUserId) === String(otherUserId)) {
      navigate("/", { replace: true });
    }
  }, [myUserId, otherUserId, navigate]);

  // 1) create or get thread between users
  useEffect(() => {
    if (!token || !myUserId || !otherUserId) return;

    let alive = true;

    async function ensureThread() {
      try {
        setError("");
        const data = await createOrGetThread(myUserId, otherUserId, token);
        const id = data?.thread?.id;

        if (!id) throw new Error("Thread id missing from response");
        if (!alive) return;

        setThreadId(id);
      } catch (e) {
        if (!alive) return;
        setError(String(e?.message || "Failed to create/load thread"));
      }
    }

    ensureThread();
    return () => {
      alive = false;
    };
  }, [token, myUserId, otherUserId]);

  // 2) load messages for thread (backend gives DESC, we reverse for UI)
  useEffect(() => {
    if (!token || !threadId) return;

    let alive = true;

    async function load() {
      try {
        setLoadingInitial(true);
        setError("");

        const data = await getThreadById(threadId, limit, token);
        const raw = Array.isArray(data?.messages) ? data.messages : [];

        // backend: ORDER BY sent_at DESC LIMIT ?
        // UI wants old -> new
        const chronological = [...raw].reverse();

        if (!alive) return;

        setMessages(chronological);

        // if backend returned fewer than requested, no more
        setHasMore(raw.length >= limit && limit < 100);

        // scroll to bottom after initial load / updates
        requestAnimationFrame(() => {
          const el = listRef.current;
          if (el) el.scrollTop = el.scrollHeight;
        });
      } catch (e) {
        if (!alive) return;
        setError(String(e?.message || "Failed to load messages"));
        setMessages([]);
      } finally {
        if (alive) setLoadingInitial(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [token, threadId, limit]);
  useEffect(() => {
    if (!token || !otherUserId) return;

    let alive = true;

    async function loadOtherUser() {
      try {
        const u = await getUserById(otherUserId, token);
        if (!alive) return;
        setOtherUser(u);
      } catch {
        if (!alive) return;
        setOtherUser(null);
      }
    }

    loadOtherUser();
    return () => {
      alive = false;
    };
  }, [token, otherUserId]);


  // 3) load older: backend doesn't give cursor, so we increase limit (up to 100)
  async function loadOlder() {
    if (!hasMore || loadingOlder || loadingInitial) return;
    if (limit >= 100) return;

    const el = listRef.current;
    if (!el) return;

    const prevScrollHeight = el.scrollHeight;
    const prevScrollTop = el.scrollTop;

    try {
      setLoadingOlder(true);

      // increase limit by 20, backend returns latest N messages
      const nextLimit = Math.min(100, limit + 20);
      setLimit(nextLimit);

      // keep viewport stable after rerender
      requestAnimationFrame(() => {
        const newScrollHeight = el.scrollHeight;
        el.scrollTop = prevScrollTop + (newScrollHeight - prevScrollHeight);
      });
    } finally {
      setLoadingOlder(false);
    }
  }

  function onScroll() {
    const el = listRef.current;
    if (!el) return;
    if (el.scrollTop <= 20) loadOlder();
  }

  // 4) send message
  async function handleSend(e) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || !token || !threadId || !myUserId) return;

    try {
      setSending(true);
      setError("");

      const created = await createMessage(
        { thread_id: threadId, sender_id: myUserId, message: text },
        token
      );

      // backend returns: { id, thread_id, sender_id, message, sent_at }
      const newMsg = created ?? {
        id: Date.now(),
        thread_id: threadId,
        sender_id: myUserId,
        message: text,
        sent_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, newMsg]);
      setDraft("");

      requestAnimationFrame(() => {
        const el = listRef.current;
        if (el) el.scrollTop = el.scrollHeight;
      });
    } catch (e2) {
      setError(String(e2?.message || "Failed to send message"));
    } finally {
      setSending(false);
    }
  }
  
  const title = useMemo(() => {
    if (!otherUser) return `Chat with user #${otherUserId}`;

    const fullName = [otherUser.first_name, otherUser.last_name].filter(Boolean).join(" ");
    const username = otherUser.username ? `(${otherUser.username})` : "";

    return `${fullName || "Unknown"} ${username}`.trim();
  }, [otherUser, otherUserId]);


  function isMine(msg) {
    const senderId = msg.sender_id ?? msg.senderId ?? msg.from_user_id ?? null;
    return senderId != null && String(senderId) === String(myUserId);
  }

  if (loadingInitial) return <p style={{ padding: "40px" }}>Loading messages...</p>;

  return (
    <div className="messages-page">
      <header className="messages-header">
        <h2>Messages</h2>
        <div className="messages-subtitle">{title}</div>
      </header>

      <main className="messages-wrapper">
        <section className="messages-panel">
          {error && <div style={{ padding: "10px", color: "red" }}>{String(error)}</div>}

          <div className="messages-list" ref={listRef} onScroll={onScroll}>
            {loadingOlder && (
              <div style={{ textAlign: "center", padding: "8px", opacity: 0.7 }}>
                Loading older...
              </div>
            )}

            {messages.map((m) => (
              <div key={m.id} className={`message-row ${isMine(m) ? "right" : "left"}`}>
                <div className={`message-bubble ${isMine(m) ? "me" : "other"}`}>
                  {m.message ?? m.text ?? ""}
                </div>
              </div>
            ))}

            {!hasMore && messages.length > 0 && (
              <div style={{ textAlign: "center", padding: "8px", opacity: 0.6 }}>
                No older messages
              </div>
            )}
          </div>

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
