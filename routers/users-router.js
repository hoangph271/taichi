const { ObjectID } = require('mongodb')
const express = require('express')
const _ = require('lodash')
const { authMiddleware } = require('../utils/auth-middleware')

const usersRouter = ({ db }) => {
  const router = express.Router()

  router.use(authMiddleware({ db }))

  router.get('/', async (req, res) => {
    try {
      const _id = new ObjectID(req.auth.user._id)
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

  return router
}

module.exports = { usersRouter }
