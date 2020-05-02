const { MongoClient } = require('mongodb')
const { createApp } = require('./app')

const PORT = 8080
const DB_URI = 'mongodb://localhost:27017/?readPreference=primary&ssl=false'
const DB_NAME = 'testTaichiDb'

;(async () => {
  const client = await MongoClient.connect(DB_URI, { useUnifiedTopology: true });
  const db = client.db(DB_NAME)

  const app = await createApp({ db })

  app.listen(PORT, () => {
    console.info(`Started@${PORT}...!`)
  })
})()
