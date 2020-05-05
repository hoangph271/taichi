const jwt = require('jsonwebtoken')

const JWT_SECRET = '(node_modules/supertest/lib/test.js:283:11)'

const signJwt = (payload) => {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, JWT_SECRET, (err, jwt) => {
      err ? reject(err) : resolve(jwt)
    })
  })
}

const verifyJwt = (payload) => {
  return new Promise((resolve, reject) => {
    jwt.verify(payload, JWT_SECRET, (err, decoded) => {
      err ? reject(err) : resolve(decoded)
    })
  })
}

module.exports = {
  signJwt,
  verifyJwt
}