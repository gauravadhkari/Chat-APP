import { useState } from "react";
import { formatTime } from "../utils/format";
import { useChat } from "../context/ChatContext";

export default function MessageBubble({ message, isOwn }) {
  const { editMessage, deleteMessage } = useChat();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(message.content);
  const [menuOpen, setMenuOpen] = useState(false);

  const saveEdit = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== message.content) editMessage(message._id, trimmed);
    setEditing(false);
    setMenuOpen(false);
  };

  const status = message.seenAt ? "Seen" : message.deliveredAt ? "Delivered" : "Sent";
  const statusMark = message.seenAt ? "✓✓" : message.deliveredAt ? "✓✓" : "✓";

  return (
    <div
      className="message-row"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: isOwn ? "flex-end" : "flex-start",
        marginBottom: 12,
        maxWidth: "72%",
        alignSelf: isOwn ? "flex-end" : "flex-start",
      }}
      onMouseLeave={() => setMenuOpen(false)}
    >
      <div style={{ position: "relative" }}>
        <div className={`bubble ${isOwn ? "bubble-own" : "bubble-other"}`}>
          {editing ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 200 }}>
              <textarea
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={2}
                style={{
                  background: "rgba(0,0,0,0.18)",
                  border: "1px solid rgba(255,255,255,0.18)",
                  borderRadius: 10,
                  color: "inherit",
                  fontSize: 14,
                  padding: 8,
                  resize: "vertical",
                }}
              />
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button
                  onClick={() => setEditing(false)}
                  style={{
                    background: "transparent",
                    border: "none",
                    fontSize: 12,
                    color: "inherit",
                    opacity: 0.75,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={saveEdit}
                  style={{
                    background: "rgba(0,0,0,0.22)",
                    border: "none",
                    borderRadius: 8,
                    fontSize: 12,
                    padding: "4px 10px",
                    color: "inherit",
                    fontWeight: 600,
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            message.content
          )}
        </div>

        {isOwn && !editing && (
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Message options"
            className="msg-menu-btn glass"
            style={{
              position: "absolute",
              top: -4,
              left: -30,
              width: 24,
              height: 24,
              borderRadius: "50%",
              color: "var(--text-muted)",
              fontSize: 13,
              opacity: 0,
              transition: "opacity .12s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ⋯
          </button>
        )}

        {menuOpen && (
          <div className="menu-pop" style={{ position: "absolute", top: -8, left: -114, zIndex: 5, minWidth: 100 }}>
            <button
              className="menu-item"
              onClick={() => {
                setEditing(true);
                setMenuOpen(false);
              }}
            >
              Edit
            </button>
            <button
              className="menu-item"
              style={{ color: "var(--danger)" }}
              onClick={() => {
                deleteMessage(message._id);
                setMenuOpen(false);
              }}
            >
              Delete
            </button>
          </div>
        )}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginTop: 4,
          fontFamily: "var(--font-mono)",
          fontSize: 10.5,
          color: "var(--text-faint)",
        }}
      >
        <span>{formatTime(message.createdAt)}</span>
        {message.edited && <span>· edited</span>}
        {isOwn && (
          <span
            title={status}
            style={{ color: message.seenAt ? "var(--accent)" : "var(--text-faint)", letterSpacing: "-1px" }}
          >
            · {statusMark}
          </span>
        )}
      </div>
    </div>
  );
}
