import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { getOtherParticipant } from "../../../chat-app-fe/src/utils/conversation";
import { displayName, formatTime } from "../../../chat-app-fe/src/utils/format";
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
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        width: "100%",
        textAlign: "left",
        padding: "10px 14px",
        borderRadius: 12,
        background: active ? "var(--bg-hover)" : "transparent",
        border: "none",
      }}
    >
      <Avatar name={name} online={online} size={42} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
          <span style={{ fontWeight: 600, fontSize: 14.5, fontFamily: "var(--font-display)" }}>{name}</span>
          {last && (
            <span style={{ fontSize: 10.5, color: "var(--text-faint)", fontFamily: "var(--font-mono)", flexShrink: 0 }}>
              {formatTime(last.createdAt)}
            </span>
          )}
        </div>
        <div
          style={{
            fontSize: 12.5,
            color: "var(--text-muted)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {last ? last.content : "No messages yet"}
        </div>
      </div>
    </button>
  );
}
