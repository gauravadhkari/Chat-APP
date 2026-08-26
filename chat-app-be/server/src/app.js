const express = require("express");
const cors = require("cors")
const helmet = require("helmet");
const app = express();
const authRoutes = require("./routes/auth.routes")
const conversationRoutes = require("./routes/conversation.routes")
const messageRoutes = require("./routes/message.routes")
const userRoutes = require("./routes/user.routes");
const apiLimiter = require("./middlewares/rateLimit.middleware");
app.use(cors({
  origin:"https://chat-app-zero-one7.vercel.app",
  credentials: true,
}));
app.use(helmet());
app.use(express.json({
  limit: "10kb",
}));

app.get("/", (req,res) => {
  res.json({
    message:"Chat Api is running...."
  })
})
app.get("/test", (req, res) => {
  res.json({
    message: "App is working"
  });
});
app.use("/api",apiLimiter)
app.use("/api/auth",authRoutes)
app.use("/api/conversations",conversationRoutes)
app.use("/api/messages",messageRoutes)
app.use("/api/users",userRoutes)

module.exports = app