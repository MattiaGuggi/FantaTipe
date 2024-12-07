import { Room } from '../models/room.model.js';

export const initSocket = (io) => {
    io.on('connection', (socket) => {
        console.log(`Client connected: ${socket.id}`);

        socket.on('message', (data) => {
            console.log(`Received message: ${data.message}`);
        });

        socket.on('deleteRoom', async (data) => {
            console.log(`Room deleted: ${data.name}`);
            const name = data.name;
            const key = data.key;

            try {
                const room = await Room.findOneAndDelete({ key });
                if (room) {
                    console.log(`Room ${key} deleted by creator.`);
                    io.emit("refreshRoom", { key: key, name: name }); // Notify all clients to refresh
                }
            } catch (err) {
                console.error(`Error deleting room ${key}:`, err);
            }
        });

        socket.on('startGame', async (data) => {
            console.log('Game started');
            const key = data.key;

            try {
                const room = await Room.findOne({ key });
                if (room) {
                    console.log(`Room ${key}'s status updated to active.`);
                    room.status = 'active';
                    await room.save();
                    io.emit('startGame');
                }
            } catch (err) {
                console.error(`Error deleting room ${key}:`, err);
            }
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log(`Client disconnected: ${socket.id}`);
        });
    });
};
