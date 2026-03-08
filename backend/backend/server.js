require('dotenv').config()
const express = require('express')
const pool = require('./src/config/db')
const cors = require('cors')

const authRoutes = require('./src/routes/auth.routes')
const ngoRoutes = require('./src/routes/ngo.routes')
const volunteerRoutes = require('./src/routes/volunteer.routes')
const messageRoutes = require('./src/routes/message.routes')
const notificationRoutes = require('./src/routes/notification.routes')

// Public opportunities route (for browsing without auth)
const opportunityRoutes = require('./src/routes/opportunity.routes')

const app = express()

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => res.send('SkillBridge API Running ✅'))

// Route registration
app.use('/api/auth', authRoutes)
app.use('/api/ngo', ngoRoutes)
app.use('/api/volunteer', volunteerRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/opportunities', opportunityRoutes) // Public: GET all, GET by id

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`\n🚀 Server running on port ${PORT}`))

pool
  .query('SELECT NOW()')
  .then((result) => {
    console.log('✅ PostgreSQL connected! Time:', result.rows[0].now)
  })
  .catch((err) => {
    console.error('❌ Database connection error:', err.message)
  })

