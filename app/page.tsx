'use client'

import { useState, useEffect } from 'react'
import ChatRoom from './components/ChatRoom'
import JoinCreate from './components/JoinCreate'
import { useWebSocket } from './hooks/useWebSocket'
import { toast } from 'sonner'
import LiveWireIcon from './components/icons/LiveWireIcon'
import ConnectionStatus from './components/ConnectionStatus'

export default function Home() {
  const [roomId, setRoomId] = useState<string | null>(null)
  const { connectionStatus, lastMessage, sendMessage } = useWebSocket()

  useEffect(() => {
    if (lastMessage) {
      if (lastMessage.type === 'roomJoined') {
        setRoomId(lastMessage.payload.roomId)
      }
      else if (lastMessage.type === 'error') {
        toast.error(`Error: ${lastMessage.payload.message}`)
      }
    }
  }, [lastMessage])

  const handleCreateRoom = () => {
    sendMessage({ type: 'create', payload: {} })
  }

  const handleSendMessage = (message: string) => {
    if (roomId) {
      sendMessage({ type: 'chat', payload: { message, roomId } })
    }
  }

  const handleLeaveRoom = () => {
    if (roomId) {
      sendMessage({ type: 'leave', payload: { roomId } })
      setRoomId(null)
      toast.success('Left room successfully')
    }
  }

  return (
    <main className="flex min-h-[90vh] flex-col items-center justify-center p-0 max-sm:p-4">
      <ConnectionStatus status={connectionStatus} />
      <h1 className="text-4xl font-bold mb-8 flex space-x-3 items-center">
        <span><LiveWireIcon size={32} color="#01ff04" /></span>
        <span>LiveWire</span>
      </h1>
      {roomId ? (
        <ChatRoom
          roomId={roomId}
          connectionStatus={connectionStatus}
          lastMessage={lastMessage}
          onSendMessage={handleSendMessage}
          onLeaveRoom={handleLeaveRoom}
        />
      ) : (
        <JoinCreate
          connectionStatus={connectionStatus}
          onCreateRoom={handleCreateRoom}
          sendMessage={sendMessage}
        />
      )}
    </main>
  )
}
