const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

const { authRouter, filesRouter } = require('./routers')

/**
 * @param {Object} db: 
 */
const createApp = async ({ db } = {}) => {
  const app = express()

  app.use(bodyParser.json())
  app.use(cors())

  // app.use(appendJwt)
  // FIXME: Not using db like this...!
  app.use('/auth', authRouter({ db }))
  app.use('/files', filesRouter({ db }))

  app.use(express.static('public'))

  return app
}

module.exports = { createApp }
