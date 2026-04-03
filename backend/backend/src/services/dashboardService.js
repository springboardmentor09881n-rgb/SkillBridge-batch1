const pool = require('../config/db');

// ─── VOLUNTEER DASHBOARD ────────────────────────────────────────
const getVolunteerDashboardData = async (userId) => {
    const profileRes = await pool.query(
        `SELECT id, "fullName" as name, skills, location FROM users WHERE id = $1`,
        [userId]
    );

    const appsRes = await pool.query(
        `SELECT a.id, a.status, a."createdAt" as "appliedAt",
         o.title as "opportunityTitle", o.location, o.duration
         FROM applications a
         JOIN opportunities o ON a."opportunityId" = o.id
         WHERE a."volunteerId" = $1
         ORDER BY a."createdAt" DESC`,
        [userId]
    );

    const apps = appsRes.rows;
    const appliedCount = apps.length;
    const acceptedCount = apps.filter(a => a.status === 'accepted').length;
    const pendingCount = apps.filter(a => a.status === 'pending').length;

    // skillsCount: handle both JSONB array and string
    let skillsCount = 0;
    const skills = profileRes.rows[0]?.skills;
    if (Array.isArray(skills)) {
        skillsCount = skills.length;
    } else if (typeof skills === 'string' && skills.length > 0) {
        try {
            const parsed = JSON.parse(skills);
            skillsCount = Array.isArray(parsed) ? parsed.length : 1;
        } catch {
            skillsCount = skills.split(',').filter(Boolean).length;
        }
    }

    // Unread messages count
    const unreadRes = await pool.query(
        `SELECT COUNT(*) FROM messages WHERE "receiverId" = $1 AND "isRead" = FALSE`,
        [userId]
    );

    return {
        profile: profileRes.rows[0] || {},
        appliedCount,
        acceptedCount,
        pendingCount,
        skillsCount,
        unreadMessagesCount: parseInt(unreadRes.rows[0]?.count || 0),
        recentMessages: messagesRes.rows,
        applications: apps.slice(0, 5)
    };
};

// ─── NGO DASHBOARD ─────────────────────────────────────────────
const getNgoDashboardData = async (ngoId) => {
    const [oppsRes, appsRes, pendingRes, recentRes] = await Promise.all([
        pool.query(
            `SELECT COUNT(*) FROM opportunities WHERE "ngoId" = $1`,
            [ngoId]
        ),
        pool.query(
            `SELECT COUNT(*) FROM applications a
             JOIN opportunities o ON a."opportunityId" = o.id
             WHERE o."ngoId" = $1`,
            [ngoId]
        ),
        pool.query(
            `SELECT COUNT(*) FROM applications a
             JOIN opportunities o ON a."opportunityId" = o.id
             WHERE o."ngoId" = $1 AND a.status = 'pending'`,
            [ngoId]
        ),
        pool.query(
            `SELECT a.id, a.status, a."createdAt" as "appliedAt",
             o.title as "opportunityTitle",
             u."fullName" as "volunteerName"
             FROM applications a
             JOIN opportunities o ON a."opportunityId" = o.id
             JOIN users u ON a."volunteerId" = u.id
             WHERE o."ngoId" = $1
             ORDER BY a."createdAt" DESC LIMIT 5`,
            [ngoId]
        )
    ]);

    const unreadMessagesRes = await pool.query(
        `SELECT COUNT(*) FROM messages WHERE "receiverId" = $1 AND "isRead" = FALSE`,
        [ngoId]
    );

    return {
        metrics: {
            opportunitiesCount: parseInt(oppsRes.rows[0]?.count || 0),
            applicationsCount: parseInt(appsRes.rows[0]?.count || 0),
            activeVolunteersCount: parseInt(appsRes.rows[0]?.count || 0),
            pendingApplicationsCount: parseInt(pendingRes.rows[0]?.count || 0),
            unreadMessagesCount: parseInt(unreadMessagesRes.rows[0]?.count || 0)
        },
        recentApplications: recentRes.rows
    };
};

module.exports = {
    getVolunteerDashboardData,
    getNgoDashboardData
};
