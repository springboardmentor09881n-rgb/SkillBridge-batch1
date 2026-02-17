# SkillBridge-batch1
PostgreSQL configuration and schema management for authentication service.

## Schema
users(id, username, email, password, role, location, skills, organization_name, organization_description, website_url, created_at)

## Features
- Secure password storage
- Unique email enforcement
- Connection pooling via pg
- Environment-based configuration

## Run
1. Create database
2. Configure .env
3. Start backend server

## Sample Test Accounts (Development Only)

To test authentication module, use the following demo credentials:

### NGO User
- Email: help@ngo.com
- Password: ngo123
- Role: ngo

### Volunteer User
- Email: dheeraj@gmail.com
- Password: 12345
- Role: volunteer


These accounts are intended for local development testing only.
