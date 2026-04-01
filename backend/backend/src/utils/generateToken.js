const jwt = require('jsonwebtoken')

const generateToken = (userId, iam) => {
  return jwt.sign({ userId, iam }, process.env.JWT_SECRET, { expiresIn: '1h' })
}

module.exports = generateToken
