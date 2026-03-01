const { Pool } = require('pg')

const pool = new Pool({
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  database: process.env.PG_DATABASE,
})

pool
  .query('SELECT NOW()')
  .then((res) => console.log('PostgreSQL connected:', res.rows[0]))
  .catch((err) => console.error('DB connection error:', err))

module.exports = pool
