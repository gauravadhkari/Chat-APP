const Message = require("../models/message");
const Conversation = require("../models/conversation");
const User = require("../models/User");
const { isValidObjectId, isValidMessageContent } = require("../utils/validation");
const socketRateLimiter = require("../utils/socketRateLimiter");

const onlineUsers =new Map();

const registerChatSocket = (io) => {
  //               ///CONNECTION START///                  //
  io.on("connection", async (socket) => {
    try{
    console.log("User connected : ",socket.id);
    const conversations = await Conversation.find({
      participants : socket.userId
    }).select("_id");

    const conversationIds = conversations.map(
      (conversation) => conversation._id
    )
    await Message.updateMany(
      {
        conversation : {$in : conversationIds},
        sender : {$ne  : socket.userId},
        deliveredAt : null
      },
      {
      $set : {
        deliveredAt : new Date()
      }
      }
    );
    const userId = socket.userId.toString();
    let wasOffline = !onlineUsers.has(userId);
    if(!onlineUsers.has(userId)){
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);
    socket.join(`user:${userId}`);
    console.log("Online Users :",onlineUsers)
    
    if(wasOffline){
        io.emit("userOnline", {
      userId : socket.userId,
    })
    }
    const alreadyOnlineUserIds = Array.from(onlineUsers.keys()).filter(
    (id) => id !== userId
    );
    socket.emit("onlineUsers", { userIds: alreadyOnlineUserIds });

    } catch(error){
    console.error("Connection Delivery Error:",error)
    }
    
    //              ///USER JOINED CONVERSATION///                 //
    socket.on("joinConversation", async (conversationId) => {
     try{
       if(!isValidObjectId(conversationId)){
        socket.emit("error", {
          message : "Invalid Id!"
        })
        return;
       }
       const conversation = await Conversation.findById(conversationId);
       if(!conversation){
        socket.emit("error",{
          message : "Conversation Not Found.."
        });
        return;
       }
       const isParticipant =  conversation.participants.some(
        (participant) => participant.toString() === socket.userId.toString()
       );
       if(!isParticipant){
        socket.emit("error",{
          message : "You're not part of this conversation"
        });
        return ;
       }
       socket.join(conversationId);
       console.log(`${socket.id} joined conversation ${conversationId}`);
     }catch(error){
        console.error(error)
        socket.emit("error", {
          message : "Failed to join Conversation..."
        });
     }
    });
    //             ///USER TYPING - TYPING INDICATOR///                     //
    socket.on("typing", async (conversationId) => {

      const allowed = socketRateLimiter(
        socket.userId.toString(),
        "typing",
        20,
        5000
      );
      if(!allowed){
        return;
      }
      if(!isValidObjectId(conversationId)){
        socket.emit("error", {
          message : "Invalid Object Id!"
        })
        return ;
      }
      const conversation = await Conversation.findById(conversationId);
      if(!conversation){
        socket.emit("error",{
          message : "Conversation Not Found!"
        })
        return;
      }
      const isParticipant = conversation.participants.some(
        (participant) => participant.toString() === socket.userId.toString()
      )
      if(!isParticipant){
        socket.emit("error", {
          message : "You're not part of this conversation!"
        });
        return;
      }
      socket.to(conversationId).emit("userTyping", {
        userId : socket.userId,
        conversationId
      })
    })
    //              ///USER STOPPED TYPING - TYPING INDICATOR///              //
    socket.on("stopTyping", async (conversationId) => {
      if(!isValidObjectId(conversationId)){
        socket.emit("error", {
          message : "Invalid Id!"
        })
        return;
      }
      const conversation = await Conversation.findById(conversationId);
      if(!conversation){
        socket.emit("error", {
          message : "Conversation Not Found!"
        })
        return;
      }
      const isParticipant = conversation.participants.some( (participant) => 
      participant.toString() === socket.userId.toString());
      if(!isParticipant){
        socket.emit("error",{
          message : "You're not part of this conversation!"
        })
      }
      socket.to(conversationId).emit("userStoppedTyping", {
        userId : socket.userId,
        conversationId
      })
    })
    //                ///USER SEND MESSAGE///               //
    socket.on("sendMessage", async (data) => {
      try{
        const allowed = socketRateLimiter(
          socket.userId.toString(),
          "sendMessage",
          15,
          10000
        );
        if(!allowed){
          socket.emit("error", {
            message : "You're sending messages too quickly"
          })
          return;
        }
        console.log(data);
        const {conversationId , content } = data;
        console.log(content);
        const userId = socket.userId;
        if(!conversationId || !content || !userId){
          socket.emit("error", {
            message : "ConversationId , Content and UserId are required..."
          })
          return ;
        }
        if(!isValidObjectId(conversationId)){
          socket.emit("error", {
            message : "Invalid Conversation Id.."
          })
          return;
        }
        if(!isValidMessageContent(content)){
          socket.emit("error", {
            message :"Message must be between 1 and 2000 characters."
          })
          return;
        }
        const conversation = await Conversation.findById(conversationId);
        if(!conversation){
          socket.emit("error", {
            message : "Conversation Not Found.."
          });
          return;
        }
        const currentUser = await User.findById(userId);
        if(!currentUser){
          socket.emit("error",{
            message : "User Not Found.."
          })
          return;
        }
        const otherParticipant = conversation.participants.find(
          (participant) => participant.toString() !== userId.toString()
        )
        const receiverId = otherParticipant.toString();
        const receiverOnline = onlineUsers.has(receiverId)
        const otherUser = await User.findById(otherParticipant);
        const hasBlocked = currentUser.blockedUsers.some(
          (id) => id.toString() === otherParticipant.toString()
        )
        const isBlockedByOther = otherUser.blockedUsers.some(
          (id) => id.toString() === userId.toString()
        )
        if(hasBlocked || isBlockedByOther){
          socket.emit("error", {
            message : "You can not send messages to this User..."
          })
          return;
        }
        const isParticipant = conversation.participants.some(
          (participant) =>  participant.toString() === userId.toString()
        );
        if(!isParticipant){
          socket.emit("error",{
            message : "You're not part of the conversation.."
          });
          return;
        }
        const message = await Message.create({
          conversation : conversationId ,
          sender : userId,
          content,
          deliveredAt : receiverOnline ? new Date() : null,
        });
        await Conversation.findByIdAndUpdate(conversationId , {
          lastMessageAt : message.createdAt,
          lastMessage : message._id,
        });
        io
        .to(`user:${userId.toString()}`)
        .to(`user:${receiverId}`)
        .emit("newMessage", message);
      }catch(error){
        console.error(error)
        socket.emit("error",{
          message : "Failed to send..."
        })
      }
    });
    //            ///USER DISCONNECT FROM COVERSATION///         //
    socket.on("disconnect", () => {
     const userId = socket.userId.toString();
     const userSockets = onlineUsers.get(userId);
     if(userSockets){
      userSockets.delete(socket.id);

      if(userSockets.size === 0){
        onlineUsers.delete(userId);
        console.log("User is Completely offline:",userId);
         io.emit("userOffline", {
          userId : socket.userId,
       })
      }
     }
     console.log("User Disconnected..", socket.id);
     console.log("Online Users : ",onlineUsers)
    
    });
    //         ///USER DELIVERED MESSAGE///      //  
    socket.on("messageDelivered", async(messageId) => {
      try{
        const message = await Message.findById(messageId);
        console.log(message)
        if(!message){
          socket.emit("error", {
            message : "Message Not Found...",
          });
          return;
        }
        const conversation = await Conversation.findById(message.conversation);
        if(!conversation){
          socket.emit("error", {
            message : "Conversation not found..."
          })
          return;
        }

        const isParticipant = conversation.participants.some( (participant) => 
        participant.toString() === socket.userId.toString());
        if(!isParticipant){
          socket.emit("error", {
            message : "You're not part of this conversation..."
          })
          return;
        }
        if(message.sender.toString() === socket.userId.toString()){
          socket.emit("error", {
            message : "Not allowed by Sender!"
          })
          return;
        }
        if(message.deliveredAt){
           return;
        }
        message.deliveredAt = new Date();

        await message.save();
        io.to(message.conversation.toString()).emit("messageDelivered",
          {
            messageId : message._id,
            deliveredAt : message.deliveredAt
          }
        )
      }catch(error){
        console.error("Delivered Error :",error);
        socket.emit("error", {
          message : "Failed to mark message as delivered..."
        });
      }
    });
    //           ///USER SEEN MESSAGE///          //
    socket.on("messageSeen", async(messageId) => {
      try{
        const message = await Message.findById(messageId);
        if(!message){
          socket.emit("error", {
            message : "Message not found..."
          })
          return;
        }
        const conversation = await Conversation.findById(message.conversation);
        if(!conversation){
          socket.emit("error", {
            message : "Conversation Not Found..."
          })
          return;
        }
      
        const isParticipant = conversation.participants.some( (participant) =>
        participant.toString() === socket.userId.toString());
        if(!isParticipant){
          socket.emit("error" , {
            message : "You're not part of this conversation..."
          })
          return;
        }
        if(message.sender.toString() === socket.userId.toString()){
          socket.emit("error",{
            message : "Not Allowed By Sender!"
          })
          return;
        }
        if(message.seenAt){
          return;
        }
        const now = new Date();
        if(!message.deliveredAt){
          message.deliveredAt = now;
        }
        message.seenAt = now;
        await message.save();

        console.log("MESSAGE MARKED AS SEEN:", {
            messageId: message._id,
            seenAt: message.seenAt,
         });
        io.to(message.conversation.toString()).emit("messageSeen", {
          messageId : message._id,
          seenAt : message.seenAt,
        })
      }catch(error){
          console.error("Message not mark as Seen",error);

          socket.emit("error", {
            message : "Failed to seen.."
          })
      }
    })
    //         ///EDITING MESSAGE///              // 
    socket.on("editMessage", async (data) => {
      try {
        const { messageId , content } = data;
        if(!messageId || !content){
          socket.emit("error", {
            message : "Message ID and content are required"
          })
          return;
        }
        if(!isValidObjectId(messageId)){
          socket.emit("error",{
            message : "Invalid Message Id..."
          })
          return;
        }
        if(!isValidMessageContent(content)){
          socket.emit("error",{
            message : "Message must be length between 1 and 2000 characters.."
          })
          return;
        }
        const message = await Message.findById(messageId);
        if(!message){
          socket.emit("error", {
            message : "Message Not Found.."
          });
          return;
        } 
        if(message.sender.toString() !== socket.userId.toString()){
          socket.emit("error", {
            message : "You only delete your message.."
          })
          return;
        }
        message.content = content;
        await message.save();
        io.to(message.conversation.toString()).emit("messageEdited", {
          messageId : message._id,
          content : message.content
        })
      }catch(error){
        console.error("Error in editing :",error);

        socket.emit("error", {
          message : "Failed to Edit Message..."
        })
      }
    });
    //             ///DELETE MESSAGE///              //
    socket.on("deleteMessage", async(data) => {
      try{
        const { messageId } = data;
        if(!messageId){
          socket.emit("error", {
            message : "Message Id required..."
          })
          return;
        }
        if(!isValidObjectId(messageId)){
          socket.emit("error", {
            message : "Invalid Message ID..."
          })
          return;
        }
        const message = await Message.findById(messageId);
        if(!message){
          socket.emit("error", {
            message : "Message not found.."
          });
          return;
        }
        if(message.sender.toString() !== socket.userId.toString()){
          socket.emit("error", {
            message : "You can delete only your message..."
          });
          return;
        }
        const conversationId = message.conversation.toString();
        message.isDeleted = true;
        message.deletedAt = new Date();
        message.content = "This message was deleted";

        await message.save();

        const conversation = await Conversation.findById(conversationId);

        if(conversation.lastMessage && conversation.lastMessage.toString() === message._id.toString()){
          const previousMessage = await Message.findOne({
            conversation : conversationId,
            isDeleted : false,
          }).sort({createdAt : -1});

          conversation.lastMessage = previousMessage ? previousMessage._id : null;
          conversation.lastMessageAt = previousMessage ? previousMessage.createdAt : null;

          await conversation.save();
        }
        io.to(conversationId).emit("messageDeleted", {
          messageId : message._id,
          deletedAt : message.deletedAt,
          content : message.content,
        })
      }catch(error){
        console.error("Delete Error: ",error);
        socket.emit("error",{
          message : "Failed to Delete..."
        });
      }
    })
    //                ///MARK CHATS - ALL AS READ///            //
    socket.on("markConversationAsRead" , async(data) => {
      try{
        const {conversationId} = data;
        console.log("Mark Conversation as Read :", conversationId);
        if(!isValidObjectId(conversationId)){
          socket.emit("error", {
            message : "Invalid Id!"
          })
          return;
        }
        const conversation = await Conversation.findById(conversationId);
        if(!conversation){
          socket.emit("error", {
            message : "Conversation Not Found..."
          })
          return;
        }
        
        const isParticipant = conversation.participants.some( (participant) => 
        participant.toString() === socket.userId.toString())
        if(!isParticipant){
          socket.emit("error", {
            message : "You're not part of this conversation..."
          })
          return;
        }
        const deliverednow = new Date();
        await Message.updateMany({
          conversation : conversationId,
          sender : { $ne : socket.userId },
          deliveredAt : null,
          seenAt : null
        },
         {
          $set : {
            deliveredAt : deliverednow,
          }
         });
         const seenNow = new Date()
        const result  =  await Message.updateMany({
          conversation : conversationId,
          sender : {
            $ne : socket.userId,
          },
          seenAt : null,
        },
      {
        $set : {
          seenAt : seenNow,
        },
      });
      console.log("Modified Count :",result.modifiedCount);
      io.to(conversationId).emit("conversationRead",{
        conversation : conversationId,
        userId : socket.userId,
      });
      }catch(error){
        console.error("Mark as read Error : ",error);

        socket.emit("error", {
          message : "Failed to mark as read Error...."
        })
      }
    })
  });
};

module.exports = registerChatSocket
