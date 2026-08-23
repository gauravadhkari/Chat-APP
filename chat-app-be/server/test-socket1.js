const { io } = require("socket.io-client");
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YTdkY2ZjNDc0NjZkNWFmOTExNzljYjEiLCJpYXQiOjE3ODY5NTQ2MDQsImV4cCI6MTc4NzU1OTQwNH0.I2kbiqJKKWIRmM9KFPypPrizmGLiU5LkcnPDbumS4xo"
const socket = io("http://localhost:5000",{
  auth: {
    token: token,
  },
});

socket.on("connect", () => {
  console.log("Connected to server..");
  console.log("Socket Id : ",socket.id);

  const conversationId = "6a7dd730779d1213fd8f35ae";

  socket.emit("joinConversation",conversationId);

  setTimeout(() => {
    socket.emit("sendMessage", {
      conversationId,
      content : "Hello User Validation!",
    });
  },3000);

  setTimeout(() => {
    console.log("User 1 started typing...")
    socket.emit("typing", 
     conversationId
    );
  },3000);
  setTimeout(() => {
    console.log("User 1 stopped typing...")
    socket.emit("stopTyping", 
     conversationId
    );
  },6000);
 /*socket.emit("editMessage",{
    messageId : "6a8434daf105d1cae156e2ab",
    content : "Hello! Your edited message..."
  })
  socket.emit("deleteMessage",{
    messageId : "6a8432a163b6fbc45e43f327"
  });*/

});
socket.on("newMessage" , (message) => {
  console.log("New Message received")
  console.log(message);
})
socket.on("messageDelivered", (data) => {
  console.log("Message Delivered :",data)
})
socket.on("messageSeen", (data) => {
  console.log("Message seen : ",data)
})

socket.on("error", (error) => {
  console.log("Socket error :",error);
})
socket.on("disconnect", () => {
  console.log("Disconnect from server...");
  console.log("Socket id : ", socket.id);
})