require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
});

const schema = `

-- ===============================
-- DROP TABLES (ORDER MATTERS)
-- ===============================
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS match_interactions;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS conversations;
DROP TABLE IF EXISTS applications;
DROP TABLE IF EXISTS opportunities;
DROP TABLE IF EXISTS users;

-- ===============================
-- USERS
-- ===============================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    "fullName" VARCHAR(150) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    iam VARCHAR(20) NOT NULL CHECK (iam IN ('volunteer', 'ngo')),
    skills JSONB DEFAULT '[]',
    location VARCHAR(100),
    bio TEXT,
    "organizationName" VARCHAR(255),
    "organizationDescription" TEXT,
    "websiteUrl" VARCHAR(255),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===============================
-- OPPORTUNITIES
-- ===============================
CREATE TABLE opportunities (
    id SERIAL PRIMARY KEY,
    "ngoId" INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    "requiredSkills" JSONB DEFAULT '[]',
    duration VARCHAR(100),
    location VARCHAR(100),
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'closed')),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===============================
-- APPLICATIONS
-- ===============================
CREATE TABLE applications (
    id SERIAL PRIMARY KEY,
    "opportunityId" INTEGER REFERENCES opportunities(id) ON DELETE CASCADE,
    "volunteerId" INTEGER REFERENCES users(id) ON DELETE CASCADE,
    message TEXT DEFAULT '',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===============================
-- CONVERSATIONS
-- ===============================
CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    user1_id INT NOT NULL,
    user2_id INT NOT NULL,
    opportunity_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE,

    CONSTRAINT unique_conversation UNIQUE (user1_id, user2_id, opportunity_id),
    CONSTRAINT check_user_order CHECK (user1_id < user2_id)
);

-- ===============================
-- MESSAGES
-- ===============================
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    conversation_id INT NOT NULL,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_messages_conversation_time
ON messages(conversation_id, created_at);

-- ===============================
-- MATCH INTERACTIONS
-- ===============================
CREATE TABLE match_interactions (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    opportunity_id INT NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('viewed', 'applied', 'ignored')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE,

    CONSTRAINT unique_user_opportunity UNIQUE (user_id, opportunity_id)
);

-- ===============================
-- NOTIFICATIONS
-- ===============================
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    reference_id INT,
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_notifications_user
ON notifications(user_id);

`;

pool.query(schema)
    .then(() => {
        console.log("✅ Database schema created successfully!");
        process.exit(0);
    })
    .catch((err) => {
        console.error("❌ Error creating schema:", err);
        process.exit(1);
    });