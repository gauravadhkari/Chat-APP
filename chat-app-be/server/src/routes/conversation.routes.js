const express = require("express");
const { createConversation } = require("../controller/conversation.controller")

const protect = require("../middlewares/auth.middleware");
const Conversation = require("../models/conversation");
const Message = require("../models/message");
const router = express.Router()

router.post("/",protect,createConversation);

// NOTE: this used to be registered twice (once pointing at
// getMyConversation, once as this inline handler). Express only ever runs
// the FIRST handler for a given route, so the enriched version below
// (with lastMessage / unreadCounts) was dead code before this fix — it
// never actually ran. getMyConversation is kept in the controller file
// for now but is no longer wired to a route; delete it if unused.
router.get("/",protect,async (req,res) => {
  try{
    const userId = req.user._id;

    const conversations = await Conversation.find({participants : userId})
    .populate("participants" , "name email")
    .sort({updatedAt : -1})
    
    const result = await Promise.all(
      conversations.map( async (conversation) => {
        
        const lastMessage = await Message.findOne({
          conversation : conversation._id,
        })
        .sort({ createdAt : -1})
        .populate("sender", "name");

        // BUG FIX: this was querying the Conversation model with
        // Message-shaped fields ("conversation"/"sender"/"seenAt" don't
        // exist on Conversation), which always returned 0. Unread counts
        // need to come from the Message model.
        const unreadCounts = await Message.countDocuments({
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
      success : true,
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
