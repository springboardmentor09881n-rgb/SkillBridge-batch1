require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT
});

// Add message column to applications if missing, and opportunityId to messages if missing
async function migrate() {
    const queries = [
        // Add message to applications table
        `ALTER TABLE applications ADD COLUMN IF NOT EXISTS message TEXT DEFAULT ''`,
        // Add opportunityId to messages table (for conversations per opportunity)
        `ALTER TABLE messages ADD COLUMN IF NOT EXISTS "opportunityId" INTEGER REFERENCES opportunities(id) ON DELETE SET NULL`
    ];

    for (var i = 0; i < queries.length; i++) {
        try {
            await pool.query(queries[i]);
            console.log('OK: ' + queries[i].substring(0, 60));
        } catch (e) {
            console.log('SKIP: ' + e.message.substring(0, 80));
        }
    }

    // Verify final schema
    const cols = await pool.query(
        "SELECT table_name, column_name FROM information_schema.columns " +
        "WHERE table_name IN ('applications','messages') AND table_schema='public' " +
        "ORDER BY table_name, ordinal_position"
    );
    console.log('\n=== FINAL COLUMNS ===');
    cols.rows.forEach(function (r) { console.log('  ' + r.table_name + '.' + r.column_name); });

    pool.end();
}

migrate().catch(function (e) { console.error(e.message); pool.end(); });
