require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
});

const ddl = `
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS applications;
DROP TABLE IF EXISTS opportunities;
DROP TABLE IF EXISTS users;

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
    "createdAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE opportunities (
    id SERIAL PRIMARY KEY,
    "ngoId" INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    "requiredSkills" JSONB DEFAULT '[]',
    duration VARCHAR(100),
    location VARCHAR(100),
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'closed')),
    "createdAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE applications (
    id SERIAL PRIMARY KEY,
    "opportunityId" INTEGER REFERENCES opportunities(id) ON DELETE CASCADE,
    "volunteerId" INTEGER REFERENCES users(id) ON DELETE CASCADE,
    message TEXT DEFAULT '',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    "createdAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    "senderId" INTEGER REFERENCES users(id) ON DELETE CASCADE,
    "receiverId" INTEGER REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    "isRead" BOOLEAN DEFAULT FALSE,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

pool.query(ddl)
    .then(() => {
        console.log("Tables created successfully.");
        process.exit(0);
    })
    .catch((err) => {
        console.error("Error creating tables:", err);
        process.exit(1);
    });
