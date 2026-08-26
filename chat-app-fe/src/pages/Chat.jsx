import { ChatProvider } from "../context/ChatContext";
import ChatWindow from "../components/ChatWindow";
import Sidebar from "../components/Sidebar";

export default function Chat() {
  return (
    <ChatProvider>
      <div style={{ display: "flex", height: "100%" }}>
        <Sidebar />
        <ChatWindow />
      </div>
    </ChatProvider>
  );
}
