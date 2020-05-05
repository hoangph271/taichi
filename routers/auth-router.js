const express = require('express')
const bcrypt = require('bcryptjs')
const _ = require('lodash')
const { signJwt } = require('../utils/jwt')

// TODO: Auto refresh jwt

const authRouter = ({ db }) => {
  const router = express.Router()

  router.post('/', async (req, res) => {
    const { username, password } = req.body

    const user = await db.collection('users').findOne({ username })

    if (_.isNil(user)) {
      res.status(404).send({ error: 'username not found' })
      return
    }

    const isValidLogin = await bcrypt.compare(password, user.password)

    if (isValidLogin) {
      const jwt = await signJwt({ username, _id: user._id })

      res
      .status(201)
      .send({ username, jwt })
    } else {
      res.status(401).send({ error: 'incorrect credentials' })
    }
  })

  return router
}

module.exports = { authRouter }
