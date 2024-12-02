export const initSocket = (io) => {
    io.on('connection', (socket) => {
        console.log(`Client connected: ${socket.id}`);

        // Handle room creation
        socket.on('createRoom', (callback) => {
            const roomKey = `room_${Math.random().toString(36).substring(2, 10)}`;
            socket.join(roomKey);
            console.log(`Room created: ${roomKey}`);
            callback({ roomKey });
        });

        // Handle joining a room
        socket.on('joinRoom', (roomKey, callback) => {
            const rooms = io.sockets.adapter.rooms;
            if (rooms.has(roomKey)) {
                socket.join(roomKey);
                console.log(`Client ${socket.id} joined room ${roomKey}`);
                callback({ success: true, message: `Joined room ${roomKey}` });
            }
            else {
                callback({ success: false, message: "Room does not exist" });
            }
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log(`Client disconnected: ${socket.id}`);
        });
    });
};
