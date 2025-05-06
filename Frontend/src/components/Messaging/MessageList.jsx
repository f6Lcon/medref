"use client"

import { useState, useEffect, useRef } from "react"
import axios from "axios"
import { format } from "date-fns"
import { useLoginContext } from "../../context/LoginContext"

const MessageList = ({ conversation, socket, refreshConversations }) => {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)
  const { user } = useLoginContext()

  // Fetch messages when conversation changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!conversation?._id) {
        setMessages([])
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const { data } = await axios.get(`/api/messages/${conversation._id}`)
        setMessages(data)
      } catch (error) {
        console.error("Error fetching messages:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMessages()
  }, [conversation])

  // Listen for new messages via Socket.IO
  useEffect(() => {
    if (!socket || !conversation) return

    const handleNewMessage = (message) => {
      console.log("New message received:", message)
      if (message.conversation === conversation._id) {
        setMessages((prevMessages) => [...prevMessages, message])
      }
    }

    socket.on("new_message", handleNewMessage)

    return () => {
      socket.off("new_message", handleNewMessage)
    }
  }, [socket, conversation])

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

  const formatMessageDate = (timestamp) => {
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    } else {
      return format(date, "MMMM d, yyyy")
    }
  }

  // Group messages by date
  const groupMessagesByDate = (messages) => {
    const groups = {}

    messages.forEach((message) => {
      const date = new Date(message.createdAt).toDateString()
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(message)
    })

    return Object.entries(groups).map(([date, messages]) => ({
      date: new Date(date),
      messages,
    }))
  }

  if (!conversation) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gray-50">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-blue-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </div>
        <p className="text-gray-500 text-lg font-medium">Select a conversation to start messaging</p>
        <p className="text-gray-400 mt-2 text-center max-w-md">
          Choose a conversation from the list or start a new one to connect with doctors and patients
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="ml-3 text-gray-600">Loading messages...</p>
      </div>
    )
  }

  const participant = conversation.participants[0]
  const groupedMessages = groupMessagesByDate(messages)

  return (
    <div className="h-full flex flex-col bg-gray-100">
      {/* Header */}
      <div className="p-4 border-b bg-white shadow-sm flex items-center">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 font-bold mr-3">
          {participant?.name?.charAt(0).toUpperCase() || "?"}
        </div>
        <div>
          <h2 className="text-lg font-medium">{participant?.name}</h2>
          <p className="text-sm text-gray-500">{participant?.role}</p>
        </div>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{
          backgroundImage:
            "url('https://web.whatsapp.com/img/bg-chat-tile-light_a4be512e7195b6b733d9110b408f075d.png')",
          backgroundRepeat: "repeat",
        }}
      >
        {messages.length === 0 ? (
          <div className="bg-white rounded-lg p-6 text-center shadow-sm max-w-md mx-auto">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-blue-500"
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
            <p className="text-gray-500 font-medium">No messages yet</p>
            <p className="text-sm text-gray-400 mt-1">Start the conversation!</p>
          </div>
        ) : (
          groupedMessages.map((group, groupIndex) => (
            <div key={groupIndex} className="space-y-3">
              <div className="flex justify-center">
                <div className="bg-white px-3 py-1 rounded-full text-xs text-gray-500 shadow-sm">
                  {formatMessageDate(group.date)}
                </div>
              </div>

              {group.messages.map((message) => {
                const isCurrentUser = message.sender?._id === user?._id

                return (
                  <div key={message._id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[70%] p-3 rounded-lg shadow-sm ${
                        isCurrentUser
                          ? "bg-blue-500 text-white rounded-tr-none"
                          : "bg-white text-gray-800 rounded-tl-none"
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{message.content}</p>
                      <div
                        className={`flex justify-end items-center mt-1 space-x-1 ${isCurrentUser ? "text-blue-100" : "text-gray-400"}`}
                      >
                        <span className="text-xs">{formatMessageTime(message.createdAt)}</span>
                        {isCurrentUser && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-3 border-t bg-white">
        <form onSubmit={handleSendMessage} className="flex items-center">
          <div className="flex-1 bg-gray-100 rounded-full py-2 px-4 flex items-center">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0"
              disabled={sending}
            />
            <button
              type="button"
              className="text-gray-400 hover:text-gray-600 p-1"
              onClick={() => {
                /* Add emoji picker functionality */
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
          </div>
          <button
            type="submit"
            className="ml-2 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full transition duration-200 disabled:bg-blue-300 flex items-center justify-center w-10 h-10"
            disabled={sending || !newMessage.trim()}
          >
            {sending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default MessageList
