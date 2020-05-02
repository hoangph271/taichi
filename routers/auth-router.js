const express = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const _ = require('lodash')

// const PWD_HASHES = 12
const JWT_SECRET = '(node_modules/supertest/lib/test.js:283:11)'

// TODO: Auto refresh jwt
// router.get('/', (req, res) => {
//   if (_.isNil(req.headers.authorization)) {
//     res.status(401).send({ error: 'JWT not found' })
//     return
//   }

//   // TODO: Validate & send refreshed JWT
// })
const authRouter = ({ db }) => {
  const router = express.Router()

  router.post('/', async (req, res) => {
    const { username, password } = req.body

    const user = await db.users.findOne({ username })

    if (_.isNil(user)) {
      res.status(404).send({ error: 'username not found' })
      return
    }

    const isValidLogin = await bcrypt.compare(password, user.password)

    if (isValidLogin) {
      jwt.sign({ username }, JWT_SECRET, (err, token) => {
        if (err) {
          res
            .status(500)
            .send({ error: 'server error' })
          return
        }

        res
          .status(201)
          .header('authorization', token)
          .send({ error: 'incorrect credentials' })
      })
    } else {
      res.status(401).send({ error: 'incorrect credentials' })
    }
  })

  return router
}

module.exports = { authRouter }
