import { Server } from 'socket.io';
import crypto from 'crypto';

const PORT = process.env.PORT || 8080;
const io = new Server(PORT, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

function generateRoomId() {
    return crypto.randomUUID().substring(0, 6).toUpperCase();
}

io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.username = null;
    socket.currentRoomId = null;

    socket.on('create', () => {
        const roomId = generateRoomId();

        socket.join(roomId);
        socket.currentRoomId = roomId;

        socket.emit('roomCreated', {
            roomId,
            userId: socket.id
        });

        console.log(`Room ${roomId} created by ${socket.id}`);
    });

    socket.on('join', ({ username, roomId }) => {

        const room = io.sockets.adapter.rooms.get(roomId);

        if (!room) {
            socket.emit('error', { message: 'Room not found' });
            return;
        }

        socket.username = username;
        socket.currentRoomId = roomId;
        socket.join(roomId);


        socket.emit('roomJoined', {
            roomId,
            userId: socket.id,
            username
        });

        socket.to(roomId).emit('userJoined', {
            username,
            userId: socket.id,
            message: `${username} joined the room`
        });

        console.log(`User ${socket.id} (${username}) joined room ${roomId}`);
    });

    socket.on('chat', ({ message, roomId }) => {
        const room = io.sockets.adapter.rooms.get(roomId);

        if (!room) {
            socket.emit('error', { message: 'Room not found' });
            return;
        }

        const messageData = {
            id: crypto.randomUUID(),
            message,
            userId: socket.id,
            username: socket.username || 'Anonymous',
            roomId,
            timestamp: new Date().toISOString()
        };

        io.to(roomId).emit('chat', messageData);

        console.log(`Message in room ${roomId} from ${socket.username}: ${message}`);
    });


    socket.on('leave', () => {
        if (socket.currentRoomId) {

            socket.to(socket.currentRoomId).emit('userLeft', {
                userId: socket.id,
                message: 'A user left the room'
            });

            socket.leave(socket.currentRoomId);
            console.log(`User ${socket.id} left room ${socket.currentRoomId}`);

            socket.currentRoomId = null;
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);

        if (socket.currentRoomId) {
            socket.to(socket.currentRoomId).emit('userLeft', {
                userId: socket.id,
                message: 'A user disconnected'
            });
        }
    });

    socket.on('error', (error) => {
        console.error('Socket error:', error);
    });
});

console.log(`Socket.IO server is running on http://localhost:${PORT}`);
