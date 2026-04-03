const pool = require('../config/db');

/**
 * Save a new message to the database
 */
const saveMessage = async (data) => {
    const { senderId, receiverId, content, opportunityId } = data;
    const result = await pool.query(
        'INSERT INTO messages ("senderId", "receiverId", "content", "opportunityId", "isRead", "createdAt") VALUES ($1, $2, $3, $4, FALSE, NOW()) RETURNING *',
        [senderId, receiverId, content, opportunityId]
    );
    return result.rows[0];
};

const markConversationAsRead = async (userId, otherId) => {
    return await pool.query(
        'UPDATE messages SET "isRead" = TRUE WHERE "receiverId" = $1 AND "senderId" = $2 AND "isRead" = FALSE',
        [userId, otherId]
    );
};

/**
 * Get all conversations for a user
 * Returns a list of unique users the current user has messaged
 */
const getConversations = async (userId) => {
    // This query finds unique conversation partners and their last message
    const query = `
        WITH LastMessages AS (
            SELECT 
                CASE WHEN "senderId" = $1 THEN "receiverId" ELSE "senderId" END as "otherId",
                content,
                "createdAt",
                ROW_NUMBER() OVER(PARTITION BY CASE WHEN "senderId" = $1 THEN "receiverId" ELSE "senderId" END ORDER BY "createdAt" DESC) as rn
            FROM messages
            WHERE "senderId" = $1 OR "receiverId" = $1
        )
        SELECT 
            lm."otherId",
            u."fullName" as "otherName",
            u.iam as "otherRole",
            lm.content as "lastMessageContent",
            lm."createdAt" as "lastMessageTime",
            COALESCE((SELECT COUNT(*) FROM messages WHERE "receiverId" = $1 AND "senderId" = lm."otherId" AND "isRead" = FALSE), 0) as "unreadCount"
        FROM LastMessages lm
        JOIN users u ON lm."otherId" = u.id
        WHERE lm.rn = 1
        ORDER BY lm."createdAt" DESC
    `;
    const result = await pool.query(query, [userId]);
    
    // Map to the format the frontend expects
    return result.rows.map(row => ({
        otherId: row.otherId,
        otherName: row.otherName,
        otherRole: row.otherRole,
        lastMessage: {
            content: row.lastMessageContent,
            createdAt: row.lastMessageTime
        },
        unread: parseInt(row.unreadCount || 0)
    }));
};

/**
 * Get message history between two users
 */
const getMessagesBetween = async (userId, otherId, opportunityId = null) => {
    let query = `
        SELECT * FROM messages
        WHERE (("senderId" = $1 AND "receiverId" = $2) OR ("senderId" = $2 AND "receiverId" = $1))
    `;
    const params = [userId, otherId];

    if (opportunityId) {
        query += ' AND "opportunityId" = $3';
        params.push(opportunityId);
    }

    query += ' ORDER BY "createdAt" ASC';
    
    const result = await pool.query(query, params);
    return result.rows;
};

module.exports = {
    saveMessage,
    getConversations,
    getMessagesBetween,
    markConversationAsRead
};
