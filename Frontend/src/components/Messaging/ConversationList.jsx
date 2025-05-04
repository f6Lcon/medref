"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { format } from "date-fns"

const ConversationList = ({ selectedConversation, setSelectedConversation, refreshTrigger }) => {
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const { data } = await axios.get("/api/messages/conversations")
        setConversations(data)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching conversations:", error)
        setLoading(false)
      }
    }

    fetchConversations()
  }, [refreshTrigger])

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation)
  }

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return ""
    const date = new Date(timestamp)
    const now = new Date()

    // If today, show time only
    if (date.toDateString() === now.toDateString()) {
      return format(date, "h:mm a")
    }

    // If this year, show month and day
    if (date.getFullYear() === now.getFullYear()) {
      return format(date, "MMM d")
    }

    // Otherwise show month, day, year
    return format(date, "MMM d, yyyy")
  }

  const handleNewConversation = () => {
    navigate("/new-conversation")
  }

  if (loading) {
    return <div className="p-4 text-center">Loading conversations...</div>
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold">Messages</h2>
        <button
          onClick={handleNewConversation}
          className="mt-2 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition duration-200"
        >
          New Conversation
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No conversations yet</div>
        ) : (
          conversations.map((conversation) => {
            const participant = conversation.participants[0]
            return (
              <div
                key={conversation._id}
                className={`p-4 border-b cursor-pointer hover:bg-gray-100 transition duration-150 ${
                  selectedConversation?._id === conversation._id ? "bg-blue-50" : ""
                }`}
                onClick={() => handleSelectConversation(conversation)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-medium">{participant?.name}</h3>
                    <p className="text-sm text-gray-600 truncate">
                      {conversation.lastMessage?.content || "No messages yet"}
                    </p>
                  </div>
                  <div className="text-xs text-gray-500 whitespace-nowrap ml-2">
                    {formatTimestamp(conversation.lastMessage?.createdAt || conversation.updatedAt)}
                  </div>
                </div>
                {conversation.unreadCount > 0 && (
                  <div className="mt-1 flex justify-end">
                    <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                      {conversation.unreadCount}
                    </span>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default ConversationList
