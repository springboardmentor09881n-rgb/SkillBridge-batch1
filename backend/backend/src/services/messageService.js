const pool = require('../config/db');

const sendMessage = async (senderId, receiverId, opportunityId, content) => {
    const result = await pool.query(
        `INSERT INTO messages ("senderId", "receiverId", "opportunityId", content)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [senderId, receiverId, opportunityId, content]
    );
    return result.rows[0];
};

const getMessages = async (userId) => {
    const result = await pool.query(
        `SELECT m.*, u."fullName" as "senderName"
         FROM messages m
         JOIN users u ON m."senderId" = u.id
         WHERE m."receiverId" = $1 OR m."senderId" = $1
         ORDER BY m."createdAt" DESC`,
        [userId]
    );
    return result.rows;
};

const getConversation = async (userId, otherId, opportunityId) => {
    const result = await pool.query(
        `SELECT m.*, u."fullName" as "senderName"
         FROM messages m
         JOIN users u ON m."senderId" = u.id
         WHERE (("senderId" = $1 AND "receiverId" = $2) OR ("senderId" = $2 AND "receiverId" = $1))
         AND "opportunityId" = $3
         ORDER BY m."createdAt" ASC`,
        [userId, otherId, opportunityId]
    );
    return result.rows;
};

module.exports = {
    sendMessage,
    getMessages,
    getConversation
};
