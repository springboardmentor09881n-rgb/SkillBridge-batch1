const pool = require('../config/db')

const createOpportunity = async (oppData, ngoId) => {
    // ngoId can come from oppData.ngoId (set by ngo.routes.js) or from the legacy second parameter
    const resolvedNgoId = oppData.ngoId || ngoId;
    if (!resolvedNgoId) throw new Error('ngoId is required to create an opportunity');

    const result = await pool.query(
        `INSERT INTO opportunities 
      (title, description, "requiredSkills", location, duration, status, "ngoId", "createdAt")
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
     RETURNING id, title, description, "requiredSkills", location, duration, status, "ngoId", "createdAt"`,
        [
            oppData.title,
            oppData.description,
            JSON.stringify(oppData.requiredSkills || oppData.tags || []),
            oppData.location,
            oppData.duration,
            (oppData.status || 'open').toLowerCase(),
            resolvedNgoId,
        ],
    )
    return result.rows[0]
}

const getOpportunities = async (filters = {}) => {
    let query = `
    SELECT o.*, u."organizationName" as "ngoName"
    FROM opportunities o
    JOIN users u ON o."ngoId" = u.id
    WHERE 1=1
  `
    const values = []
    let paramIdx = 1

    if (filters.ngoId) {
        query += ` AND o."ngoId" = $${paramIdx++}`
        values.push(filters.ngoId)
    }

    if (filters.status && filters.status.toLowerCase() !== 'all') {
        query += ` AND o.status = $${paramIdx++}`
        values.push(filters.status.toLowerCase())
    }

    if (filters.location) {
        query += ` AND o.location ILIKE $${paramIdx++}`
        values.push(`%${filters.location}%`)
    }

    if (filters.skill) {
        query += ` AND o."requiredSkills"::text ILIKE $${paramIdx++}`
        values.push(`%${filters.skill}%`)
    }

    query += ' ORDER BY o."createdAt" DESC'
    const result = await pool.query(query, values)
    return result.rows
}

const getOpportunityById = async (id) => {
    const result = await pool.query(
        'SELECT o.*, u."organizationName" as "ngoName", u.email as contactEmail FROM opportunities o JOIN users u ON o."ngoId" = u.id WHERE o.id = $1',
        [id],
    )
    return result.rows[0]
}

const updateOpportunity = async (id, oppData, ngoId) => {
    const result = await pool.query(
        `UPDATE opportunities
     SET title = COALESCE($1, title),
         description = COALESCE($2, description),
         "requiredSkills" = COALESCE($3, "requiredSkills"),
         duration = COALESCE($4, duration),
         location = COALESCE($5, location),
         status = COALESCE($6, status)
     WHERE id = $7 AND "ngoId" = $8
     RETURNING *`,
        [
            oppData.title,
            oppData.description,
            oppData.requiredSkills ? JSON.stringify(oppData.requiredSkills) : (oppData.tags ? JSON.stringify(oppData.tags) : null),
            oppData.duration,
            oppData.location,
            oppData.status ? oppData.status.toLowerCase() : null,
            id,
            ngoId,
        ],
    )
    return result.rows[0]
}

const deleteOpportunity = async (id, ngoId) => {
    const result = await pool.query(
        'DELETE FROM opportunities WHERE id = $1 AND "ngoId" = $2 RETURNING id',
        [id, ngoId],
    )
    return result.rowCount > 0
}

module.exports = {
    createOpportunity,
    getOpportunities,
    getOpportunityById,
    updateOpportunity,
    deleteOpportunity,
}
