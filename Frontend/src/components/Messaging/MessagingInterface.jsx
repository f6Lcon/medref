"use client"

import { useState, useEffect } from "react"
import ConversationList from "./ConversationList"
import MessageList from "./MessageList"
import { io } from "socket.io-client"
import axios from "axios"

const MessagingInterface = () => {
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [socket, setSocket] = useState(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Initialize Socket.IO connection
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) return

    // Connect to Socket.IO server
    const socketInstance = io(import.meta.env.VITE_API_URL || "http://localhost:5000", {
      auth: { token },
    })

    socketInstance.on("connect", () => {
      console.log("Socket.IO connected")
    })

    socketInstance.on("connect_error", (error) => {
      console.error("Socket.IO connection error:", error.message)
    })

    // Handle conversation updates
    socketInstance.on("conversation_updated", (data) => {
      console.log("Conversation updated:", data)
      setRefreshTrigger(prev => prev + 1)
    })

    setSocket(socketInstance)

    // Cleanup on unmount
    return () => {
      if (socketInstance) {
        socketInstance.disconnect()
      }
    }
  }, [])

  // Join conversation room when selected
  useEffect(() => {
    if (!socket || !selectedConversation) return

    // Join the conversation room
    socket.emit("join_conversation", selectedConversation._id)

    // Cleanup - leave the room when conversation changes or component unmounts
    return () => {
      socket.emit("leave_conversation", selectedConversation._id)
    }
  }, [socket, selectedConversation])

  const refreshConversations = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <div className="h-[calc(100vh-64px)] flex bg-gray-100">
      <div className="w-1/3 border-r bg-white shadow-md">
        <ConversationList
          selectedConversation={selectedConversation}
          setSelectedConversation={setSelectedConversation}
          refreshTrigger={refreshTrigger}
        />
      </div>
      <div className="w-2/3 flex flex-col">
        <MessageList 
          conversation={selectedConversation} 
          socket={socket} 
          refreshConversations={refreshConversations} 
        />
      </div>
    </div>
  )
}

export default MessagingInterface
