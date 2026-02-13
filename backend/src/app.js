const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { Pool } = require('pg');
const authRoutes = require('./routes/auth');

const app = express();

// Debug environment variables
console.log('DB ENV:',
  process.env.PG_USER,
  process.env.PG_PASSWORD,
  process.env.PG_DATABASE,
  process.env.PG_HOST,
  process.env.PG_PORT
);

// PostgreSQL connection configuration
const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: parseInt(process.env.PG_PORT) || 5432,
});

// Test DB connection
pool.query('SELECT NOW()')
  .then(res => {
    console.log('PostgreSQL connected:', res.rows);
  })
  .catch(err => {
    console.error('Database connection error:', err.message);
  });

app.use(cors());
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.send('Backend Running');
});

// Auth routes
app.use('/api/auth', authRoutes);

// DB test route
app.get('/api/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ connected: true, time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ connected: false, error: err.message });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
