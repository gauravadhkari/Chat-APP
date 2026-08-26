import axios from  "axios"

 const api = axios.create({
  baseURL:"https://chat-app-2-98p2.onrender.com",
 });
const API_URL = import.meta.env.VITE_API_URL;

// Create conversation with another user
export const createConversation = async (userId, token) => {
  const response = await fetch(
    `${API_URL}/api/conversations`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        userId,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to create conversation");
  }

  return data;
};


// Get conversations of logged-in user
export const getMyConversations = async (token) => {
  const response = await fetch(
    `${API_URL}/api/conversations`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to get conversations");
  }

  return data;
};
 export default api;