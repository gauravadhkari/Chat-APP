const jwt = require("jsonwebtoken")

const socketAuth = async (socket,next) => {
  try{
    const token = socket.handshake.auth.token;
    if(!token){
      return next(new Error("Authentication Token Required.."))
    }
    const decoded = await jwt.verify(token,process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    next();
  }catch(error){
    next(new Error("Invalid or expired token.."))
  }
};

module.exports = socketAuth;