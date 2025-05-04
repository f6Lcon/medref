"use client"

import { useState, useEffect, useRef } from "react"
import axios from "axios"
import { format } from "date-fns"
import { useLoginContext } from "../../context/LoginContext"

const MessageList = ({ conversation, refreshConversations }) => {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)
  const { user } = useLoginContext()

  // Poll for new messages every 5 seconds
  useEffect(() => {
    let intervalId

    const fetchMessages = async () => {
      if (!conversation?._id) return

      try {
        const { data } = await axios.get(`/api/messages/${conversation._id}`)
        setMessages(data)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching messages:", error)
        setLoading(false)
      }
    }

    fetchMessages()

    // Set up polling
    intervalId = setInterval(fetchMessages, 5000)

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [conversation])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async (e) => {
    e.preventDefault()

    if (!newMessage.trim() || !conversation?._id) return

    try {
      setSending(true)
      await axios.post("/api/messages", {
        conversationId: conversation._id,
        content: newMessage,
      })

      setNewMessage("")

      // Refresh messages and conversations
      const { data } = await axios.get(`/api/messages/${conversation._id}`)
      setMessages(data)
      refreshConversations()
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setSending(false)
    }
  }

  const formatMessageTime = (timestamp) => {
    return format(new Date(timestamp), "h:mm a")
  }

  if (!conversation) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Select a conversation to start messaging</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p>Loading messages...</p>
      </div>
    )
  }

  const participant = conversation.participants[0]

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-white shadow-sm">
        <h2 className="text-lg font-medium">{participant?.name}</h2>
        <p className="text-sm text-gray-500">{participant?.role}</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 my-8">No messages yet. Start the conversation!</div>
        ) : (
          messages.map((message) => {
            const isCurrentUser = message.sender._id === user?._id

            return (
              <div key={message._id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[70%] p-3 rounded-lg ${
                    isCurrentUser
                      ? "bg-blue-500 text-white rounded-br-none"
                      : "bg-gray-200 text-gray-800 rounded-bl-none"
                  }`}
                >
                  <p>{message.content}</p>
                  <p className={`text-xs mt-1 text-right ${isCurrentUser ? "text-blue-100" : "text-gray-500"}`}>
                    {formatMessageTime(message.createdAt)}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t bg-white">
        <form onSubmit={handleSendMessage} className="flex">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 border rounded-l-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={sending}
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-r-md transition duration-200 disabled:bg-blue-300"
            disabled={sending || !newMessage.trim()}
          >
            {sending ? "Sending..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default MessageList
