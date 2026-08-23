const express = require("express");
const { createConversation, getMyConversation } = require("../controller/conversation.controller")

const protect = require("../middlewares/auth.middleware");
const Conversation = require("../models/conversation");
const Message = require("../models/message");
const User = require("../models/User");
const router = express.Router()

router.post("/",protect,createConversation);
router.get("/",protect,getMyConversation);
router.get("/",protect,async (req,res) => {
  try{
    const userId = req.user._id;

    const conversations = await Conversation.find({participants : userId})
    .populate("participants" , "username email")
    .sort({updatedAt : -1})
    
    const result = await Promise.all(
      conversations.map( async (conversation) => {
        
        const lastMessage = await Message.findOne({
          conversation : conversation._id,
        })
        .sort({ createdAt : -1})
        .populate("sender", "username");
        
        const unreadCounts = await Conversation.countDocuments({
          conversation : conversation._id,
          sender : {
          $ne : userId,
           },
          seenAt : null
          });
        return {
          ...conversation.toObject(),
          lastMessage,
          unreadCounts
        };
      })
    );

    res.status(200).json({
      conversations : result,
    });
  }catch(error){
    console.error(error);
    res.status(500).json({
      success : false,
      message  : "Failed to load chats...."
    });
  }
});

module.exports = router