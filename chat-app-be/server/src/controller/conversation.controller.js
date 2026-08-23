const Conversation = require("../models/conversation")
const User = require("../models/User")


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
    let conversation = await Conversation.findOne({
      participants : {
      $all : [currentUserId , userId],
      },
    }).populate("participants","username email");

    if(conversation){
      return res.status(401).json({
        success : false,
        message : "Conversation already exists...",
        conversation
      })
    }
     conversation = await Conversation.create({
      participants : [currentUserId , userId],
    })
      conversation = await conversation.populate(
      "participants",
      "username email"
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
    .populate("participants","username email")
    .sort({updateAt : -1});
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