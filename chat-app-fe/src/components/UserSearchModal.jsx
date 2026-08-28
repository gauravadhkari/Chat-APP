import { useEffect, useRef, useState } from "react";
import api from "../api/axios";
import { useChat } from "../context/ChatContext";
import { displayName } from "../utils/format";
import Avatar from "./Avatar";

export default function UserSearchModal({ onClose }) {
  const { startConversation, openConversation } = useChat();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const debounceRef = useRef(null);

  useEffect(() => {
    const onEsc = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [onClose]);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        // Backend searches by `username`, a field that doesn't exist on the
        // User schema (only `name` does) — Mongo will just find no matches
        // for that field. Still wiring this up per the documented contract
        // in case the backend gets a matching `username` field later.
        const { data } = await api.get("/users/search", { params: { name: query.trim() } });
        setResults(data.users || []);
      } catch (err) {
        setError(err.response?.data?.message || "Search failed");
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const handleSelect = async (targetUser) => {
    try {
      const convo = await startConversation(targetUser._id);
      if (convo) openConversation(convo);
      onClose();
    } catch (err) {
      // "Conversation already exists" comes back as a 401 with the
      // existing conversation attached — open it instead of failing.
      const existing = err.response?.data?.conversation;
      if (existing) {
        openConversation(existing);
        onClose();
      } else {
        setError(err.response?.data?.message || "Couldn't start conversation");
      }
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="glass-panel"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 440,
          maxWidth: "90vw",
          borderRadius: 22,
          padding: 20,
          animation: "pop-in .18s ease-out",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: 17,
            marginBottom: 4,
            letterSpacing: "-0.02em",
          }}
        >
          Start a conversation
        </div>
        <div style={{ fontSize: 12.5, color: "var(--text-faint)", marginBottom: 14 }}>
          Search someone by name to open a new chat.
        </div>

        <input
          autoFocus
          className="field-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name…"
        />

        <div style={{ marginTop: 12, maxHeight: 320, overflowY: "auto" }}>
          {loading && <div style={{ color: "var(--text-faint)", fontSize: 13, padding: 10 }}>Searching…</div>}
          {error && <div style={{ color: "var(--danger)", fontSize: 13, padding: 10 }}>{error}</div>}
          {!loading && !error && query && results.length === 0 && (
            <div style={{ color: "var(--text-faint)", fontSize: 13, padding: 10 }}>No users found.</div>
          )}
          {results.map((u) => (
            <button key={u._id} onClick={() => handleSelect(u)} className="result-row">
              <Avatar name={displayName(u)} size={36} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{displayName(u)}</div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--text-faint)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {u.email}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
