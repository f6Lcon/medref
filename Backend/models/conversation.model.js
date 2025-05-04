import mongoose from "mongoose"

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    unreadCount: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  {
    timestamps: true,
  },
)

// Create a compound index on participants to ensure uniqueness
conversationSchema.index({ participants: 1 }, { unique: true })

const Conversation = mongoose.model("Conversation", conversationSchema)

export default Conversation
