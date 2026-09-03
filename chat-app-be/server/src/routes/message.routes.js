const express = require("express");
const { sendMessage, getMessages } = require("../controller/message.controller");
const protect = require("../middlewares/auth.middleware");
const Message = require("../models/message.js");
const Conversation = require("../models/conversation.js");
const { isValidObjectId } = require("mongoose");
const router = express.Router();

router.post("/",protect,sendMessage)
router.get("/:conversationId",protect, async(req,res) => {
  try {
    const { conversationId } = req.params;

    const limit = Math.min(parseInt(req.query.limit) || 20,50);
    
    const cursor = req.query.cursor;

    if(!isValidObjectId(conversationId)){
      return res.status(400).json({
        success : false,
        message : "Invalid Conversation Id!!"
      })
    }

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
    const query = {
      conversation : conversationId,
    }
    if(cursor){
      const cursorDate = new Date(cursor);
      if(isNaN(cursorDate.getTime())){
        return res.status(400).json({
          success : false,
          message : "Invalid Cursor!"
        })
      }
      query.createdAt = {
        $lt : cursorDate
      };
    }
    const message = await Message.find(query)
    .populate("sender" , "_id name email")
    .populate({
      path : "replyTo",
      select : "content sender isDeleted deletedAt",
      populate : {
        path : "sender",
        select : "_id name"
      },
    })
    .sort({ createdAt : -1 })
    .limit(limit);
    
    const nextCursor = message.length === limit ? message[message.length - 1].createdAt : null;
  
    res.status(200).json({
      success : true,
      message,
      nextCursor,
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