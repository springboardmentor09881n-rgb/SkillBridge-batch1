const pool = require('../config/db');
const { getIo } = require('../utils/socketHelper');

// ─── CREATE NOTIFICATIONS TABLE IF NOT EXISTS ────────────────────
const initNotificationsTable = async () => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS notifications (
            id SERIAL PRIMARY KEY,
            "userId" INTEGER REFERENCES users(id) ON DELETE CASCADE,
            type VARCHAR(50) NOT NULL DEFAULT 'general',
            message TEXT NOT NULL,
            "isRead" BOOLEAN DEFAULT FALSE,
            "relatedId" INTEGER,
            "createdAt" TIMESTAMPTZ DEFAULT NOW()
        )
    `);
};

// Initialize table on service load
initNotificationsTable().catch(err => console.error('Notification table init error:', err.message));

// ─── CREATE A NOTIFICATION ───────────────────────────────────────
const createNotification = async (userId, type, message, relatedId = null) => {
    const result = await pool.query(
        `INSERT INTO notifications ("userId", type, message, "relatedId", "createdAt")
         VALUES ($1, $2, $3, $4, NOW())
         RETURNING *`,
        [userId, type, message, relatedId]
    );

    const notification = result.rows[0];

    // Real-time emission
    const io = getIo();
    if (io) {
        io.to(Number(userId)).emit('newNotification', notification);
        console.log(`Real-time notification emitted to room ${userId}`);
    }

    return notification;
};

// ─── GET NOTIFICATIONS FOR A USER ───────────────────────────────
const getNotifications = async (userId) => {
    const result = await pool.query(
        `SELECT * FROM notifications
         WHERE "userId" = $1
         ORDER BY "createdAt" DESC
         LIMIT 50`,
        [userId]
    );
    return result.rows;
};

// ─── GET UNREAD COUNT ────────────────────────────────────────────
const getUnreadCount = async (userId) => {
    const result = await pool.query(
        `SELECT COUNT(*) FROM notifications WHERE "userId" = $1 AND "isRead" = FALSE`,
        [userId]
    );
    return parseInt(result.rows[0].count || 0);
};

// ─── MARK SINGLE NOTIFICATION AS READ ───────────────────────────
const markAsRead = async (notificationId, userId) => {
    const result = await pool.query(
        `UPDATE notifications SET "isRead" = TRUE
         WHERE id = $1 AND "userId" = $2
         RETURNING *`,
        [notificationId, userId]
    );
    return result.rows[0];
};

// ─── MARK ALL NOTIFICATIONS AS READ ─────────────────────────────
const markAllAsRead = async (userId) => {
    await pool.query(
        `UPDATE notifications SET "isRead" = TRUE WHERE "userId" = $1`,
        [userId]
    );
};

module.exports = {
    createNotification,
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
};
