const { ObjectID } = require('mongodb')
const _ = require('lodash')
const { verifyJwt } = require('./jwt')

const authMiddleware = ({ db }) => {
  if (_.isNil(db)) {
    throw new Error('db NOT passed to middleware')
  }

  return async (req, res, next) => {
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
            res.sendStatus(401)
          } else {
            req.auth = { jwt, user }
            next()
          }
        } catch (error) {
          console.error(error)
          res.sendStatus(500)
        }
      })
      .catch(() => { res.sendStatus(403) })
  }
}

module.exports = {
  authMiddleware
}