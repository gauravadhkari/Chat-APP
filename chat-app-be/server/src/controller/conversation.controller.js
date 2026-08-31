const Conversation = require("../models/conversation")
const User = require("../models/User");
const { isValidObjectId } = require("../utils/validation");


////////////////////////////////////////////////////////////
const createConversation = async (req, res) => {
  try {
    const { userId } = req.body;
    const currentUserId = req.user._id;
    if(!userId){
      return res.status(401).json({
        success : false,
        message : "User id not given..."
      })
    }
    if(!isValidObjectId(userId)){
      return res.status(400).json({
        success : false,
        message : "Wrong User Id!"
      })
    }
    console.log(currentUserId)
    if(currentUserId.toString() === userId.toString()){
      return res.status(401).json({
        success : false,
        message : "Can't create conversation with yourself..."
      })
    }
    const otherUser = await User.findById(userId);
    if(!otherUser){
      return res.status(401).json({
        success : false,
        message : "User not found..."
      })
    }
    if(!isValidObjectId(otherUser)){
      return res.status(400).json({
        success : false,
        message : "Wrong User Id!"
      })
    }
    const currentUser = await User.findById(currentUserId);
    if(!currentUser){
      return res.status(400).json({
        message : "Current User not found..."
      })
    }
    const hasBlocked = await currentUser.blockedUsers.some(
      (id) => id.toString() === userId.toString()
    )
    const isBlockedByOther = await otherUser.blockedUsers.some(
      (id) => id.toString() === currentUserId.toString()
    )
    if(hasBlocked || isBlockedByOther){
      return res.status(403).json({
        message : "You can not create conversation with this user..."
      })
    }
    const conversationKey = [currentUserId.toString() , userId.toString()].sort().join("_");
    let conversation = await Conversation.findOne({
      conversationKey,
    }).populate("participants","name email");

    if(conversation){
      return res.status(200).json({
        success : true,
        message : "Conversation already exists...",
        conversation
      })
    }
     conversation = await Conversation.create({
      participants : [currentUserId , userId],
      conversationKey,
    })
      conversation = await conversation.populate(
      "participants",
      "name email"
    );
    res.status(201).json({
      success : true,
      message : "Conversation Created Successfully....",
      conversation
    })
  }catch(error){
    console.log(error.message);

    res.status(500).json({
      success : false,
      message : "Server Error..."
    })
  }
}
////////////////////////////////////////////////////////////
const getMyConversation = async (req,res) => {
  try{
    const userId = req.user._id;
    const conversation = await Conversation.find({
      participants:userId,
    })
    .populate("participants","name email")
    .sort({updatedAt : -1}); // was "updateAt" — not a real field, sort was a no-op
    res.status(201).json({
      success : true,
      conversation
    })
  }catch(error){
    console.error("GET CONVERSATION ERROR :",error);
    res.status(500).json({
      success : false,
      message : "Server Error...."
    })
  }
}
module.exports = { createConversation, getMyConversation }
