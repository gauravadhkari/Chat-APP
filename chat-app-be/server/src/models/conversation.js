const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema(
  {
    participants : [
      {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true
      },
    ],
    conversationKey : {
      type : String,
      required : true,
      unique : true,
    },
    lastMessageAt : {
      type : Date,
      default : null,
    },
    lastMessage : {
      type : mongoose.Schema.Types.ObjectId,
      ref : "Message",
      default : null,
    }
  },
  {
    timestamps : true,
  }
);

ConversationSchema.index({
  participants : 1,
})

const Conversation = mongoose.model("Conversation",ConversationSchema);

module.exports = Conversation