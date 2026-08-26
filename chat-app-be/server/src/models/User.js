const mongoose = require("mongoose")

const userschema = new mongoose.Schema(
  {
    name : {
      type : String,
      required : true,
      trim : true
    },
    email : {
      type : String,
      required : true,
      unique : true,
      lowercase : true,
    },
    password : {
        type : String,
        required : true,
        minlength : 6,
    },
    blockedUsers : [
      {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
      },
    ],
  },
  { 
    timestamps : true,
  }
)

const User = mongoose.model("User",userschema);
module.exports = User;