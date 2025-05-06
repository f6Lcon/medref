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
    return (
      <div className="p-4 text-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading conversations...</p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 bg-blue-500 text-white">
        <h2 className="text-xl font-semibold">Messages</h2>
        <button
          onClick={handleNewConversation}
          className="mt-2 w-full bg-white text-blue-500 hover:bg-gray-100 py-2 px-4 rounded-md transition duration-200 font-medium"
        >
          New Conversation
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
            </div>
            <p className="text-lg">No conversations yet</p>
            <p className="text-sm mt-1">Start a new conversation to connect with doctors and patients</p>
          </div>
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
                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 font-bold mr-3 flex-shrink-0">
                    {participant?.name?.charAt(0).toUpperCase() || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-medium truncate">{participant?.name}</h3>
                      <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                        {formatTimestamp(conversation.lastMessage?.createdAt || conversation.updatedAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate mt-1">
                      {conversation.lastMessage?.content || "No messages yet"}
                    </p>
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
