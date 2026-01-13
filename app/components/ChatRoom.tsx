import { useState, useEffect, useRef } from 'react';
import { WebSocketMessage } from '../hooks/useWebSocket';
import { toast } from 'sonner';
import { CopyIcon, LogOut } from 'lucide-react';
import { useUserId } from '../hooks/useUserId';

interface ChatRoomProps {
    roomId: string;
    connectionStatus: string;
    lastMessage: WebSocketMessage | null;
    onSendMessage: (message: string) => void;
    onLeaveRoom: () => void;
}

interface Message {
    id?: string;
    username: string;
    message: string;
    userId: string;
}

export default function ChatRoom({ roomId, connectionStatus, lastMessage, onSendMessage, onLeaveRoom }: ChatRoomProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const chatBoxRef = useRef<HTMLDivElement>(null);
    const { userId } = useUserId();
    const processedMessageIds = useRef<Set<string>>(new Set());

    useEffect(() => {
        if (lastMessage && lastMessage.type === 'chat') {
            const messageId = lastMessage.payload.id;

            if (messageId && processedMessageIds.current.has(messageId)) {
                return;
            }
            if (messageId) {
                processedMessageIds.current.add(messageId);
            }
            setMessages((prevMessages) => [...prevMessages, lastMessage.payload]);
        }
    }, [lastMessage]);

    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = () => {
        if (inputMessage.trim() && connectionStatus === 'connected') {
            onSendMessage(inputMessage.trim());
            setInputMessage('');
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(roomId);
        toast.success("Room Code Copied successfully");
    };

    return (
        <div className="w-full max-w-2xl">
            <div className="w-full flex justify-between items-center px-4 py-2 rounded-lg border">
                <div className="flex items-center gap-2">
                    <h2>Room Code: {roomId}</h2>
                    {connectionStatus === 'reconnecting' && (
                        <span className="text-xs text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                            <span className="inline-block h-2 w-2 rounded-full bg-yellow-500 animate-pulse"></span>
                            Reconnecting...
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <span onClick={copyToClipboard} className="cursor-pointer">
                        <CopyIcon className='h-4 w-4 hover:scale-110' />
                    </span>
                    <button
                        onClick={onLeaveRoom}
                        className="flex items-center gap-1 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                        title="Leave Room"
                    >
                        <LogOut className='h-4 w-4' />
                    </button>
                </div>
            </div>
            <div className="pt-6">
                <div
                    className="mb-4 h-[60vh] flex flex-col pb-2 overflow-y-auto overflow-x-hidden"
                    ref={chatBoxRef}
                >
                    {messages.map((msg, index) => (
                        <div key={msg.id || index} className={`flex flex-col mb-2 ${userId === msg.userId ? 'items-end' : 'items-start'}`}>
                            <span className={`text-xs ${userId === msg.userId ? 'mr-1' : 'mr-0'}`}>{msg.username}</span>
                            <span className='bg-slate-700 text-white break-words w-fit px-4 mr-1 rounded-xl h-fit p-2 mt-1'>
                                {msg.message}
                            </span>
                        </div>
                    ))}
                </div>
                <div className="flex">
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyUp={(e) => e.key === 'Enter' && handleSendMessage()}
                        disabled={connectionStatus !== 'connected'}
                        className="w-full border border-gray-300 bg-white text-black dark:bg-gray-800 dark:text-white dark:border-gray-600 h-10 px-5 rounded-lg text-sm focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder={connectionStatus === 'connected' ? "Type a message..." : "Reconnecting..."}
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={connectionStatus !== 'connected'}
                        className="cursor-pointer hover:bg-[#1E41B2] bg-blue-600 text-white py-2 px-4 rounded-lg ml-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}
