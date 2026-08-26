import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";
import { useSocket } from "../context/SocketContext";
import { getOtherParticipant } from "../../../chat-app-fe/src/utils/conversation";
import { displayName, formatDay } from "../../../chat-app-fe/src/utils/format";
import Avatar from "./Avatar";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import TypingIndicator from "./TypingIndicator";

export default function ChatWindow() {
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
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-faint)",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <div style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "var(--text-muted)" }}>
          Pick a conversation
        </div>
        <div style={{ fontSize: 13.5 }}>Or search a username to start a new one.</div>
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
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "16px 20px",
          borderBottom: "1px solid var(--border)",
          position: "relative",
        }}
      >
        <Avatar name={otherName} online={isOtherOnline} size={38} />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15.5 }}>{otherName}</div>
          <div style={{ fontSize: 12, color: isOtherOnline ? "var(--accent-2)" : "var(--text-faint)" }}>
            {isOtherOnline ? "Online" : "Offline"}
          </div>
        </div>

        <button
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Conversation options"
          style={{
            width: 30,
            height: 30,
            borderRadius: "50%",
            border: "1px solid var(--border)",
            background: "var(--bg-surface-raised)",
            color: "var(--text-muted)",
          }}
        >
          ⋯
        </button>

        {menuOpen && (
          <div
            style={{
              position: "absolute",
              top: 54,
              right: 20,
              background: "var(--bg-surface-raised)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              overflow: "hidden",
              zIndex: 5,
              minWidth: 140,
            }}
          >
            <button
              onClick={async () => {
                setMenuOpen(false);
                if (isBlocked) await unblockUser(otherId);
                else await blockUser(otherId);
              }}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "10px 14px",
                background: "transparent",
                border: "none",
                fontSize: 13,
                color: isBlocked ? "var(--accent-2)" : "var(--danger)",
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
            padding: "8px 20px",
            fontSize: 12.5,
            color: "var(--danger)",
            background: "#f0654f14",
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
            style={{
              alignSelf: "center",
              marginBottom: 14,
              background: "var(--bg-surface-raised)",
              border: "1px solid var(--border)",
              borderRadius: 20,
              padding: "6px 16px",
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
              {showDivider && (
                <div
                  style={{
                    alignSelf: "center",
                    fontSize: 11,
                    color: "var(--text-faint)",
                    fontFamily: "var(--font-mono)",
                    margin: "8px 0 14px",
                    padding: "2px 10px",
                    background: "var(--bg-surface)",
                    borderRadius: 10,
                  }}
                >
                  {day}
                </div>
              )}
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

      <div style={{ minHeight: 26, padding: "0 20px" }}>{otherTyping && <TypingIndicator name={otherName} />}</div>

      <MessageInput />
    </div>
  );
}
