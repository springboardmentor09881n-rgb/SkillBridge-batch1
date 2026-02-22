require('dotenv').config()
const express = require('express')
const pool = require('./src/config/db')
const cors = require('cors')

const authRoutes = require('./src/routes/auth.routes')

const app = express()

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => res.send('Backend Running'))

app.use('/api/auth', authRoutes)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))

pool
  .query('SELECT NOW()')
  .then((result) => {
    console.log('✅ PostgreSQL connected! Current time:', result.rows[0].now)
  })
  .catch((err) => {
    console.error('❌ Database connection error:', err.message)
  })
