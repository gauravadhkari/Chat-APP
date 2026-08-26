import { useState } from "react";
import ConversationList from "../components/ConversationList";
import CreateConversation from "../components/CreateConversation";

function Dashboard() {
  // For now, get the JWT from localStorage.
  // Later we'll replace this with AuthContext.
  const token = localStorage.getItem("token");

  const [selectedConversation, setSelectedConversation] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState("");

  const handleConversationCreated = (conversation) => {
    console.log("Created conversation:", conversation);

    setSelectedConversation(conversation);
  };

  return (
    <div>
      <h1>Chat Dashboard</h1>

      <hr />

      <h2>Create Conversation</h2>

      <input
        type="text"
        placeholder="Enter user ID"
        value={selectedUserId}
        onChange={(e) => setSelectedUserId(e.target.value)}
      />

      <CreateConversation
        userId={selectedUserId}
        token={token}
        onConversationCreated={handleConversationCreated}
      />

      <hr />

      <div>
        <ConversationList
          token={token}
          onSelectConversation={setSelectedConversation}
        />
      </div>

      <hr />

      {selectedConversation && (
        <div>
          <h2>Selected Conversation</h2>

          <p>
            Conversation ID:{" "}
            {selectedConversation._id}
          </p>

          <h3>Participants</h3>

          {selectedConversation.participants.map((user) => (
            <p key={user._id}>
              {user.username} - {user.email}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;