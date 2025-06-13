import cloudinary from "../lib/cloudinary.js";
import Message from "../models/Message.js";
import User from "../models/user.js";
import { io, userSocketMap } from "../server.js";

// get all users except the logged in user
export const getUsersForSidebar = async (req, res) => {
    try {
        const userId = req.user._id
        const filteredUsers = await User.find({ _id: { $ne: userId } }).select("-password")

        // count no.of msg's not seen
        const unSeenMsgs = {}
        const promises = filteredUsers.map(async (user) => {
            const messages = await Message.find({ senderId: user._id, recieverId: userId, seen: false })
            if (messages.length > 0) {
                unSeenMsgs[user._id] = messages.length
            }
        })

        await Promise.all(promises)
        res.json({ success: true, users: filteredUsers, unSeenMsgs })


    } catch (error) {
        console.log(error.message);
        res.send({ success: false, message: error.message })
    }
}

// get msgs for selected user
export const getMsgs = async (req, res) => {
    try {
        console.log(req);
        
        const { id: selectedUserId } = req.params
        const myId = req.user._id

        const msgs = await Message.find({
            $or: [
                { senderId: myId, recieverId: selectedUserId },
                { senderId: selectedUserId, recieverId: myId },
            ]
        })
         console.log(msgs);
         
         await Message.updateMany({ senderId: selectedUserId, recieverId: myId }, { seen: true })
         console.log(msgs);

        res.json({ success: true, messages: msgs })

    } catch (error) {
        res.send({ success: false, message: error.message })
        console.log(error.message);
    }
}

// mark msgs as seen
export const markMsgAsSeen = async (req, res) => {
    try {
        const { id } = req.params
        await Message.findByIdAndUpdate(id, { seen: true })
        res.json({ success: true })
    } catch (error) {
        res.send({ success: false, message: error.message })
        console.log(error.message);
    }
}

// sending msg to selected user
export const sendMsg = async (req, res) => {
    try {
        
        const { text, image } = req.body
        const recieverId = req.params.id
        const senderId = req.user._id

        let imgUrl
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image)
            imgUrl = uploadResponse.secure_url
        }

        const newMessage = await Message.create({
            senderId,
            recieverId,
            text,
            image: imgUrl
        })

        // emit new msg to reciever's socket

        const recieverSocketId = userSocketMap[recieverId]
        if (recieverSocketId) {
            io.to(recieverSocketId).emit('newMessage', newMessage)
        }

        res.json({ success: true, newMessage })

    } catch (error) {
        res.send({ success: false, message: error.message })
        console.log(error.message);
    }
}