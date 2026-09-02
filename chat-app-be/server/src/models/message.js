const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  conversation : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "Conversation",
    required : true
  },
  sender : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "User",
    required : true
  },
  content : {
    type : String,
    required : true,
    trim : true
  },
  deliveredAt : {
    type : Date,
    default : null,
  },
  seenAt : {
    type : Date,
    default : null,
  },
  isDeleted : {
    type : Boolean,
    default : null,
  },
  deletedAt : {
    type : Date,
    default : null,
  }
},
 {
  timestamps : true,
 }
)
messageSchema.index({
  conversation : 1,
  createdAt : -1,
})
messageSchema.index({
  conversation : 1,
  seenAt : 1,
})

const Message = mongoose.model("Message",messageSchema);
module.exports = Message