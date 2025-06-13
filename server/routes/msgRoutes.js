import express from "express";
import { protectRoute } from "../middleware/auth.js";
import { getMsgs, getUsersForSidebar, markMsgAsSeen, sendMsg } from "../controllers/messageController.js";

const messageRouter = express.Router()

messageRouter.get('/users', protectRoute, getUsersForSidebar)
messageRouter.get('/:id', protectRoute, getMsgs)
messageRouter.get('mark/:id', protectRoute, markMsgAsSeen)
messageRouter.post('/send/:id', protectRoute, sendMsg)

export default messageRouter