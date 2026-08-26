const jwt = require("jsonwebtoken")
const dotenv = require("dotenv");
const User = require("../models/User")
dotenv.config();
const authMiddleware =  async (req,res,next) => {
  try {
    const authHeader = req.headers.authorization;
    if(!authHeader){
      return res.status(401).json({
        success : false,
        message : "Token not found ...."
      })
    }
    const token = authHeader;
    const decoded = jwt.verify(token,process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }
    req.user = user;
    next();
  }catch(error){
    console.log(error.message)
    // jwt.verify throws JsonWebTokenError / TokenExpiredError for bad or
    // expired tokens — that's a client auth problem (401), not a server
    // problem (500). Only truly unexpected errors should be 500.
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({
        success : false,
        message : error.name === "TokenExpiredError" ? "Token expired..." : "Invalid token..."
      })
    }
    res.status(500).json({
      success : false,
      message : "Server Error..."
    })
  }
}

module.exports = authMiddleware
