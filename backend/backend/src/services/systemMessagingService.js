const pool = require('../config/db');
const messageService = require('./messageService');
const bcrypt = require('bcrypt');

const SYSTEM_USER_EMAIL = 'support@skillbridge.org';
const SYSTEM_USER_NAME = 'SkillBridge Team';

/**
 * Ensures the 'SkillBridge Team' user exists and sends a system message.
 */
const sendSystemMessage = async (receiverId, content) => {
    try {
        let systemUser = await pool.query('SELECT id FROM users WHERE email = $1', [SYSTEM_USER_EMAIL]);
        let systemUserId;

        if (systemUser.rows.length === 0) {
            const dummyPass = await bcrypt.hash('system_pass_123', 10);
            const createRes = await pool.query(
                'INSERT INTO users (username, "fullName", email, password, iam) VALUES ($1, $2, $3, $4, $5) RETURNING id',
                ['skillbridge_team', SYSTEM_USER_NAME, SYSTEM_USER_EMAIL, dummyPass, 'ngo']
            );
            systemUserId = createRes.rows[0].id;
        } else {
            systemUserId = systemUser.rows[0].id;
        }

        const saved = await messageService.saveMessage({
            senderId: systemUserId,
            receiverId: receiverId,
            content: content
        });

        // Emit real-time message via Socket.io
        const { getIo } = require('../utils/socketHelper');
        const io = getIo();
        if (io) {
            io.to(Number(receiverId)).emit('receiveMessage', {
                ...saved,
                senderName: SYSTEM_USER_NAME
            });
        }

        return saved;
    } catch (error) {
        console.error('Error sending system message:', error.message);
        return null;
    }
};

module.exports = { sendSystemMessage, SYSTEM_USER_EMAIL, SYSTEM_USER_NAME };
