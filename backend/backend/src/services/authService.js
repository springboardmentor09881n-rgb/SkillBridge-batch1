const pool = require('../config/db')
const bcrypt = require('bcrypt')
const messageService = require('./messageService')
const { sendSystemMessage } = require('./systemMessagingService')

const registerUser = async (user) => {
  const existing = await pool.query('SELECT id FROM users WHERE email=$1', [
    user.email,
  ])

  if (existing.rows.length > 0) throw new Error('Email already registered')

  const result = await pool.query(
    `INSERT INTO users
      (username, "fullName", email, password, iam, location, skills, bio, "organizationName", "organizationDescription", "websiteUrl")
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     RETURNING id, username, email, iam`,
    [
      user.username,
      user.fullName,
      user.email,
      user.password,
      user.iam,
      user.location,
      user.skills,
      user.bio,
      user.organizationName,
      user.organizationDescription,
      user.websiteUrl,
    ],
  )

  const savedUser = result.rows[0]

  // --- WELCOME MESSAGE LOGIC (System Message) ---
  try {
    const welcomeText = savedUser.iam === 'ngo'
      ? `Welcome to SkillBridge! We're excited to have your organization on board. Post your first opportunity now to start matching with our talented volunteers!`
      : `Welcome to SkillBridge! We're thrilled to have you join our community of volunteers. Complete your profile to see the best matches for your skills and start making an impact!`;

    await sendSystemMessage(savedUser.id, welcomeText);
  } catch (msgErr) {
    console.error('Error sending welcome message:', msgErr);
  }

  return savedUser
}

const loginUser = async (email, password) => {
  const result = await pool.query(
    `SELECT id, username, "fullName", email, password, iam, location, skills, bio,
            "organizationName", "organizationDescription", "websiteUrl"
     FROM users WHERE email=$1`,
    [email],
  )

  if (result.rows.length === 0) throw new Error('User not found')

  const user = result.rows[0]

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) throw new Error('Incorrect password')

  // Parse skills from JSONB/string to array
  let skills = user.skills
  if (typeof skills === 'string') {
    try { skills = JSON.parse(skills) } catch { skills = skills.split(',').map(s => s.trim()).filter(Boolean) }
  }
  if (!Array.isArray(skills)) skills = []

  return {
    id: user.id,
    username: user.username,
    fullName: user.fullName,
    email: user.email,
    iam: user.iam,
    location: user.location,
    skills,
    bio: user.bio,
    organizationName: user.organizationName,
    organizationDescription: user.organizationDescription,
    websiteUrl: user.websiteUrl,
  }
}

module.exports = { registerUser, loginUser }
