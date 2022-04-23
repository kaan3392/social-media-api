const router = require("express").Router();
const Conversation = require("../models/Conversation");

//new Conversation
router.post("/", async (req, res) => {
    const newConv = new Conversation({
        members: [req.body.senderId, req.body.receiverId],
    });
    try {
        const savedConv = await newConv.save();
        res.status(200).json(savedConv);
    } catch (err) {
        res.status(500).json(err)
    }
})

//get conversation of a user
router.get("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const conversation = await Conversation.find({
            members: { $in: [id] }
        })
        res.status(200).json(conversation);
    } catch (err) {
        res.status(500).json(err);
    }
})

//get conv includes two userId
router.get("/find/:firstUserId/:secondUserId", async (req, res) => {
    try {
        const conversation = await Conversation.findOne({
            members: { $all: [req.params.firstUserId, req.params.secondUserId] }
        })
        res.status(200).json(conversation)
    } catch (err) {
        res.status(500).json(err)
    }
})

module.exports = router;