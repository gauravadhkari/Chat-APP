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
      className="glass-panel sidebar-panel"
      style={{
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        borderRadius: 26,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "20px 20px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div>
          <div className="brand-mark">Wire</div>
          <div style={{ fontSize: 11.5, color: "var(--text-faint)", marginTop: 1 }}>
            {conversations.length} conversation{conversations.length === 1 ? "" : "s"}
          </div>
        </div>
        <button
          onClick={() => setSearchOpen(true)}
          title="New conversation"
          className="btn-primary"
          style={{ width: 36, height: 36, fontSize: 20, lineHeight: 1, padding: 0 }}
        >
          +
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "10px 10px" }}>
        {loadingConversations && (
          <div style={{ padding: 14, color: "var(--text-faint)", fontSize: 13 }}>Loading conversations…</div>
        )}
        {!loadingConversations && conversations.length === 0 && (
          <div
            className="glass"
            style={{
              margin: 8,
              padding: "18px 16px",
              borderRadius: 16,
              color: "var(--text-muted)",
              fontSize: 13,
              lineHeight: 1.5,
            }}
          >
            No conversations yet.
            <br />
            Tap <span style={{ color: "var(--accent)" }}>+</span> to find someone.
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
          padding: "14px 16px",
          borderTop: "1px solid var(--border)",
          background: "rgba(255,255,255,0.03)",
        }}
      >
        <Avatar name={displayName(user)} size={36} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 13.5,
              fontWeight: 600,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {displayName(user)}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-faint)" }}>Online</div>
        </div>
        <button onClick={logout} className="btn" style={{ fontSize: 12, padding: "6px 11px" }}>
          Log out
        </button>
      </div>

      {searchOpen && <UserSearchModal onClose={() => setSearchOpen(false)} />}
    </div>
  );
}
