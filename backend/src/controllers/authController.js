const { registerUser, loginUser } = require('../services/authService')

const register = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      fullName,
      iam,
      location,
      skills,
      organizationName,
      organizationDescription,
      websiteUrl,
    } = req.body

    let user = { username, email, password, fullName, iam, location }

    if (iam === 'Volunteer') user.skills = skills || []
    if (iam === 'NGO') {
      user.organizationName = organizationName
      user.organizationDescription = organizationDescription
      user.websiteUrl = websiteUrl || null
    }

    const savedUser = await registerUser(user)
    res
      .status(201)
      .json({ message: 'Registration successful', user: savedUser })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await loginUser(email, password)
    res.status(200).json({ message: 'Login successful', user })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

module.exports = { register, login }
