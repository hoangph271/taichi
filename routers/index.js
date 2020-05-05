const { authRouter } = require('./auth-router')
const { filesRouter } = require('./files-router')
const { usersRouter } = require('./users-router')

module.exports = {
  authRouter,
  filesRouter,
  usersRouter,
}