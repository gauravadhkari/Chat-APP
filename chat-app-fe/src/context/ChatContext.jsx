import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import api from "../api/axios";
import { useAuth } from "./AuthContext";
import { useSocket } from "./SocketContext";

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [conversations, setConversations] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [typingUserIds, setTypingUserIds] = useState(() => new Set());
  // The backend never exposes the current user's existing blockedUsers list
  // (no "me" / profile endpoint), so this only tracks blocks/unblocks made
  // during this session rather than reflecting true server state on load.
  const [blockedUserIds, setBlockedUserIds] = useState(() => new Set());

  const blockUser = useCallback(async (userId) => {
    await api.post(`/users/block/${userId}`);
    setBlockedUserIds((prev) => new Set(prev).add(userId));
  }, []);

  const unblockUser = useCallback(async (userId) => {
    await api.post(`/users/unblock/${userId}`);
    setBlockedUserIds((prev) => {
      const next = new Set(prev);
      next.delete(userId);
      return next;
    });
  }, []);

  const activeConversationRef = useRef(null);
  useEffect(() => {
    activeConversationRef.current = activeConversation;
  }, [activeConversation]);

  // ---- Conversations list ----
  // GET /api/conversations has two competing route handlers registered on
  // the backend for the same path; Express only ever runs the first one
  // (getMyConversation), which responds with { conversation: [...] } —
  // note the singular, unenriched key (no lastMessage/unreadCounts).
  const loadConversations = useCallback(async () => {
    setLoadingConversations(true);
    try {
      const { data } = await api.get("/conversations");
      const list = data.conversation || data.conversations || [];
      setConversations(list);
    } finally {
      setLoadingConversations(false);
    }
  }, []);

  useEffect(() => {
    if (user) loadConversations();
  }, [user, loadConversations]);

  const startConversation = useCallback(async (otherUserId) => {
    const { data } = await api.post("/conversations", { userId: otherUserId });
    const convo = data.conversation;
    if (convo) {
      setConversations((prev) => {
        const exists = prev.some((c) => c._id === convo._id);
        return exists ? prev : [convo, ...prev];
      });
    }
    return convo;
  }, []);

  // ---- Messages for the active conversation ----
  // GET /api/messages/:conversationId is paginated and sorted newest-first
  // server-side, so we reverse each page before merging into state.
  const loadMessages = useCallback(async (conversationId, pageToLoad = 1) => {
    setLoadingMessages(true);
    try {
      const { data } = await api.get(`/messages/${conversationId}`, {
        params: { page: pageToLoad, limit: 30 },
      });
      const chronological = [...data.message].reverse();
      setMessages((prev) => (pageToLoad === 1 ? chronological : [...chronological, ...prev]));
      setHasMore(Boolean(data.hasMore));
      setPage(pageToLoad);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  const openConversation = useCallback(
    (conversation) => {
      setActiveConversation(conversation);
      setConversations((prev) =>
  prev.map((c) =>
    c._id === conversation._id
      ? { ...c, unreadCounts: 0 }
      : c
  )
);
      setMessages([]);
      setTypingUserIds(new Set());
      if (conversation?._id) {
        loadMessages(conversation._id, 1);
        socket?.emit("joinConversation", conversation._id);
        socket?.emit("markConversationAsRead", { conversationId: conversation._id });
      }
    },
    [loadMessages, socket]
  );

  const loadMoreMessages = useCallback(() => {
    if (activeConversation?._id && hasMore && !loadingMessages) {
      loadMessages(activeConversation._id, page + 1);
    }
  }, [activeConversation, hasMore, loadingMessages, page, loadMessages]);

  // ---- Socket event wiring ----
  useEffect(() => {
    if (!socket) return;

    const onNewMessage = (message) => {
      console.log("🔥 NEW MESSAGE RECEIVED:", message);
      if (activeConversationRef.current?._id === message.conversation) {
        setMessages((prev) => [...prev, message]);
        socket.emit("messageDelivered", message._id);
        if (message.sender?._id !== user?._id && message.sender !== user?._id) {
          socket.emit("messageSeen", message._id);
        }
      }
      setConversations((prev) => {
  const conversationId =
  message.conversation?._id || message.conversation;

const index = prev.findIndex(
  (c) => String(c._id) === String(conversationId)
);

if (index === -1) {
  loadConversations();
  return prev;
}

  const conversation = prev[index];

  const isMine =
    message.sender?._id === user?._id ||
    message.sender === user?._id;

  const isChatOpen =
    activeConversationRef.current?._id === message.conversation;

  const updatedConversation = {
    ...conversation,

    lastMessage: message,
    lastMessageAt: message.createdAt,

    unreadCounts:
      !isMine && !isChatOpen
        ? (conversation.unreadCounts || 0) + 1
        : conversation.unreadCounts || 0,
  };

  const remaining = prev.filter(
    (c) => c._id !== message.conversation
  );

  return [
    updatedConversation,
    ...remaining
  ];
});
    };

    const onTyping = ({ userId, conversationId }) => {
      if (activeConversationRef.current?._id === conversationId) {
        setTypingUserIds((prev) => new Set(prev).add(userId));
      }
    };
    const onStopTyping = ({ userId, conversationId }) => {
      if (activeConversationRef.current?._id === conversationId) {
        setTypingUserIds((prev) => {
          const next = new Set(prev);
          next.delete(userId);
          return next;
        });
      }
    };

    const onMessageDelivered = ({ messageId, deliveredAt }) => {
      setMessages((prev) => prev.map((m) => (m._id === messageId ? { ...m, deliveredAt } : m)));
    };
    const onMessageSeen = ({ messageId, seenAt }) => {
      setMessages((prev) => prev.map((m) => (m._id === messageId ? { ...m, seenAt } : m)));
    };
    const onMessageEdited = ({ messageId, content }) => {
      setMessages((prev) => prev.map((m) => (m._id === messageId ? { ...m, content, edited: true } : m)));
    };
    const onMessageDeleted = ({
    messageId,
    deletedAt,
    conversationId,
    lastMessageChanged,
    newLastMessage,
    senderId,
    wasUnread,
}) => {
  setMessages((prev) =>
    prev.map((m) =>
      String(m._id) === String(messageId)
        ? {
            ...m,
            content: "This message was deleted",
            isDeleted: true,
            deletedAt,
            edited: false,
          }
        : m
    )
  );

  setConversations((prev) =>
    prev.map((conversation) => {
      if (String(conversation._id) !== String(conversationId)) {
        return conversation;
      }

      const updated = { ...conversation };

      if (lastMessageChanged) {
        updated.lastMessage = newLastMessage;
        updated.lastMessageAt =
          newLastMessage?.createdAt || null;
      }

      // Deleted message was unread for THIS user
      if (
        wasUnread &&
        String(senderId) !== String(user?._id)
      ) {
        updated.unreadCounts = Math.max(
          (conversation.unreadCounts || 0) - 1,
          0
        );
      }

      return updated;
    })
  );
};
    const onConversationRead = ({ conversation, userId }) => {
  setMessages((prev) =>
    prev.map((m) =>
      m.conversation === conversation
        ? {
            ...m,
            seenAt: m.seenAt || new Date().toISOString(),
          }
        : m
    )
  );

  if (userId === user?._id) {
    setConversations((prev) =>
      prev.map((c) =>
        c._id === conversation
          ? { ...c, unreadCounts: 0 }
          : c
      )
    );
  }
};
    const onSocketError = (err) => {
      console.error("Socket error:", err?.message);
    };

    socket.on("newMessage", onNewMessage);
    socket.on("userTyping", onTyping);
    socket.on("userStoppedTyping", onStopTyping);
    socket.on("messageDelivered", onMessageDelivered);
    socket.on("messageSeen", onMessageSeen);
    socket.on("messageEdited", onMessageEdited);
    socket.on("messageDeleted", onMessageDeleted);
    socket.on("conversationRead", onConversationRead);
    socket.on("error", onSocketError);

    return () => {
      socket.off("newMessage", onNewMessage);
      socket.off("userTyping", onTyping);
      socket.off("userStoppedTyping", onStopTyping);
      socket.off("messageDelivered", onMessageDelivered);
      socket.off("messageSeen", onMessageSeen);
      socket.off("messageEdited", onMessageEdited);
      socket.off("messageDeleted", onMessageDeleted);
      socket.off("conversationRead", onConversationRead);
      socket.off("error", onSocketError);
    };
  }, [socket, user]);

  const sendMessage = useCallback(
    (content) => {
      if (!activeConversation?._id || !content.trim() || !socket) return;
      socket.emit("sendMessage", { conversationId: activeConversation._id, content: content.trim() });
    },
    [activeConversation, socket]
  );

  const editMessage = useCallback(
    (messageId, content) => {
      socket?.emit("editMessage", { messageId, content });
    },
    [socket]
  );

  const deleteMessage = useCallback(
    (messageId) => {
      socket?.emit("deleteMessage", { messageId });
    },
    [socket]
  );

  const emitTyping = useCallback(() => {
    if (activeConversation?._id) socket?.emit("typing",  activeConversation._id );
  }, [activeConversation, socket]);

  const emitStopTyping = useCallback(() => {
    if (activeConversation?._id) socket?.emit("stopTyping", activeConversation._id );
  }, [activeConversation, socket]);

  return (
    <ChatContext.Provider
      value={{
        conversations,
        loadingConversations,
        loadConversations,
        startConversation,
        activeConversation,
        openConversation,
        messages,
        loadingMessages,
        hasMore,
        loadMoreMessages,
        typingUserIds,
        sendMessage,
        editMessage,
        deleteMessage,
        emitTyping,
        emitStopTyping,
        blockedUserIds,
        blockUser,
        unblockUser,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
}
