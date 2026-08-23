const mongoose = require("mongoose");

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
}

const isValidMessageContent = (content) => {
  return (
    typeof content === "string" &&
    content.trim().length > 0 &&
    content.trim().length <= 2000
  );
};

module.exports = {
  isValidObjectId,
  isValidMessageContent
}