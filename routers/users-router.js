const { ObjectID } = require('mongodb')
const express = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const _ = require('lodash')
const { verifyJwt } = require('../utils/jwt')

const usersRouter = ({ db }) => {
  const router = express.Router()

  router.get('/', async (req, res) => {
    const { authorization } = req.headers
    if (_.isNil(authorization)) {
      res.sendStatus(401);
      return
    }

    const jwt = authorization.slice('Bearer '.length)

    await verifyJwt(jwt)
      .then(async (payload) => {
        try {
          const _id = new ObjectID(payload._id)
          const user = await db.collection('users').findOne({ _id })

          if (_.isNil(user)) {
            res.sendStatus(404)
          } else {
            res.send(user)
          }
        } catch (error) {
          res.sendStatus(500)
        }
      })
      .catch(() => { res.sendStatus(403) })
  })

  return router
}

module.exports = { usersRouter }
