const { MongoClient } = require('mongodb')
const { createApp } = require('./app')

const { PORT = 8080 } = process.env
const DB_URI = 'mongodb://tc:open_taichi@35.193.125.249/taichi_db'
const DB_NAME = 'taichi_db'

;(async () => {
  const client = await MongoClient.connect(DB_URI, { useUnifiedTopology: true })
  const db = client.db(DB_NAME)

  const app = await createApp({ db })

  app.listen(PORT, () => {
    console.info(`Started@${PORT}...!`)
  })
})()
