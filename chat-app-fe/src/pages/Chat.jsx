import { ChatProvider } from "../context/ChatContext";
import ChatWindow from "../components/ChatWindow";
import Sidebar from "../components/Sidebar";

export default function Chat() {
  return (
    <ChatProvider>
      <div className="app-shell">
        <Sidebar />
        <ChatWindow />
      </div>
    </ChatProvider>
  );
}
