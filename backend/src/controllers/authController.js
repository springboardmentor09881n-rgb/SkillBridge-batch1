const { registerUser, loginUser } = require('../services/authService')
const bcrypt = require('bcrypt')
const generateToken = require('../utils/generateToken')
const pool = require('../config/db')

// REGISTER
const register = async (req, res) => {
  try {
    const {
      username,
      full_name,
      email,
      password,
      role,
      location,
      skills,
      organization_name,
      organization_description,
      website_url,
    } = req.body

    if (!role) return res.status(400).json({ message: 'Role is required' })

    const roleLower = role.toLowerCase()

    if (!['volunteer', 'ngo/organization'].includes(roleLower))
      return res.status(400).json({ message: 'Invalid role' })

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = {
      username,
      full_name,
      email,
      password: hashedPassword,
      role: roleLower,
      location: location || null,
      skills: skills || null,
      organization_name: organization_name || null,
      organization_description: organization_description || null,
      website_url: website_url || null,
    }

    const savedUser = await registerUser(user)
    const token = generateToken(savedUser.id, savedUser.role)

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: { user: savedUser, token },
    })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
}

// LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await loginUser(email, password)
    const token = generateToken(user.id, user.role)

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: { user, token },
    })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
}

// PROFILE
const getProfile = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, username, full_name, email, role, location, skills,
              organization_name, organization_description, website_url
       FROM users
       WHERE id=$1`,
      [req.user.userId],
    )

    if (result.rows.length === 0)
      return res.status(404).json({ message: 'User not found' })

    res.json({ success: true, user: result.rows[0] })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = { register, login, getProfile }
