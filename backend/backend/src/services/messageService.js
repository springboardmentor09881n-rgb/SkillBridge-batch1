const pool = require('../config/db');

// Ensure consistent ordering
const getOrderedUsers = (a, b) => (a < b ? [a, b] : [b, a]);

// ======================================
// 📥 GET ALL CONVERSATIONS
// ======================================
exports.getMessages = async (userId) => {
    const query = `
        SELECT 
            c.id AS conversation_id,
            c.opportunity_id,

            u.id AS other_user_id,
            u."fullName",
            u.username,

            COALESCE(m.content, '') AS last_message,
            m.created_at AS last_message_time

        FROM conversations c

        JOIN users u 
            ON u.id = CASE 
                WHEN c.user1_id = $1 THEN c.user2_id 
                ELSE c.user1_id 
            END

        LEFT JOIN LATERAL (
            SELECT content, created_at
            FROM messages
            WHERE conversation_id = c.id
            ORDER BY created_at DESC
            LIMIT 1
        ) m ON true

        WHERE c.user1_id = $1 OR c.user2_id = $1

        ORDER BY COALESCE(m.created_at, c.created_at) DESC;
    `;

    const result = await pool.query(query, [userId]);
    return result.rows;
};

// ======================================
// 💬 GET SINGLE CONVERSATION
// ======================================
exports.getConversation = async (userId, otherId, opportunityId) => {
    const [u1, u2] = getOrderedUsers(userId, otherId);

    // 🔴 SECURITY FIX
    const convo = await pool.query(
        `SELECT id FROM conversations 
         WHERE user1_id = $1 
         AND user2_id = $2 
         AND opportunity_id = $3
         AND (user1_id = $4 OR user2_id = $4)`,
        [u1, u2, opportunityId, userId]
    );

    if (convo.rows.length === 0) return [];

    const conversationId = convo.rows[0].id;

    const messages = await pool.query(
        `SELECT 
            id,
            sender_id,
            receiver_id,
            content,
            is_read,
            created_at
         FROM messages
         WHERE conversation_id = $1
         ORDER BY created_at ASC`,
        [conversationId]
    );

    // Mark as read
    await pool.query(
        `UPDATE messages 
         SET is_read = true 
         WHERE conversation_id = $1 
         AND receiver_id = $2`,
        [conversationId, userId]
    );

    return messages.rows;
};

// ======================================
// 📤 SEND MESSAGE
// ======================================
exports.sendMessage = async (senderId, receiverId, opportunityId, content) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 🔴 VALIDATIONS
        if (senderId === receiverId) {
            throw new Error('Cannot message yourself');
        }

        if (!content || !content.trim()) {
            throw new Error('Message cannot be empty');
        }

        const [u1, u2] = getOrderedUsers(senderId, receiverId);

        // 🔴 RACE CONDITION FIX (UPSERT)
        await client.query(
            `INSERT INTO conversations (user1_id, user2_id, opportunity_id)
             VALUES ($1, $2, $3)
             ON CONFLICT (user1_id, user2_id, opportunity_id)
             DO NOTHING`,
            [u1, u2, opportunityId]
        );

        // 🔹 Always fetch conversation
        const convo = await client.query(
            `SELECT id FROM conversations 
             WHERE user1_id = $1 
             AND user2_id = $2 
             AND opportunity_id = $3`,
            [u1, u2, opportunityId]
        );

        const conversationId = convo.rows[0].id;

        // 🔹 Insert message
        const message = await client.query(
            `INSERT INTO messages 
                (conversation_id, sender_id, receiver_id, content)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [conversationId, senderId, receiverId, content]
        );

        await client.query('COMMIT');

        // 🔥 IMPORTANT: Return conversationId also
        return {
            ...message.rows[0],
            conversation_id: conversationId
        };

    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};