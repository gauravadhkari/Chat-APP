import { useEffect, useRef, useState } from "react";
import api from "../../../chat-app-fe/src/api/axios";
import { useChat } from "../context/ChatContext";
import { displayName } from "../../../chat-app-fe/src/utils/format";
import Avatar from "./Avatar";

export default function UserSearchModal({ onClose }) {
  const { startConversation, openConversation } = useChat();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const debounceRef = useRef(null);

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
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(6,8,12,0.6)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: "12vh",
        zIndex: 50,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 420,
          maxWidth: "90vw",
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          padding: 18,
          boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
        }}
      >
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 16, marginBottom: 12 }}>
          Start a conversation
        </div>
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name…"
          style={{
            width: "100%",
            background: "var(--bg-surface-raised)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: "10px 14px",
            fontSize: 14,
            color: "var(--text-primary)",
          }}
        />

        <div style={{ marginTop: 12, maxHeight: 320, overflowY: "auto" }}>
          {loading && <div style={{ color: "var(--text-faint)", fontSize: 13, padding: 8 }}>Searching…</div>}
          {error && <div style={{ color: "var(--danger)", fontSize: 13, padding: 8 }}>{error}</div>}
          {!loading && !error && query && results.length === 0 && (
            <div style={{ color: "var(--text-faint)", fontSize: 13, padding: 8 }}>No users found.</div>
          )}
          {results.map((u) => (
            <button
              key={u._id}
              onClick={() => handleSelect(u)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                width: "100%",
                textAlign: "left",
                padding: "9px 8px",
                background: "transparent",
                border: "none",
                borderRadius: 10,
              }}
            >
              <Avatar name={displayName(u)} size={34} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{displayName(u)}</div>
                <div style={{ fontSize: 12, color: "var(--text-faint)" }}>{u.email}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
