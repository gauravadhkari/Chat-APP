import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { getOtherParticipant } from "../utils/conversation";
import { displayName, formatTime } from "../utils/format";
import Avatar from "./Avatar";

export default function ConversationItem({ conversation, active, onClick }) {
  const { user } = useAuth();
  const { onlineUserIds } = useSocket();

  const other = getOtherParticipant(conversation, user._id);
  const otherId = other?._id || other;
  const name = displayName(other);
  const online = onlineUserIds.has(otherId);
  const last = conversation.lastMessage;
  const unreadCount = conversation.unreadCounts || 0;
  const hasUnread = unreadCount > 0;
  return (
    <button onClick={onClick} className={`convo-item ${active ? "active" : ""}`}>
      <Avatar name={name} online={online} size={44} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "baseline" }}>
          <span
            style={{
              fontWeight: hasUnread ? 700 : 600,
              fontSize: 14.5,
              fontFamily: "var(--font-display)",
              letterSpacing: "-0.01em",
            }}
          >
            {name}
          </span>
          {last && (
            <span
              style={{
                color: hasUnread
                ? "var(--text-primary)"
                : last
                ? "var(--text-muted)"
                : "var(--text-faint)",
                fontWeight: hasUnread ? 600 : 400,
                fontSize: 10.5,
                fontFamily: "var(--font-mono)",
                flexShrink: 0,
              }}
            >
              {formatTime(last.createdAt)}
            </span>
          )}
        </div>
        <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginTop: 2,
  }}
>
  <div
    style={{
      flex: 1,
      minWidth: 0,
      fontSize: 12.5,
      color: hasUnread
        ? "var(--text-primary)"
        : last
        ? "var(--text-muted)"
        : "var(--text-faint)",
      fontWeight: hasUnread ? 600 : 400,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    }}
  >
    {last ? last.content : "No messages yet"}
  </div>

  {hasUnread && (
    <span
      style={{
        minWidth: 20,
        height: 20,
        padding: "0 6px",
        borderRadius: 999,
        background: "var(--accent)",
        color: "#07111f",
        fontSize: 10.5,
        fontWeight: 700,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {unreadCount > 99 ? "99+" : unreadCount}
    </span>
  )}
</div>
      </div>
    </button>
  );
}
