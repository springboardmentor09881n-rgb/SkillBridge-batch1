const users = [] // in-memory array for now

const registerUser = async (userData) => {
  if (users.find((u) => u.email === userData.email))
    throw new Error('Email already registered')
  users.push(userData)
  return userData
}

const loginUser = async (email, password) => {
  const user = users.find((u) => u.email === email)
  if (!user) throw new Error('User not found')
  if (user.password !== password) throw new Error('Incorrect password')
  return user
}

module.exports = { registerUser, loginUser }
