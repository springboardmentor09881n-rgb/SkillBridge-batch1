const pool = require('../config/db');

exports.getMatches = async (userId) => {

    const userResult = await pool.query(
        `SELECT id, iam, skills, location FROM users WHERE id = $1`,
        [userId]
    );

    const currentUser = userResult.rows[0];
    if (!currentUser) return [];

    const { iam, skills = [], location } = currentUser;

    // ─────────────────────────────────────────────────────────────
    // VOLUNTEER → SHOW OPPORTUNITIES
    // ─────────────────────────────────────────────────────────────
    if (iam === 'volunteer') {

        const result = await pool.query(
            `SELECT 
                o.id,
                o.title,
                o.location,
                o."ngoId",
                o."requiredSkills" AS requiredskills,
                u."organizationName"
             FROM opportunities o
             JOIN users u ON o."ngoId" = u.id
             WHERE o.status = 'open'
             AND o."ngoId" != $1`,
            [userId]
        );

        const matches = result.rows.map(op => {

            const requiredSkills = op.requiredskills || [];
            const total = requiredSkills.length;

            let matched = 0;
            requiredSkills.forEach(skill => {
                if (skills.includes(skill)) matched++;
            });

            const skillScore = total > 0
                ? Math.round((matched / total) * 90)
                : 0;

            const locationScore = (
                location &&
                op.location &&
                location.toLowerCase().trim() === op.location.toLowerCase().trim()
            ) ? 10 : 0;

            const score = Math.min(skillScore + locationScore, 100);

            return {
                ...op,
                match_score: score
            };
        });

        return matches.sort((a, b) => b.match_score - a.match_score);
    }

    // ─────────────────────────────────────────────────────────────
    // NGO → SHOW VOLUNTEERS
    // ─────────────────────────────────────────────────────────────
    if (iam === 'ngo') {

        const oppResult = await pool.query(
            `SELECT 
                id,
                title,
                location,
                "requiredSkills" AS requiredskills
             FROM opportunities
             WHERE "ngoId" = $1 AND status = 'open'`,
            [userId]
        );

        const ngoOpportunities = oppResult.rows;
        if (ngoOpportunities.length === 0) return [];

        const volunteersResult = await pool.query(
            `SELECT id, "fullName", skills, location FROM users WHERE iam = 'volunteer'`
        );

        const matches = volunteersResult.rows.map(vol => {

            let bestScore = 0;
            let bestOpportunity = null;

            ngoOpportunities.forEach(opp => {

                const requiredSkills = opp.requiredskills || [];
                const total = requiredSkills.length;

                let matched = 0;
                requiredSkills.forEach(skill => {
                    if (vol.skills?.includes(skill)) matched++;
                });

                const skillScore = total > 0
                    ? Math.round((matched / total) * 90)
                    : 0;

                const locationScore = (
                    opp.location &&
                    vol.location &&
                    opp.location.toLowerCase().trim() === vol.location.toLowerCase().trim()
                ) ? 10 : 0;

                const score = Math.min(skillScore + locationScore, 100);

                if (score > bestScore) {
                    bestScore = score;
                    bestOpportunity = {
                        id: opp.id,
                        title: opp.title
                    };
                }
            });

            return {
                ...vol,
                match_score: bestScore,
                matchedOpportunity: bestOpportunity
            };
        });

        return matches
            .filter(v => v.match_score > 0)
            .sort((a, b) => b.match_score - a.match_score);
    }

    return [];
};

exports.recordInteraction = async (userId, opportunityId, action) => {
    const allowedActions = ['viewed', 'applied', 'ignored'];
    if (!allowedActions.includes(action)) throw new Error('Invalid action');

    await pool.query(
        `INSERT INTO match_interactions (user_id, opportunity_id, action)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id, opportunity_id)
         DO UPDATE SET action = EXCLUDED.action`,
        [userId, opportunityId, action]
    );
};