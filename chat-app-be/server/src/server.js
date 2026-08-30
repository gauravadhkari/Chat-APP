const dotenv = require("dotenv");
const app = require("./app")
const connectDB = require("./config/db")
dotenv.config();
const http = require("http");
const { Server } = require("socket.io");
const registerChatSocket = require("./sockets/chat.socket");
const socketAuth = require("./middlewares/socketAuth.middleware")
const PORT = process.env.PORT || 3000;

const requiredEnv = ["JWT_SECRET" , "MONGO_URI"]

for(const key of requiredEnv){
  if(!process.env[key]){
    console.error(`${key} is missing!`);
    process.exit(1);
  }
}

const server = http.createServer(app);
const io = new Server(server , {
  cors : {
    origin:["https://localhost:5173","https://chat-app-zero-one7.vercel.app"],
    credentials:true,
  },
})
io.use(socketAuth)
registerChatSocket(io);
const startServer = async () => {
try{
 await connectDB();
server.listen(PORT , () => {
  console.log(`Server is running on port ${PORT} `)
});
} catch(error){
  console.error(error.message);
  process.exit(1);
}
}
startServer();
