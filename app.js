const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')

const { authRouter, filesRouter } = require('./routers')

/**
 * @param {Object} db
 */
const createApp = async ({ db } = {}) => {
  const app = express()

  app.use(morgan('tiny'))
  app.use(bodyParser.json())
  app.use(cors())

  // app.use(appendJwt) // FIXME: What is this...?
  app.use('/auth', authRouter({ db }))
  app.use('/files', filesRouter({ db }))

  
  app.use(express.static('public'))

  return app
}

module.exports = { createApp }
