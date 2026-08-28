import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";
import { useSocket } from "../context/SocketContext";
import { getOtherParticipant } from "../utils/conversation";
import { displayName, formatDay } from "../utils/format";
import Avatar from "./Avatar";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import TypingIndicator from "./TypingIndicator";

export default function ChatWindow({ onBack }) {
  const { user } = useAuth();
  const {
    activeConversation,
    messages,
    loadingMessages,
    hasMore,
    loadMoreMessages,
    typingUserIds,
    blockedUserIds,
    blockUser,
    unblockUser,
  } = useChat();
  const [menuOpen, setMenuOpen] = useState(false);
  const { onlineUserIds } = useSocket();
  const bottomRef = useRef(null);
  const scrollRef = useRef(null);
  const prevMsgCount = useRef(0);

  useEffect(() => {
    if (messages.length > prevMsgCount.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevMsgCount.current = messages.length;
  }, [messages]);

  if (!activeConversation) {
    return (
      <div
        className="glass-panel chat-panel"
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 10,
          borderRadius: 26,
          textAlign: "center",
          padding: 24,
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 22,
            background: "var(--gradient-primary)",
            boxShadow: "var(--shadow-glow)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
            marginBottom: 6,
          }}
        >
          💬
        </div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 22, letterSpacing: "-0.02em" }}>
          Pick a conversation
        </div>
        <div style={{ fontSize: 13.5, color: "var(--text-muted)" }}>
          Or search a username to start a new one.
        </div>
      </div>
    );
  }

  const other = getOtherParticipant(activeConversation, user._id);
  const otherId = other?._id || other;
  const otherName = displayName(other);
  const isOtherOnline = onlineUserIds.has(otherId);
  const otherTyping = typingUserIds.has(otherId);
  const isBlocked = blockedUserIds.has(otherId);

  let lastDay = null;

  return (
    <div
      className="glass-panel chat-panel"
      style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, borderRadius: 26 }}
    >
      <div
        className="chat-header"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "16px 20px",
          borderBottom: "1px solid var(--border)",
          position: "relative",
          background: "rgba(255,255,255,0.03)",
        }}
      >
        <button
          onClick={onBack}
          aria-label="Back to conversations"
          className="btn back-btn"
          style={{ width: 34, height: 34, borderRadius: 12, flexShrink: 0, fontSize: 16 }}
        >
          ‹
        </button>
        <Avatar name={otherName} online={isOtherOnline} size={40} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 16, letterSpacing: "-0.01em" }}>
            {otherName}
          </div>
          <div
            style={{
              fontSize: 12,
              color: isOtherOnline ? "#34d399" : "var(--text-faint)",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {otherTyping ? "typing…" : isOtherOnline ? "Online" : "Offline"}
          </div>
        </div>

        <button
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Conversation options"
          className="btn"
          style={{ width: 34, height: 34, borderRadius: "50%", color: "var(--text-muted)" }}
        >
          ⋯
        </button>

        {menuOpen && (
          <div className="menu-pop" style={{ position: "absolute", top: 58, right: 20, zIndex: 5, minWidth: 150 }}>
            <button
              className="menu-item"
              style={{ color: isBlocked ? "var(--accent)" : "var(--danger)" }}
              onClick={async () => {
                setMenuOpen(false);
                if (isBlocked) await unblockUser(otherId);
                else await blockUser(otherId);
              }}
            >
              {isBlocked ? "Unblock user" : "Block user"}
            </button>
          </div>
        )}
      </div>

      {isBlocked && (
        <div
          style={{
            padding: "9px 20px",
            fontSize: 12.5,
            color: "var(--danger)",
            background: "rgba(251,113,133,0.1)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          You've blocked {otherName}. Unblock them to send or receive messages.
        </div>
      )}

      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "18px 20px 4px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {hasMore && (
          <button
            onClick={loadMoreMessages}
            disabled={loadingMessages}
            className="btn"
            style={{
              alignSelf: "center",
              marginBottom: 14,
              borderRadius: 999,
              padding: "7px 18px",
              fontSize: 12.5,
              color: "var(--text-muted)",
            }}
          >
            {loadingMessages ? "Loading…" : "Load earlier messages"}
          </button>
        )}

        {messages.map((m) => {
          const senderId = m.sender?._id || m.sender;
          const isOwn = senderId === user._id;
          const day = formatDay(m.createdAt);
          const showDivider = day !== lastDay;
          lastDay = day;
          return (
            <div key={m._id} style={{ display: "flex", flexDirection: "column" }}>
              {showDivider && <div className="day-chip">{day}</div>}
              <MessageBubble message={m} isOwn={isOwn} />
            </div>
          );
        })}

        {!loadingMessages && messages.length === 0 && (
          <div style={{ margin: "auto", color: "var(--text-faint)", fontSize: 13.5 }}>
            No messages yet. Say hello 👋
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div style={{ minHeight: 28, padding: "0 20px" }}>
        {otherTyping && <TypingIndicator name={otherName} />}
      </div>

      <MessageInput />
    </div>
  );
}
