import { useState } from "react";
import { formatTime } from "../utils/format";
import { useChat } from "../context/ChatContext";
import { CheckCheck } from "lucide-react";
export default function MessageBubble({ message, isOwn,showStatus }) {
  const { editMessage, deleteMessage , startReply, } = useChat();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(message.content);
  const [menuOpen, setMenuOpen] = useState(false);

  const saveEdit = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== message.content) editMessage(message._id, trimmed);
    setEditing(false);
    setMenuOpen(false);
  };

  const status = message.seenAt
  ? "Seen"
  : message.deliveredAt
  ? "Delivered"
  : null;
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
          {message.replyTo && (
  <div
    style={{
      marginBottom: 7,
      padding: "7px 9px",
      borderRadius: 9,
      background: "rgba(0,0,0,0.16)",
      borderLeft: "3px solid var(--accent)",
      maxWidth: 260,
    }}
  >
    <div
      style={{
        fontSize: 11,
        fontWeight: 600,
        color: "var(--accent)",
        marginBottom: 2,
      }}
    >
      {message.replyTo.sender?.name || "User"}
    </div>

    <div
      style={{
        fontSize: 12,
        opacity: 0.75,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}
    >
      {message.replyTo.isDeleted
        ? "This message was deleted"
        : message.replyTo.content}
    </div>
  </div>
)}
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
          ) : message.isDeleted ? (
  <span
    style={{
      fontStyle: "italic",
      opacity: 0.65,
    }}
  >
    This message was deleted
  </span>
) : (
  message.content
)}
        </div>

        {!editing && !message.isDeleted &&  (
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Message options"
            className="msg-menu-btn glass"
            style={{
              position: "absolute",
              top: -4,
              left: isOwn ? -30 : "auto",
              right: isOwn ? "auto" : -30,
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
  <div
    className="menu-pop"
    style={{
      position: "absolute",
      top: -8,
      left: isOwn ? -114 : "auto",
      right: isOwn ? "auto" : -114,
      zIndex: 5,
      minWidth: 100,
    }}
  >
    <button
      className="menu-item"
      onClick={() => {
        startReply(message);
        setMenuOpen(false);
      }}
    >
      Reply
    </button>

    {isOwn && (
      <>
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
      </>
    )}
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
        {isOwn && showStatus && status && (
  <span
    title={status}
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 3,
      color: message.seenAt
        ? "var(--accent)"
        : "var(--text-faint)",
      fontSize: 10.5,
      transition: "color 0.2s ease",
    }}
  >
    <CheckCheck size={13} strokeWidth={2.2} />
    {status}
  </span>
)}
      </div>
    </div>
  );
}
