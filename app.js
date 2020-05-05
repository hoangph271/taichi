const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')

const routers = require('./routers')

/**
 * @param {Object} db
 */
const createApp = async ({ db } = {}) => {
  const app = express()

  app.use(morgan('tiny'))
  app.use(bodyParser.json())
  app.use(cors())

  app.use('/auth', routers.authRouter({ db }))
  app.use('/users', routers.usersRouter({ db }))
  app.use('/files', routers.filesRouter({ db }))

  
  app.use(express.static('public'))

  return app
}

module.exports = { createApp }
