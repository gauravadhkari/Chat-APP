const express = require("express");
const { sendMessage, getMessages } = require("../controller/message.controller");
const protect = require("../middlewares/auth.middleware");
const Message = require("../models/message.js");
const Conversation = require("../models/conversation.js");
const router = express.Router();

router.post("/",protect,sendMessage)
router.get("/:conversationId",protect, async(req,res) => {
  try {
    const { conversationId } = req.params;
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    
    const skip = (page - 1) * limit;

    const conversation = await Conversation.findById(conversationId);
    if(!conversation){
      return res.status(403).json({
        success : false,
        message : "Conversation Not Found..."
      })
    }
    const isParticipant = conversation.participants.some( (participant) => 
    participant.toString() === req.user._id.toString());
    if(!isParticipant){
      return res.status(403).json({
        success : false,
        message : "You're not part of this conversation.."
      })
    }
    const message = await Message.find({conversation : conversationId},)
    .sort({ createdAt : -1 })
    .skip(skip)
    .limit(limit);

    const totalMessages = await Message.countDocuments({ conversation : conversationId});
    res.status(200).json({
      success : true,
      message,
      page,
      limit,
      totalMessages,
      hasMore : skip + message.length < totalMessages,
    })
  }catch(error){
    console.log(error.message);
    res.status(500).json({
      success : false,
      message : "Server Error... "
    })
  }
})
module.exports = router