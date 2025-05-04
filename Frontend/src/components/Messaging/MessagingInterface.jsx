"use client"

import { useState } from "react"
import ConversationList from "./ConversationList"
import MessageList from "./MessageList"

const MessagingInterface = () => {
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const refreshConversations = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  return (
    <div className="h-[calc(100vh-64px)] flex">
      <div className="w-1/3 border-r">
        <ConversationList
          selectedConversation={selectedConversation}
          setSelectedConversation={setSelectedConversation}
          refreshTrigger={refreshTrigger}
        />
      </div>
      <div className="w-2/3">
        <MessageList conversation={selectedConversation} refreshConversations={refreshConversations} />
      </div>
    </div>
  )
}

export default MessagingInterface
