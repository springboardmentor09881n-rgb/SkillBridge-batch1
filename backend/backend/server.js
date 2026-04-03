require('dotenv').config()
const express = require('express')
const http = require('http')
const socketIo = require('socket.io')
const pool = require('./src/config/db')
const cors = require('cors')
const { setIo } = require('./src/utils/socketHelper')

const authRoutes = require('./src/routes/auth.routes')
const ngoRoutes = require('./src/routes/ngo.routes')
const volunteerRoutes = require('./src/routes/volunteer.routes')
const notificationRoutes = require('./src/routes/notification.routes')
const chatRoutes = require('./src/routes/chat.routes')
const messageRoutes = require('./src/routes/message.routes')

// Public opportunities route (for browsing without auth)
const opportunityRoutes = require('./src/routes/opportunity.routes')

const app = express()
const server = http.createServer(app)
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5175"],
    methods: ["GET", "POST"]
  }
})
setIo(io)

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => res.send('SkillBridge API Running ✅'))

// Route registration
app.use('/api/auth', authRoutes)
app.use('/api/ngo', ngoRoutes)
app.use('/api/volunteer', volunteerRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/messages', messageRoutes)
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
const messageService = require('./src/services/messageService')
const notificationService = require('./src/services/notificationService')

io.on('connection', (socket) => {
  console.log('User connected:', socket.id)

  // Join a room for user-specific messaging
  socket.on('join', (userId) => {
    socket.join(Number(userId)) // Ensure numeric ID
    console.log(`User ${userId} joined room`)
  })

  // Handle sending message
  socket.on('sendMessage', async (data) => {
    const { senderId, receiverId, content, opportunityId } = data
    console.log(`[Socket] Sending message: ${senderId} -> ${receiverId} content: "${content.slice(0, 20)}..."`)
    
    try {
      // PERSIST: Save message to DB
      const result = await messageService.saveMessage({
        senderId,
        receiverId,
        content,
        opportunityId
      })

      // Emit to receiver's room
      const receiverRoom = Number(receiverId)
      io.to(receiverRoom).emit('receiveMessage', result)
      console.log(`[Socket] Emitted to room ${receiverRoom}`)

      // NOTIFY: Create a notification for the receiver
      const senderRes = await pool.query('SELECT "fullName", "organizationName" FROM users WHERE id = $1', [senderId]);
      const sender = senderRes.rows[0];
      const senderName = sender?.fullName || sender?.organizationName || 'Someone';

      await notificationService.createNotification(
        receiverId,
        'message',
        `New message from ${senderName}: "${content.slice(0, 40)}${content.length > 40 ? '...' : ''}"`,
        senderId
      );

      // Also emit back to sender for confirmation
      socket.emit('messageSent', result)
    } catch (err) {
      console.error('Socket messaging error:', err.message)
      socket.emit('error', { message: 'Could not send message' })
    }
  })

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
  })
})

