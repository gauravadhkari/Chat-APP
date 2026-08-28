import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";
import { displayName } from "../utils/format";
import Avatar from "./Avatar";
import ConversationItem from "./ConversationItem";
import UserSearchModal from "./UserSearchModal";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { conversations, loadingConversations, activeConversation, openConversation } = useChat();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div
      style={{
        width: 320,
        flexShrink: 0,
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        background: "var(--bg-surface)",
      }}
    >
      <div style={{ padding: "18px 18px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 19, letterSpacing: "-0.02em" }}>
          Wire
        </div>
        <button
          className="new-convo-btn"
          onClick={() => setSearchOpen(true)}
          title="New conversation"
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            border: "1px solid var(--border)",
            background: "var(--bg-surface-raised)",
            color: "var(--accent-2)",
            fontSize: 17,
            lineHeight: 1,
          }}
        >
          +
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "4px 10px" }}>
        {loadingConversations && (
          <div style={{ padding: 14, color: "var(--text-faint)", fontSize: 13 }}>Loading conversations…</div>
        )}
        {!loadingConversations && conversations.length === 0 && (
          <div style={{ padding: 14, color: "var(--text-faint)", fontSize: 13 }}>
            No conversations yet. Tap + to find someone.
          </div>
        )}
        {conversations.map((c) => (
          <ConversationItem
            key={c._id}
            conversation={c}
            active={activeConversation?._id === c._id}
            onClick={() => openConversation(c)}
          />
        ))}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "12px 16px",
          borderTop: "1px solid var(--border)",
        }}
      >
        <Avatar name={displayName(user)} size={34} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {displayName(user)}
          </div>
        </div>
        <button
          onClick={logout}
          style={{
            fontSize: 12,
            color: "var(--text-muted)",
            background: "transparent",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: "5px 10px",
          }}
        >
          Log out
        </button>
      </div>

      {searchOpen && <UserSearchModal onClose={() => setSearchOpen(false)} />}
    </div>
  );
}
