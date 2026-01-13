import { useEffect, useRef, useState, useCallback } from 'react'
import { useRoomId } from './useRoomId'
import { toast } from 'sonner'
import { useUserId } from './useUserId'
import { io, Socket } from 'socket.io-client'

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'reconnecting'

export interface WebSocketMessage {
    type: string
    payload: any
}

export function useWebSocket() {
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting')
    const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null)
    const socket = useRef<Socket | null>(null)
    const { setCurrentRoomId } = useRoomId()
    const { setUserId } = useUserId()

    useEffect(() => {
        
        socket.current = io(process.env.NEXT_PUBLIC_WEBSOCKET_URL ?? 'http://localhost:8080', {
            autoConnect: true,
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: Infinity,
            timeout: 20000
        })

        
        socket.current.on('connect', () => {
            setConnectionStatus('connected')
            toast.success('Connected to server')
        })

        socket.current.on('disconnect', () => {
            setConnectionStatus('reconnecting')
            toast.info('Connection lost. Reconnecting...')
        })

        socket.current.on('reconnect_attempt', () => {
            setConnectionStatus('reconnecting')
        })

        socket.current.on('reconnect', () => {
            setConnectionStatus('connected')
            toast.success('Reconnected successfully!')
        })

        socket.current.on('connect_error', () => {
            setConnectionStatus('reconnecting')
        })

        
        socket.current.on('roomCreated', (payload) => {
            toast.success('Room Created Successfully')
            setCurrentRoomId(payload.roomId)
            setLastMessage({ type: 'roomCreated', payload })
        })

        socket.current.on('roomJoined', (payload) => {
            setUserId(payload.userId)
            toast.success('Room Joined Successfully')
            setLastMessage({ type: 'roomJoined', payload })
        })

        socket.current.on('userJoined', (payload) => {
            setLastMessage({ type: 'userJoined', payload })
        })

        socket.current.on('userLeft', (payload) => {
            setLastMessage({ type: 'userLeft', payload })
        })

        
        socket.current.on('chat', (payload) => {
            setLastMessage({ type: 'chat', payload })
        })

        
        socket.current.on('error', (payload) => {
            toast.error(payload.message || 'An error occurred')
            setLastMessage({ type: 'error', payload })
        })

        return () => {
            if (socket.current) {
                socket.current.disconnect()
            }
        }
    }, [setCurrentRoomId, setUserId])

    const sendMessage = useCallback((message: WebSocketMessage) => {
        if (socket.current?.connected) {
            if (message.type === 'leave') {
                setCurrentRoomId('')
            }
            
            socket.current.emit(message.type, message.payload)
        } else {
            toast.error('Socket.IO is not connected')
        }
    }, [setCurrentRoomId])

    return { connectionStatus, lastMessage, sendMessage }
}

