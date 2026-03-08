# SkillBridge

SkillBridge is a robust platform designed to bridge the gap between passionate volunteers and Non-Governmental Organizations (NGOs). It facilitates seamless opportunity discovery, application management, and collaboration to drive social impact.

## 🚀 Key Features

### For Volunteers
- **Personalized Dashboard**: View recommended opportunities, application status, and upcoming tasks.
- **Opportunity Discovery**: Browse and filter volunteer openings based on skills, location, and interests.
- **Application Tracking**: Manage and monitor the status of all submitted volunteer applications.
- **Profile Management**: Showcase skills, experience, and availability to NGOs.
- **Direct Messaging**: Communicate with NGOs regarding specific opportunities.

### For NGOs
- **Organization Dashboard**: Overview of posted opportunities, active applications, and volunteer stats.
- **Opportunity Management**: Create, edit, and manage volunteer listings with ease.
- **Applicant Review**: Access and review volunteer profiles to find the best fit for your projects.
- **Notification System**: Receive real-time alerts for new applications and messages.
- **Messaging Integration**: Streamlined communication with potential and active volunteers.

## 🛠️ Technology Stack

### Frontend
- **React (Vite)**: For a fast, responsive, and modern user interface.
- **Framer Motion**: Delivering smooth and premium micro-animations.
- **Tailwind CSS**: Utility-first styling for a polished and consistent design.
- **React Router**: Seamless navigation and client-side routing.
- **Lucide React**: Beautiful and descriptive iconography.

### Backend
- **Node.js & Express**: Scalable and efficient server-side architecture.
- **PostgreSQL**: Reliable relational database for managing users and opportunities.
- **JWT (JSON Web Tokens)**: Secure and stateless authentication.
- **Bcrypt**: Robust password hashing for user data protection.
- **dotenv**: Secure environment-based configuration.

## 📁 Project Structure

```text
SkillBridge/
├── frontend/           # React application (Vite-based)
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Dashboard, Auth, Home, and Profile views
│   │   └── services/   # Frontend API services
├── backend/            # Express.js server
│   └── backend/
│       └── src/
│           ├── controllers/ # Request handling logic
│           ├── routes/      # API endpoint definitions
│           ├── services/    # Business logic and DB interactions
│           └── config/      # Database and environment setup
```

## ⚙️ Setup and Installation

### Prerequisites
- Node.js (v18+)
- PostgreSQL

### Backend Setup
1. Navigate to `backend/backend`
2. Run `npm install`
3. Create a `.env` file based on `.env.example`
4. Run `node create_schema.js` to initialize the database
5. Start server: `npm run dev`

### Frontend Setup
1. Navigate to `frontend`
2. Run `npm install`
3. Start development server: `npm run dev`

