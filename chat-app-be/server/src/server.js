const dotenv = require("dotenv");
const app = require("./app")
const connectDB = require("./config/db")
dotenv.config();
const http = require("http");
const { Server } = require("socket.io");
const registerChatSocket = require("./sockets/chat.socket");
const socketAuth = require("./middlewares/socketAuth.middleware")
const PORT = process.env.PORT || 3000;
connectDB();

const server = http.createServer(app);
const io = new Server(server , {
  cors : {
    origin:"*",
  },
})
io.use(socketAuth)
registerChatSocket(io);

server.listen(PORT , () => {
  console.log(`Server is running on port ${PORT} `)
});
