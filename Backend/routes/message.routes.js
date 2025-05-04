import express from "express"
import { getConversations, getMessages, createConversation, sendMessage } from "../controllers/message.controller.js"
import { protect } from "../middleware/auth.middleware.js"

const router = express.Router()

// Get all conversations for a user
router.route("/conversations").get(protect, getConversations).post(protect, createConversation)

// Get messages for a conversation
router.route("/:conversationId").get(protect, getMessages)

// Send a message
router.route("/").post(protect, sendMessage)

export default router
