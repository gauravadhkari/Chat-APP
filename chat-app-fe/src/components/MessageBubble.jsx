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

  return (
    <div
      className="message-row"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: isOwn ? "flex-end" : "flex-start",
        marginBottom: 10,
        maxWidth: "72%",
        alignSelf: isOwn ? "flex-end" : "flex-start",
      }}
      onMouseLeave={() => setMenuOpen(false)}
    >
      <div style={{ position: "relative" }}>
        <div
          style={{
            background: isOwn ? "var(--accent)" : "var(--bg-surface-raised)",
            color: isOwn ? "#1a0d08" : "var(--text-primary)",
            padding: "9px 13px",
            borderRadius: isOwn ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
            fontSize: 14.5,
            lineHeight: 1.45,
            wordBreak: "break-word",
            whiteSpace: "pre-wrap",
          }}
        >
          {editing ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 180 }}>
              <textarea
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={2}
                style={{
                  background: "rgba(0,0,0,0.15)",
                  border: "1px solid rgba(0,0,0,0.2)",
                  borderRadius: 8,
                  color: "inherit",
                  fontSize: 14,
                  padding: 6,
                  resize: "vertical",
                }}
              />
              <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                <button
                  onClick={() => setEditing(false)}
                  style={{ background: "transparent", border: "none", fontSize: 12, color: "inherit", opacity: 0.75 }}
                >
                  Cancel
                </button>
                <button
                  onClick={saveEdit}
                  style={{
                    background: "rgba(0,0,0,0.2)",
                    border: "none",
                    borderRadius: 6,
                    fontSize: 12,
                    padding: "3px 8px",
                    color: "inherit",
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
            style={{
              position: "absolute",
              top: -6,
              left: -26,
              width: 22,
              height: 22,
              borderRadius: "50%",
              border: "none",
              background: "var(--bg-hover)",
              color: "var(--text-muted)",
              fontSize: 13,
              opacity: 0,
              transition: "opacity .12s",
            }}
            className="msg-menu-btn"
          >
            ⋯
          </button>
        )}

        {menuOpen && (
          <div
            style={{
              position: "absolute",
              top: -8,
              left: -108,
              background: "var(--bg-surface-raised)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              overflow: "hidden",
              zIndex: 5,
              minWidth: 96,
            }}
          >
            <button
              onClick={() => {
                setEditing(true);
                setMenuOpen(false);
              }}
              style={menuItemStyle}
            >
              Edit
            </button>
            <button
              onClick={() => {
                deleteMessage(message._id);
                setMenuOpen(false);
              }}
              style={{ ...menuItemStyle, color: "var(--danger)" }}
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
          marginTop: 3,
          fontFamily: "var(--font-mono)",
          fontSize: 10.5,
          color: "var(--text-faint)",
        }}
      >
        <span>{formatTime(message.createdAt)}</span>
        {message.edited && <span>· edited</span>}
        {isOwn && <span>· {status}</span>}
      </div>
    </div>
  );
}

const menuItemStyle = {
  display: "block",
  width: "100%",
  textAlign: "left",
  padding: "8px 12px",
  background: "transparent",
  border: "none",
  fontSize: 13,
  color: "var(--text-primary)",
};
