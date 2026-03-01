const pool = require('../config/db')
const bcrypt = require('bcrypt')

const registerUser = async (user) => {
  const existing = await pool.query('SELECT id FROM users WHERE email=$1', [
    user.email,
  ])

  if (existing.rows.length > 0) throw new Error('Email already registered')

  const result = await pool.query(
    `INSERT INTO users
      (username, full_name, email, password, role, location, skills, organization_name, organization_description, website_url)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     RETURNING id, username, email, role`,
    [
      user.username,
      user.full_name,
      user.email,
      user.password,
      user.role,
      user.location,
      user.skills,
      user.organization_name,
      user.organization_description,
      user.website_url,
    ],
  )

  return result.rows[0]
}

const loginUser = async (email, password) => {
  const result = await pool.query(
    'SELECT id, username, email, password, role FROM users WHERE email=$1',
    [email],
  )

  if (result.rows.length === 0) throw new Error('User not found')

  const user = result.rows[0]

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) throw new Error('Incorrect password')

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
  }
}

module.exports = { registerUser, loginUser }
