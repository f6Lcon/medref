import asyncHandler from "express-async-handler"
import Conversation from "../models/conversation.model.js"
import Message from "../models/message.model.js"
import User from "../models/user.model.js"

// @desc    Get all conversations for a user
// @route   GET /api/messages/conversations
// @access  Private
const getConversations = asyncHandler(async (req, res) => {
  const userId = req.user._id

  const conversations = await Conversation.find({
    participants: userId,
  })
    .populate({
      path: "participants",
      select: "name email role",
    })
    .populate({
      path: "lastMessage",
      select: "content createdAt sender",
    })
    .sort({ updatedAt: -1 })

  // Format conversations to include unread count for current user
  const formattedConversations = conversations.map((conversation) => {
    const unreadCount = conversation.unreadCount.get(userId.toString()) || 0
    return {
      _id: conversation._id,
      participants: conversation.participants.filter((participant) => participant._id.toString() !== userId.toString()),
      lastMessage: conversation.lastMessage,
      unreadCount,
      updatedAt: conversation.updatedAt,
    }
  })

  res.json(formattedConversations)
})

// @desc    Get messages for a conversation
// @route   GET /api/messages/:conversationId
// @access  Private
const getMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params
  const userId = req.user._id

  // Check if user is part of the conversation
  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: userId,
  })

  if (!conversation) {
    res.status(404)
    throw new Error("Conversation not found")
  }

  // Get messages
  const messages = await Message.find({ conversation: conversationId })
    .populate({
      path: "sender",
      select: "name email role",
    })
    .sort({ createdAt: 1 })

  // Mark messages as read
  await Message.updateMany(
    {
      conversation: conversationId,
      sender: { $ne: userId },
      read: false,
    },
    { read: true },
  )

  // Reset unread count for this user
  conversation.unreadCount.set(userId.toString(), 0)
  await conversation.save()

  res.json(messages)
})

// @desc    Create a new conversation
// @route   POST /api/messages/conversations
// @access  Private
const createConversation = asyncHandler(async (req, res) => {
  const { participantId } = req.body
  const userId = req.user._id

  if (participantId === userId.toString()) {
    res.status(400)
    throw new Error("Cannot create conversation with yourself")
  }

  // Check if participant exists
  const participant = await User.findById(participantId)
  if (!participant) {
    res.status(404)
    throw new Error("User not found")
  }

  // Check if conversation already exists
  let conversation = await Conversation.findOne({
    participants: { $all: [userId, participantId] },
  })
    .populate({
      path: "participants",
      select: "name email role",
    })
    .populate({
      path: "lastMessage",
      select: "content createdAt sender",
    })

  if (conversation) {
    // Return existing conversation
    const unreadCount = conversation.unreadCount.get(userId.toString()) || 0
    const formattedConversation = {
      _id: conversation._id,
      participants: conversation.participants.filter((participant) => participant._id.toString() !== userId.toString()),
      lastMessage: conversation.lastMessage,
      unreadCount,
      updatedAt: conversation.updatedAt,
    }
    return res.json(formattedConversation)
  }

  // Create new conversation
  conversation = await Conversation.create({
    participants: [userId, participantId],
    unreadCount: {
      [userId.toString()]: 0,
      [participantId.toString()]: 0,
    },
  })

  // Populate the conversation
  conversation = await Conversation.findById(conversation._id).populate({
    path: "participants",
    select: "name email role",
  })

  const formattedConversation = {
    _id: conversation._id,
    participants: conversation.participants.filter((participant) => participant._id.toString() !== userId.toString()),
    unreadCount: 0,
    updatedAt: conversation.updatedAt,
  }

  res.status(201).json(formattedConversation)
})

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
const sendMessage = asyncHandler(async (req, res) => {
  const { conversationId, content } = req.body
  const userId = req.user._id

  if (!content || content.trim() === "") {
    res.status(400)
    throw new Error("Message content is required")
  }

  // Check if conversation exists and user is part of it
  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: userId,
  })

  if (!conversation) {
    res.status(404)
    throw new Error("Conversation not found")
  }

  // Create message
  const message = await Message.create({
    conversation: conversationId,
    sender: userId,
    content,
  })

  // Update conversation's lastMessage
  conversation.lastMessage = message._id

  // Increment unread count for all participants except sender
  conversation.participants.forEach((participantId) => {
    if (participantId.toString() !== userId.toString()) {
      const currentCount = conversation.unreadCount.get(participantId.toString()) || 0
      conversation.unreadCount.set(participantId.toString(), currentCount + 1)
    }
  })

  await conversation.save()

  // Populate sender info
  const populatedMessage = await Message.findById(message._id).populate({
    path: "sender",
    select: "name email role",
  })

  res.status(201).json(populatedMessage)
})

export { getConversations, getMessages, createConversation, sendMessage }
