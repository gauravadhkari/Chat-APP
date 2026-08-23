# Chat Application Backend API

## Base URL
http://localhost:3000
---

# Authentication
## Signup
POST /api/auth/signup

### Body

{
  "username": "user1",
  "email": "user1@gmail.com",
  "password": "password123"
}
---

## Login

POST /api/auth/login

### Body

{
  "email": "user1@gmail.com",
  "password": "password123"
}

### Response

{
  "token": "JWT_TOKEN"
}

---

# Users

## Search Users

GET /api/users/search?username=user

### Header

Authorization: Bearer JWT_TOKEN

---

## Block User

POST /api/users/block/:userId

### Header

Authorization: Bearer JWT_TOKEN

---

## Unblock User

POST /api/users/unblock/:userId

### Header

Authorization: Bearer JWT_TOKEN

---

# Conversations

## Create / Find Conversation

POST /api/conversations

### Header

Authorization: Bearer JWT_TOKEN

### Body

{
  "userId": "OTHER_USER_ID"
}

---

# Messages

## Get Messages

GET /api/messages/:conversationId

### Header

Authorization: Bearer JWT_TOKEN

---

# Socket.IO

## Connection

Client connects using:

socket.io-client

Authentication:

{
  auth: {
    token: "JWT_TOKEN"
  }
}

---

## Join Conversation

Client:

socket.emit("joinConversation", conversationId)

---

## Send Message

Client:

socket.emit("sendMessage", {
  conversationId,
  content
})

Server emits:

newMessage

---

## Typing

Client:

socket.emit("typing", {
  conversationId
})

Server emits:

typing

---

## Stop Typing

Client:

socket.emit("stopTyping", {
  conversationId
})

Server emits:

stopTyping

---

## Message Delivered

Client:

socket.emit("messageDelivered", {
  messageId
})

---

## Message Seen

Client:

socket.emit("messageSeen", {
  messageId
})

---

## Mark Conversation As Read

Client:

socket.emit(
  "markConversationAsRead",
  conversationId
)

Server emits:

conversationRead

---

## Edit Message

Client:

socket.emit("editMessage", {
  messageId,
  content
})

---

## Delete Message

Client:

socket.emit("deleteMessage", {
  messageId
})

---

## Online User

Server emits:

userOnline

---

## Offline User

Server emits:

userOffline