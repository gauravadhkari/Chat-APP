const express = require("express");
const { createConversation } = require("../controller/conversation.controller")

const protect = require("../middlewares/auth.middleware");
const Conversation = require("../models/conversation");
const Message = require("../models/message");
const router = express.Router()

router.post("/",protect,createConversation);

// NOTE: this used to be registered twice (once pointing at
// getMyConversation, once as this inline handler). Express only ever runs
// the FIRST handler for a given route, so the enriched version below
// (with lastMessage / unreadCounts) was dead code before this fix — it
// never actually ran. getMyConversation is kept in the controller file
// for now but is no longer wired to a route; delete it if unused.
router.get("/",protect,async (req,res) => {
  try{
    const userId = req.user._id;
    const conversations = await Conversation.aggregate([
      {
        $match : {
          participants : userId
        }
      },
      {
        $lookup : {
          from : "users",
          localField : "participants",
          foreignField : "_id",
          as :"participants"
        }
      },
      {
        $lookup : {
          from : "messages",

          let : {
            conversationId : "$_id"
          },

          pipeline : [
            {
              $match : {
                $expr : {
                  $eq : [
                    "$conversation",
                    "$$conversationId"
                   ]
                }
              }
            },
            {
              $sort : {
                createdAt : -1,
              }
            },
            {
              $limit : 1
            },

            {
              $lookup : {
                from : "users",
                localField : "sender",
                foreignField : "_id",
                as : "sender"
              }
            },

            {
              $unwind : {
                path : "$sender",
                preserveNullAndEmptyArrays : true
              }
            },

            {
              $project : {
                content : 1,
                conversation : 1,
                createdAt : 1,
                deliveredAt : 1,
                seenAt : 1,

                "sender._id" : 1,
                "sender.name" : 1,
              }
            }
          ],
          as : "lastMessageData"
        }
      },
      {
        $set : {
          lastMessage : {
            $arrayElemAt : [
              "$lastMessageData",
              0
            ]
          }
        }
      },

      {
        $lookup : {
          from : "messages",

          let : {
            conversationId : "$_id"
          },

          pipeline : [
            {
              $match : {
                $expr : {
                  $and : [
                    {
                      $eq : [
                        "$conversation",
                        "$$conversationId"
                      ]
                    },
                    {
                      $ne : [
                        "$sender",
                        userId
                      ]
                    },
                    {
                      $eq : [
                        "$seenAt",
                        null
                      ]
                    }
                  ]
                }
              }
            },
            {
              $count : "count"
            }
          ],
           as : "unreadData"
        }
      },
      {
        $set : {
          unreadCounts : {
            $ifNull : [
              {
                $arrayElemAt : [
                  "$unreadData.count",
                  0
                ]
              },
              0
            ]
          }
        }
      },
      {
        $project : {
          unreadData : 0,
          "participants.password" : 0,
          "participants.blockedUsers" : 0,
        }
      },
      {
        $sort : {
          lastMessageAt : -1
        }
      }
    ]);
    res.status(200).json({
      success : true,
      conversations
    });
    
  }catch(error){
    console.error(error);
    res.status(500).json({
      success : false,
      message  : "Failed to load chats...."
    });
  }
});

module.exports = router
