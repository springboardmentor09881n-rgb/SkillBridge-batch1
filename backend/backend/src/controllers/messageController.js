const messageService = require('../services/messageService');

// ======================================
// 📥 GET ALL CONVERSATIONS
// GET /api/messages
// ======================================
exports.getMessages = async (req, res) => {
    try {
        const userId = req.user.userId;

        const data = await messageService.getMessages(userId);

        return res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Get Messages Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch messages'
        });
    }
};

// ======================================
// 💬 GET CONVERSATION
// GET /api/messages/:otherId/:opportunityId
// ======================================
exports.getConversation = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { otherId, opportunityId } = req.params;

        const data = await messageService.getConversation(
            userId,
            parseInt(otherId),
            parseInt(opportunityId)
        );

        return res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Get Conversation Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch conversation'
        });
    }
};

// ======================================
// 📤 SEND MESSAGE
// POST /api/messages
// Body: { receiverId, opportunityId, content }
// ======================================
exports.sendMessage = async (req, res) => {
    try {
        const senderId = req.user.userId;
        const { receiverId, opportunityId, content } = req.body;

        if (!receiverId || !opportunityId || !content) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        const data = await messageService.sendMessage(
            senderId,
            parseInt(receiverId),
            parseInt(opportunityId),
            content
        );

        // 🔥 SOCKET EMIT (KEY FIX)
        const io = req.app.get("io");

        io.to(`conversation_${data.conversation_id}`).emit("receiveMessage", data);

        return res.json({
            success: true,
            data
        });

    } catch (error) {
        console.error('Send Message Error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to send message'
        });
    }
};