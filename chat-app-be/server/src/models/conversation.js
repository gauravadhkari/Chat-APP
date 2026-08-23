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
  },
  {
    timestamps : true,
  }
);

ConversationSchema.index({
  participant : 1,
})

const Conversation = mongoose.model("Conversation",ConversationSchema);

module.exports = Conversation