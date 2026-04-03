# SkillBridge

SkillBridge is a full-stack web platform that connects NGOs with volunteers.

- NGOs can create and manage opportunities
- Volunteers can discover opportunities and apply
- NGOs can review applications and accept/reject volunteers
- Both roles receive in-app notifications for key events

## Tech Stack

### Frontend
- React (Vite)
- React Router
- Lucide icons
- Tailwind CSS
- Framer Motion

### Backend
- Node.js & Express
- PostgreSQL
- JWT-based auth
- Bcrypt

### AI Service
- Flask
- scikit-learn
- NumPy

## Project Structure

```text
SkillBridge-batch1/
|-- ai-service/
|   |-- app.py
|-- backend/
|   |-- backend/
|   |   |-- src/
|   |   |   |-- controllers/
|   |   |   |-- routes/
|   |   |   |-- services/
|   |   |   |-- config/
|   |   |-- server.js
|   |   |-- package.json
|-- frontend/
|   |-- src/
|   |-- package.json
|-- README.md
```

## Milestone Coverage

### Milestone 1: Foundation and Authentication

- Role-based authentication (Volunteer and NGO)
- JWT login/session flow
- Basic dashboard structure for both roles
- Core profile data setup and retrieval

### Milestone 2: Profile and Dashboard Experience

- Volunteer profile edit (name, bio, location, skills)
- NGO profile edit (organization name, description, website)
- Profile photo upload and remove flow
- Dashboard cards and summary data for both roles
- Header, sidebar, and navigation consistency improvements

### Milestone 3: Opportunities, Applications, and Notifications

- Opportunity CRUD (create, list, update, delete with owner checks)
- Search and filtering (skills, location, duration, status, keyword)
- Application system:
  - Apply with message
  - Duplicate-apply prevention
  - NGO accept/reject flow
  - Volunteer and NGO application stats
- Notifications:
  - User-targeted notifications via `user_id`
  - Broadcast notifications for all volunteers on new opportunity and status change
  - Correct notification click routing to relevant pages
- Safe cascade delete on opportunity removal:
  - Delete related applications
  - Notify affected volunteers
  - Clean stale opportunity notifications

### Milestone 4: Communication, Matching & UI Excellence

- **Real-Time Communication:** Implementation of a WebSocket-based messaging platform between Volunteers and NGOs with full history retrieval.
- **Smart Match Suggestions:** Developed an automated scoring algorithm to suggest the best opportunities to volunteers based on profile data (skills, location).
- **Responsive Navigation:** Optimized mobile Chat Workspace with intuitive back-navigation and slide-out layouts.

## Prerequisites

- Node.js 18+
- npm
- PostgreSQL
- Python 3.10+ (for AI service)

## Local Setup

### 1) Clone

```bash
git clone https://github.com/your-repo/SkillBridge-batch1.git
cd SkillBridge-batch1
```

### 2) Backend Setup

```bash
cd backend/backend
npm install
# Set up .env file with database config
node create_schema.js
npm run dev
```

Backend runs at: `http://127.0.0.1:3000`

### Frontend Setup
1. Navigate to `frontend`
2. Run `npm install`
3. Start development server: `npm run dev`

## 🔑 Sample Test Accounts (Development)

Use these credentials to explore the platform locally:

| Role | Email | Password |
| :--- | :--- | :--- |
| **NGO** | `help@ngo.com` | `ngo123` |
| **Volunteer** | `dheeraj@gmail.com` | `12345` |

---
*Note: These accounts are for development and local testing purposes only.*

## 🧪 Testing

1. Backend tests: `npm test` from `backend/backend` (add tests in `tests/` if needed).
2. Frontend checks: `npm run lint` and `npm run test` from `frontend`.

## 🤝 Contributing

- Fork the repository.
- Create a feature branch (`git checkout -b feature/<name>`).
- Commit changes with clear messages.
- Open a pull request for review.

## 📄 License

This project is licensed under the MIT License. See `LICENSE` for details.
