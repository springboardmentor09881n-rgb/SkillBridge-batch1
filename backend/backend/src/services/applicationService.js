const pool = require('../config/db');
const notificationService = require('./notificationService');

const applyForOpportunity = async (volunteerId, opportunityId, message) => {
    // Check if already applied
    const existing = await pool.query(
        'SELECT * FROM applications WHERE "volunteerId" = $1 AND "opportunityId" = $2',
        [volunteerId, opportunityId]
    );

    if (existing.rows.length > 0) {
        throw new Error('You have already applied for this opportunity');
    }

    const result = await pool.query(
        `INSERT INTO applications ("volunteerId", "opportunityId", message, status, "createdAt")
         VALUES ($1, $2, $3, 'pending', NOW())
         RETURNING *`,
        [volunteerId, opportunityId, message || '']
    );

    // Notify the NGO that owns this opportunity
    try {
        const oppRes = await pool.query(
            `SELECT o.title, o."ngoId", u."fullName" as "volunteerName"
             FROM opportunities o
             JOIN users u ON u.id = $1
             WHERE o.id = $2`,
            [volunteerId, opportunityId]
        );
        if (oppRes.rows.length > 0) {
            const { title, ngoId, volunteerName } = oppRes.rows[0];
            await notificationService.createNotification(
                ngoId,
                'application',
                `New application from ${volunteerName || 'a volunteer'} for "${title}"`,
                result.rows[0].id
            );
        }
    } catch (notifErr) {
        console.error('Notification error (non-fatal):', notifErr.message);
    }

    return result.rows[0];
};

const getVolunteerApplications = async (volunteerId) => {
    const result = await pool.query(
        `SELECT 
            a.id,
            a."opportunityId",
            a.status,
            a.message,
            a."createdAt" as "appliedAt",
            o.title as "opportunityTitle",
            o.location,
            o.duration,
            o."requiredSkills",
            u."organizationName" as "ngoName"
         FROM applications a
         JOIN opportunities o ON a."opportunityId" = o.id
         JOIN users u ON o."ngoId" = u.id
         WHERE a."volunteerId" = $1
         ORDER BY a."createdAt" DESC`,
        [volunteerId]
    );
    return result.rows;
};

const getNgoApplications = async (ngoId) => {
    const result = await pool.query(
        `SELECT 
            a.id,
            a."opportunityId",
            a.status,
            a.message,
            a."createdAt" as "appliedAt",
            o.title as "opportunityTitle",
            o."requiredSkills",
            u."fullName" as "volunteerName",
            u.id as "volunteerId",
            u.skills as "volunteerSkills",
            u.email as "volunteerEmail"
         FROM applications a
         JOIN opportunities o ON a."opportunityId" = o.id
         JOIN users u ON a."volunteerId" = u.id
         WHERE o."ngoId" = $1
         ORDER BY a."createdAt" DESC`,
        [ngoId]
    );
    return result.rows;
};

const updateApplicationStatus = async (ngoId, applicationId, status) => {
    // Verify NGO owns the opportunity this application belongs to
    const check = await pool.query(
        `SELECT a.id, a."volunteerId", o.title as "opportunityTitle"
         FROM applications a
         JOIN opportunities o ON a."opportunityId" = o.id
         WHERE a.id = $1 AND o."ngoId" = $2`,
        [applicationId, ngoId]
    );

    if (check.rows.length === 0) {
        throw new Error('Application not found or unauthorized');
    }

    const validStatuses = ['pending', 'accepted', 'rejected'];
    if (!validStatuses.includes(status)) {
        throw new Error('Invalid status. Must be pending, accepted, or rejected');
    }

    const result = await pool.query(
        'UPDATE applications SET status = $1 WHERE id = $2 RETURNING *',
        [status, applicationId]
    );

    // Notify the volunteer about the status change
    try {
        const { volunteerId, opportunityTitle } = check.rows[0];
        const statusLabel = status === 'accepted' ? 'accepted ✅' : status === 'rejected' ? 'rejected ❌' : 'updated';
        await notificationService.createNotification(
            volunteerId,
            'status_update',
            `Your application for "${opportunityTitle}" has been ${statusLabel}`,
            applicationId
        );
    } catch (notifErr) {
        console.error('Notification error (non-fatal):', notifErr.message);
    }

    return result.rows[0];
};

module.exports = {
    applyForOpportunity,
    getVolunteerApplications,
    getNgoApplications,
    updateApplicationStatus
};
