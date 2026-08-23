const { io } = require("socket.io-client");

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YTdkY2ZkMzc0NjZkNWFmOTExNzljYjIiLCJpYXQiOjE3ODczMDQwNjUsImV4cCI6MTc4NzkwODg2NX0.JKu-1a70i7KoIbusqDlSjX0tAaBov3yHt99ZxF7Q2TQ"

const conversationId = "6a7dd730779d1213fd8f35ae";

const socket = io("http://127.0.0.1:5000", {
  auth: {
    token,
  },
});

socket.on("connect", () => {
  console.log("User 2 connected:", socket.id);

  socket.emit("joinConversation", conversationId);
});

socket.on("newMessage", (message) => {
  console.log("USER 2 RECEIVED:", message);
  socket.emit("messageDelivered", message._id);

  setTimeout(()=> {
    socket.emit("messageSeen",message._id);
  },1000);
});

socket.on("userTyping", (data) => {
  console.log("User 2 :",data.userId,"is Typing....")
})
socket.on("userStoppedTyping", (data) => {
  console.log("User 2 :",data.userId,"stopped Typing....")
})

socket.on("error", (error) => {
  console.log("USER 2 ERROR:", error);
});