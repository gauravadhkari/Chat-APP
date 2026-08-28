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

  return (
    <button onClick={onClick} className={`convo-item ${active ? "active" : ""}`}>
      <Avatar name={name} online={online} size={44} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "baseline" }}>
          <span
            style={{
              fontWeight: 600,
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
                fontSize: 10.5,
                color: "var(--text-faint)",
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
            fontSize: 12.5,
            color: last ? "var(--text-muted)" : "var(--text-faint)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            marginTop: 2,
          }}
        >
          {last ? last.content : "No messages yet"}
        </div>
      </div>
    </button>
  );
}
