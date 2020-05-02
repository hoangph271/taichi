const crypto = require('crypto')
const request = require('supertest')
const { MongoClient, GridFSBucket } = require('mongodb')
const MemoryStream = require('memorystream')
const { MongoMemoryServer } = require('mongodb-memory-server')
const chai = require('chai')

const { createApp } = require('./app')

const uri = 'mongodb://localhost:27017/?readPreference=primary&ssl=false'
const _dbName = 'testTaichiDb'
let db;

chai.use(require('chai-as-promised'))
const { expect } = chai

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

beforeEach(async () => {
  const client = await MongoClient.connect(uri, { useUnifiedTopology: true });
  db = client.db(_dbName)
})

const users = {
  valid: { username: 'user@name', password: 'pass@word' },
  invalid: { username: 'user@name', password: 'p@ssword' },
}
const files = [
  { id: '5ea7374556d00593e32b211f', user: users.valid.username, title: 'OK.txt' },
  { id: '5ea737c26d4699fe165c0cdf', user: users.invalid.username, title: 'NOT.txt' },
]


// FIXME: API tests broken
// const db = (() => {
//   return {
//     users: {
//       async findOne ({ username }) {
//         await delay(Math.random() * 100)
    
//         if (username === users.valid.username) {
//           return {
//             username,
//             password: '$2a$12$Yv.sw1n/eMKBvvbkw9lxnuPuygJcW4Zk8wqGKmo9./jexLY2HayXK',
//           }
//         }
//       },
//     },
//     files: {
//       async findOne({ id }) {
//         return files[id]
//       }
//     }
//   }
// })()

const PORT = 8081

describe('Initialize app', function () {
  const app = createApp()
  let startedApp;

  it('Should start properly', function (done) {
    startedApp = app.listen(PORT, () => {
      done()
    })
  })

  it('Should end properly', function (done) {
    startedApp.close(() => {
      done()
    })
  })
})

describe('Auth API', function () {
  const app = createApp({ db })

  it('Should return 401 for POST with invalid credentials', function (done) {
    request(app)
      .post('/auth')
      .send(users.invalid)
      .expect('Content-Type', /json/)
      .expect(401)
      .end((err) => {
        if (err) throw err

        done()
      })
  })
  it('Should return 201 for POST with valid credentials', function (done) {
    request(app)
      .post('/auth')
      .send(users.valid)
      .expect('Content-Type', /json/)
      .expect('authorization', /./)
      .expect(201)
      .end((err) => {
        if (err) throw err

        done()
      })
  })
})

describe('DB connecting', function () {
  let mongoClient, server, url

  this.beforeEach(async () => {
    server = new MongoMemoryServer()
    url = await server.getConnectionString()
  })

  it('Should connect to DB', function (done) {
    MongoClient.connect(url, { useUnifiedTopology: true })
      .then(mC => {
        expect(mC).to.be.an('Object')
        mongoClient = mC
        done()
      })
  })
  it('Should close DB properly', function (done) {
    mongoClient.close(() => {
      done()
    })
  })
})

describe.only('GridFS ussages', function () {
  it('Should create new bucket properly', function () {
    const bucket = new GridFSBucket(db)
    expect(bucket).to.be.an('Object')
  })
  it('Should upload new binary to bucket', function (done) {
    const memoryStream = new MemoryStream()
    const bucket = new GridFSBucket(db, { bucketName: 'testBucket' })
    const uploadStream = bucket.openUploadStream('file.name')

    expect(uploadStream).to.be.an('Object')

    uploadStream
      .once('finish', async (file) => {
        const { md5 } = file

        const hash = crypto.createHash('md5')
        hash.update('uploadStream')
        expect(md5).to.be.equal(hash.digest('hex'))

        done()
      })

    memoryStream.pipe(uploadStream)
    memoryStream.end('uploadStream')
  })
})
