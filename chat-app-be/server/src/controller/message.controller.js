const Message = require("../models/message")
const Conversation = require("../models/conversation")
const User = require("../models/User")

const sendMessage = async (req,res) => {

  try{
    const {conversationId ,content } = req.body;
    const senderId = req.user._id;
    if(!conversationId || !content){
      return res.status(400).json({
        success : false,
        message : "Conversation Id and content are required.."
      })
    }
    const conversation = await Conversation.findById(conversationId);
    if(!conversation){
      return res.status(404).json({
        success : false,
        message : "Conversation Not Found.."
      })
    }
    const isParticipant = await conversation.participants.some(
       (participant) => 
       participant.toString() === senderId.toString())

    if(!isParticipant){
      return res.status(400).json({
        success : false,
        message : "You're not part of this conversation..."
      })
    }

    // Block check — kept in sync with the socket "sendMessage" handler so
    // a blocked user can't route around the socket by hitting this REST
    // endpoint directly.
    const otherParticipantId = conversation.participants.find(
      (participant) => participant.toString() !== senderId.toString()
    );
    const [currentUser, otherUser] = await Promise.all([
      User.findById(senderId),
      User.findById(otherParticipantId),
    ]);
    const hasBlocked = currentUser?.blockedUsers?.some(
      (id) => id.toString() === otherParticipantId?.toString()
    );
    const isBlockedByOther = otherUser?.blockedUsers?.some(
      (id) => id.toString() === senderId.toString()
    );
    if (hasBlocked || isBlockedByOther) {
      return res.status(403).json({
        success: false,
        message: "You can not send messages to this User...",
      });
    }

    const message = await Message.create({
      conversation:conversationId,
      sender : senderId,
      content,
    });
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage : message._id,
      lastMessageAt : message.createdAt
    })
    res.status(201).json({
      success : true,
      message : "Message sent Successfull..",
      data : message,
    })
  } catch(error){
    console.log(error.message);
    res.status(500).json({
      success : false,
      message : "Server Error..."
    })
  }
}
const getMessages = async (req,res) => {
  try{
    const { conversationId } = req.params;
    const userId = req.user._id;
    console.log(conversationId)
    console.log(userId)
    const conversation = await Conversation.findById(conversationId);
    console.log(conversation)
    if(!conversation){
      return res.status(404).json({
        success : false,
        message : "Conversation Not Found.."
      })
    }
    const isParticipant = await conversation.participants.some(
       (participant) => 
       participant.toString() === userId.toString())
    if(!isParticipant){
      return res.status(403).json({
        success : false,
        message : "You're not part of this conversation..."
      })
    }
    const message = await Message.find({
      conversation : conversationId,
    })
    .populate("sender", "name email")
    .sort({createdAt : 1});

    res.status(200).json({
      success : true,
      message
    })
  }catch(error){
    console.log(error.message);

    res.status(500).json({
      success : false,
      message : "Server Error..."
    })
  }
}
module.exports = {
  sendMessage,
  getMessages
}
