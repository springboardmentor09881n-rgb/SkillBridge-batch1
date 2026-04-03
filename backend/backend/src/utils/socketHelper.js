let io;

const setIo = (socketIoInstance) => {
    io = socketIoInstance;
};

const getIo = () => {
    return io;
};

module.exports = {
    setIo,
    getIo,
};
