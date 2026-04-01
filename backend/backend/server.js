require('dotenv').config()
const express = require('express')
const http = require('http')
const socketIo = require('socket.io')
const pool = require('./src/config/db')
const cors = require('cors')

const authRoutes = require('./src/routes/auth.routes')
const ngoRoutes = require('./src/routes/ngo.routes')
const volunteerRoutes = require('./src/routes/volunteer.routes')
const notificationRoutes = require('./src/routes/notification.routes')
const chatRoutes = require('./src/routes/chat.routes')

// Public opportunities route (for browsing without auth)
const opportunityRoutes = require('./src/routes/opportunity.routes')

const app = express()
const server = http.createServer(app)
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5175",
    methods: ["GET", "POST"]
  }
})

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => res.send('SkillBridge API Running ✅'))

// Route registration
app.use('/api/auth', authRoutes)
app.use('/api/ngo', ngoRoutes)
app.use('/api/volunteer', volunteerRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/opportunities', opportunityRoutes) // Public: GET all, GET by id

const PORT = process.env.PORT || 5000
server.listen(PORT, () => console.log(`\n🚀 Server running on port ${PORT}`))

pool
  .query('SELECT NOW()')
  .then((result) => {
    console.log('✅ PostgreSQL connected! Time:', result.rows[0].now)
  })
  .catch((err) => {
    console.error('❌ Database connection error:', err.message)
  })

// Socket.IO for real-time messaging
io.on('connection', (socket) => {
  console.log('User connected:', socket.id)

  // Join a room for user-specific messaging
  socket.on('join', (userId) => {
    socket.join(userId)
    console.log(`User ${userId} joined room`)
  })

  // Handle sending message
  socket.on('sendMessage', (data) => {
    const { senderId, receiverId, content, opportunityId } = data
    const message = {
      id: Date.now(),
      senderId,
      receiverId,
      content,
      createdAt: new Date(),
      opportunityId
    }

    // Emit to receiver's room
    io.to(receiverId).emit('receiveMessage', message)
    // Also emit back to sender for confirmation
    socket.emit('messageSent', message)
  })

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
  })
})

