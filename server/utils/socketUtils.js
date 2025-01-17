import { Room } from '../models/room.model.js';

export const initSocket = (io) => {
    const roomReadiness = {}; // Track readiness per room
    let array = {}; // Track songs in every Guess Song room
    let secondArray = {}; // Track chosen image in every room Showdown

    io.on('connection', (socket) => {
        console.log(`Client connected: ${socket.id}`);

        socket.on('message', (data) => {
            console.log(`Received message: ${data.message}`);
        });

        socket.on('userJoined', (data) => {
            console.log(`User joined: ${data.participant}`);

            if (!roomReadiness[data.key]) {
                roomReadiness[data.key] = new Set();
            }
            
            io.emit('userJoined', { participant: data.participant });
        });

        socket.on('userLoggedOut', async (data) => {
            console.log(`User left: ${data.user}`);
            
            try {
                const key = data.key;
                const room = await Room.findOne({ key });
                if (room) {
                    console.log(`Room ${key}'s participants members updated.`);
                    room.participants.remove(data.user);
                    await room.save();
                    io.emit('userLoggedOut', { participant: data.user });
                }
            } catch (err) {
                console.error('Error leaving the room', err);
            }
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

        socket.on('ready', async (data) => {
            const key = data.key;
            const user = data.user;

            if (!array[key]) {
                array[key] = [];
            }
            array[key].push(data.array[0]);

            if (!roomReadiness[key]) {
                roomReadiness[key] = new Set();
            }
            roomReadiness[key].add(user);

            try {
                const room = await Room.findOne({ key });
                if (room) {
                    const totalParticipants = room.participants.length;

                    // The stored players must be the same as the participants + the creator
                    if (roomReadiness[key].size === totalParticipants + 1) {
                        io.emit('allReady', { key: key, array: array[key] });
                    }
                }
            } catch (err) {
                console.error('Error checking room readiness:', err);
            }
        });

        socket.on('startGame', async (data) => {
            const key = data.key;

            try {
                const room = await Room.findOne({ key });
                if (room) {
                    room.status = 'active';
                    await room.save();
                    io.emit('startGame');
                }
            } catch (err) {
                console.error(`Error deleting room ${key}:`, err);
            }
        });  
        
        socket.on('chosen', async (data) => {
            const key = data.key;
            const pfp = data.pfp;
            const user = data.user;

            if (!secondArray[key]) {
                secondArray[key] = [];
            }
            secondArray[key].push(pfp);

            if (!roomReadiness[key]) {
                roomReadiness[key] = new Set();
            }
            roomReadiness[key].add(user);

            try {
                const room = await Room.findOne({ key });

                if (room?.status == 'waiting') {
                    room.status = 'active';
                    await room.save();
                }

                io.emit('chosen', { pfp: secondArray[key] });
            } catch (err) {
                console.error('Error getting chosen image');
            }
        });

        socket.on('winningImage', (data) => {
            const image = data.url;

            try {
                io.emit('winningImage', { url: image });
            } catch(err) {
                console.error('Error sending winning image', err);
            }
        });

        socket.on('clear', async (data) => {
            const key = data.key;

            try {
                const room = await Room.findOne({ key });

                if (room) {
                    roomReadiness[key] = new Set(); // Clearing previous set by overriding a new one (empty)
                }
            } catch(err) {
                console.error('Error clearing room readiness', err);
            }
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log(`Client disconnected: ${socket.id}`);
            for (const key in roomReadiness) {
                roomReadiness[key].delete(socket.id);
            }
            for (const key in array) {
                array[key] = array[key].filter(item => item !== socket.id);
            }
        });
    });
};
