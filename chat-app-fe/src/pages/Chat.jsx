import { useEffect, useState } from "react";
import { ChatProvider, useChat } from "../context/ChatContext";
import ChatWindow from "../components/ChatWindow";
import Sidebar from "../components/Sidebar";

function ChatShell() {
  const { activeConversation } = useChat();
  // On phones we show one panel at a time: list -> conversation.
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);

  useEffect(() => {
    if (activeConversation) setShowChatOnMobile(true);
  }, [activeConversation]);

  return (
    <div className={`app-shell ${showChatOnMobile ? "show-chat" : ""}`}>
      <Sidebar />
      <ChatWindow onBack={() => setShowChatOnMobile(false)} />
    </div>
  );
}

export default function Chat() {
  return (
    <ChatProvider>
      <ChatShell />
    </ChatProvider>
  );
}
