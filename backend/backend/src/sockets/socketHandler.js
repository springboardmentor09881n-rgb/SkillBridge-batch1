const socketHandler = (io) => {

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        // 🔗 JOIN ROOM
        socket.on('joinConversation', (conversationId) => {
            socket.join(`conversation_${conversationId}`);
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });

};

module.exports = socketHandler;