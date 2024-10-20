export const initSocket = (io) => {
    io.on('connection', (socket) => {
        socket.on('disconnect', () => {
            console.log('Client disconnected');
        });
    });
};
