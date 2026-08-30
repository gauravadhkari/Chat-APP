const express = require("express");
const router = express.Router();

const User = require("../models/User");
const authMiddleware = require("../middlewares/auth.middleware");

router.get("/search", authMiddleware, async (req, res) => {
  try {
    const { name } = req.query;

    if (!name) {
      return res.status(400).json({
        message: "Username is required",
      });
    }
    function escapeRegex(text) {
      return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
    const searchName = name.trim();
    if(searchName.length > 50){
      return res.status(400).json({
        success : "false",
        message : "Invalid Name!"
      })
    }
    const safeName = escapeRegex(searchName);
    
    const users = await User.find({
      name: {
        $regex: safeName,
        $options: "i",
      },
      _id: {
        $ne: req.user._id,
      },
    })
      .select("_id name email")
      .limit(10);

    res.status(200).json({
      users,
    });

  } catch (error) {
    console.error("USER SEARCH ERROR:", error);

    res.status(500).json({
      message: "Failed to search users",
    });
  }
});
router.post("/block/:userId",authMiddleware, async(req,res) => {
  try{
    const currentUserId = req.user._id;
    const userIdToBlock = req.params.userId;
    
    if(currentUserId.toString() === userIdToBlock.toString()){
      return res.status(401).json({
        message : "You Can't Block Yourself..."
      })
    }
    const user = await User.findById(userIdToBlock);
    if(!user){
      return res.status(401).json({
        message : "User not Found..."
      })
    }
    await User.findByIdAndUpdate(
      currentUserId,
     {
      $addToSet : {
        blockedUsers : userIdToBlock,
      }}
    );
    res.status(200).json({
      message : "User Blocked Successfully..."
    })
  }catch(error){
    console.error("Blocked Error",error);

    res.status(500).json({
      message : "Failed to Block User.."
    })
  }
})
router.post("/unblock/:userId", authMiddleware, async(req,res) => {
  try{
    const currentUserId = req.user._id;
    const userToUnblock = req.params.userId;

    if(currentUserId.toString() === userToUnblock.toString()){
      return res.status(401).json({
        message : "You Can't Unblock Yourself.."
      })
    }
    const user = await User.findById(userToUnblock);
    if(!user){
      return res.status(401).json({
        message : "User not Found..."
      })
    }
    await User.findByIdAndUpdate(
      currentUserId,
      {
        $pull : {
          blockedUsers : userToUnblock,
        }
      }
    );
    res.status(200).json({
      message : "User Unblock Successfully..."
    })
  }catch(error){
    console.error("Unblock Error",error);

    res.status(500).json({
      message : "Failed to Unblock this user..."
    })
  }
})
module.exports = router;