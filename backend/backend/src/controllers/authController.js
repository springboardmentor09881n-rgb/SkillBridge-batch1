const { registerUser, loginUser } = require('../services/authService')
const bcrypt = require('bcrypt')
const generateToken = require('../utils/generateToken')
const pool = require('../config/db')

// REGISTER
const register = async (req, res) => {
  try {
    let {
      username,
      fullName,
      email,
      password,
      iam,
      location,
      skills,
      bio,
      organizationName,
      organizationDescription,
      websiteUrl,
    } = req.body

    if (!iam) return res.status(400).json({ message: 'Role (iam) is required' })

    let iamLower = iam.toLowerCase()

    // Map 'ngo/organization' or similar to 'ngo'
    if (iamLower.includes('ngo')) {
      iamLower = 'ngo'
    } else if (iamLower.includes('volunteer')) {
      iamLower = 'volunteer'
    }

    if (!['volunteer', 'ngo'].includes(iamLower))
      return res.status(400).json({ message: 'Invalid role' })

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = {
      username,
      fullName,
      email,
      password: hashedPassword,
      iam: iamLower,
      location: location || null,
      skills: Array.isArray(skills) 
        ? JSON.stringify(skills.map(s => s.toLowerCase().trim())) 
        : (skills ? JSON.stringify(skills.split(',').map(s => s.toLowerCase().trim()).filter(Boolean)) : '[]'),
      bio: bio || null,
      organizationName: organizationName || null,
      organizationDescription: organizationDescription || null,
      websiteUrl: websiteUrl || null,
    }

    const savedUser = await registerUser(user)
    const token = generateToken(savedUser.id, savedUser.iam)

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
    const token = generateToken(user.id, user.iam)

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
      `SELECT id, username, "fullName", email, iam, location, skills, bio,
              "organizationName", "organizationDescription", "websiteUrl"
       FROM users
       WHERE id=$1`,
      [req.user.userId],
    )

    if (result.rows.length === 0)
      return res.status(404).json({ message: 'User not found' })

    res.json({ success: true, data: result.rows[0] })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// UPDATE PROFILE
const updateProfile = async (req, res) => {
  try {
    const {
      fullName,
      location,
      skills,
      bio,
      organizationName,
      organizationDescription,
      websiteUrl,
    } = req.body

    // Only format skills if they were actually provided in the request
    const formattedSkills = skills !== undefined
      ? (Array.isArray(skills)
        ? JSON.stringify(skills.map(s => s.toLowerCase().trim()))
        : (skills ? JSON.stringify(skills.split(',').map(s => s.toLowerCase().trim()).filter(Boolean)) : '[]'))
      : null;

    const result = await pool.query(
      `UPDATE users
       SET "fullName" = COALESCE($1, "fullName"),
           location = COALESCE($2, location),
           skills = COALESCE($3, skills),
           bio = COALESCE($4, bio),
           "organizationName" = COALESCE($5, "organizationName"),
           "organizationDescription" = COALESCE($6, "organizationDescription"),
           "websiteUrl" = COALESCE($7, "websiteUrl")
       WHERE id = $8
       RETURNING id, username, "fullName", email, iam, location, skills, bio, "organizationName", "organizationDescription", "websiteUrl"`,
      [
        fullName,
        location,
        formattedSkills,
        bio,
        organizationName,
        organizationDescription,
        websiteUrl,
        req.user.userId,
      ],
    )

    if (result.rows.length === 0)
      return res.status(404).json({ message: 'User not found' })

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: result.rows[0],
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

module.exports = { register, login, getProfile, updateProfile }
