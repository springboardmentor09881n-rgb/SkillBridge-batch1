# Backend Service

This is the backend component of SkillBridge, providing the API server for the platform.

## Overview

The backend is built with Node.js and Express, using PostgreSQL as the database. It handles authentication, opportunity management, applications, and more.

## Features

- **Authentication**: JWT-based user authentication for volunteers and NGOs.
- **Opportunity Management**: CRUD operations for volunteer opportunities.
- **Application Handling**: Manage volunteer applications.
- **Dashboard Services**: Provide data for user dashboards.
- **Notifications**: Handle notification services.

## Tech Stack

- **Node.js & Express**: Server-side framework.
- **PostgreSQL**: Relational database.
- **JWT**: Authentication tokens.
- **Bcrypt**: Password hashing.

## Project Structure

```
backend/
├── src/
│   ├── config/         # Database configuration
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Authentication middleware
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   └── utils/          # Utility functions
├── package.json        # Dependencies
├── server.js           # Main server file
└── create_schema.js    # Database schema setup
```

## Running the Server

1. Install dependencies: `npm install`
2. Set up database and run schema: `node create_schema.js`
3. Start the server: `node server.js`

The server will start on port 3000 by default.