require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');

const pool = require('./src/config/db');

// 🔥 SOCKET.IO
const { Server } = require('socket.io');
const socketHandler = require('./src/sockets/socketHandler');

// ROUTES
const authRoutes = require('./src/routes/auth.routes');
const ngoRoutes = require('./src/routes/ngo.routes');
const volunteerRoutes = require('./src/routes/volunteer.routes');
const notificationRoutes = require('./src/routes/notification.routes');
const opportunityRoutes = require('./src/routes/opportunity.routes');

// ✅ NEW ROUTES (Milestone 4)
const messageRoutes = require('./src/routes/message.routes');
const matchRoutes = require('./src/routes/match.routes');

const app = express();
const server = http.createServer(app); // ✅ MOVE HERE

// 🔥 SOCKET INIT
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// ✅ VERY IMPORTANT (before routes use it)
app.set("io", io);

// 🔌 Attach socket handler
socketHandler(io);

// ===============================
// MIDDLEWARE
// ===============================
app.use(cors());
app.use(express.json());

// ===============================
// ROOT
// ===============================
app.get('/', (req, res) => res.send('SkillBridge API Running ✅'));

// ===============================
// 📌 ROUTES
// ===============================
app.use('/api/auth', authRoutes);
app.use('/api/ngo', ngoRoutes);
app.use('/api/volunteer', volunteerRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/opportunities', opportunityRoutes);

// ✅ Milestone 4
app.use('/api/messages', messageRoutes);
app.use('/api/match', matchRoutes);

// ===============================
// 🚀 START SERVER
// ===============================
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

// ===============================
// 🧪 DB CONNECTION CHECK
// ===============================
pool
    .query('SELECT NOW()')
    .then((result) => {
        console.log('✅ PostgreSQL connected! Time:', result.rows[0].now);
    })
    .catch((err) => {
        console.error('❌ Database connection error:', err.message);
    });