const messageService = require('../services/messageService');

const sendMessage = async (req, res) => {
    try {
        const { receiverId, opportunityId, content } = req.body;
        const message = await messageService.sendMessage(req.user.userId, receiverId, opportunityId, content);
        res.status(201).json({ success: true, data: message });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

const getMessages = async (req, res) => {
    try {
        const messages = await messageService.getMessages(req.user.userId);
        res.status(200).json({ success: true, data: messages });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const getConversation = async (req, res) => {
    try {
        const { otherId, opportunityId } = req.params;
        const messages = await messageService.getConversation(req.user.userId, otherId, opportunityId);
        res.status(200).json({ success: true, data: messages });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    sendMessage,
    getMessages,
    getConversation
};
