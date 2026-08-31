const jwt = require("jsonwebtoken");
const User = require("../models/User");

const socketAuth = async (socket,next) => {
  try{
    const token = socket.handshake.auth.token;
    if(!token){
      return next(new Error("Authentication Token Required.."))
    }
    const decoded = await jwt.verify(token,process.env.JWT_SECRET);
    const userExists = await User.exists({_id : decoded.userId});
    if(!userExists){
      return next(new Error("User not Exists!"))
    }
    socket.userId = decoded.userId;
    next();
  }catch(error){
    next(new Error("Invalid or expired token.."))
  }
};

module.exports = socketAuth;