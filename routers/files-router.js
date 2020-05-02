const { GridFSBucket, ObjectID } = require('mongodb')
const express = require('express')
const Busboy = require('busboy')
const _ = require('lodash')

const filesRouter = ({ db }) => {
  const router = express.Router()
  router.get('/:id', async (req, res) => {
    const _id = ObjectID(req.params.id)

    const { range } = req.headers

    try {
      const file = await db.collection('testBucket.files').findOne({ _id })

      if (_.isNil(file)) {
        res.sendStatus(404)
        return
      }

      const bucket = new GridFSBucket(db, { bucketName: 'testBucket' })

      if (range) {
        const parts = range.replace('bytes=', '').split('-')
        const start = parseInt(parts[0], 10)
        const end = parseInt(parts[1], 10) || (file.length - 1)
        const chunksize = (end - start) + 1

        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${file.length}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Disposition': `attachment; filename="${file.filename}"`,
          'Content-Type': (file.metadata || {}).mimeType || 'video/*',
        })

        bucket.openDownloadStream(_id, { start, end })
          .once('error', () => { res.sendStatus(500) })
          .pipe(res)
      } else {
        // res.writeHead(200, {
        //   'Content-Length': file.length,
        //   'Content-Disposition': `attachment; filename="${file.filename}"`,
        //   'Content-Type': (file.metadata || {}).mimeType || 'video/*',
        // })

        // bucket.openDownloadStream(_id)
        //   .once('error', () => { res.sendStatus(500) })
        //   .pipe(res)
      }
    } catch (error) {
      console.info(error)
      res.sendStatus(500)
    }
  })
  router.get('/', async (req, res) => {
    const files = await db.collection('testBucket.files').find().toArray()

    res.send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
      </head>
      <body>
        <h4>Home</h4>
        <form action="files" method="POST" enctype="multipart/form-data">
          <input type="file" name="upload" multiple accept="video/*">
          <button type="submit">Submit</button>
        </form>
        <div style="display: flex; flex-wrap: wrap; justify-content: space-evenly;">
          ${files.map(file => `<video style="width: 45%; height: 400px;" src="/files/${file._id}" autoplay controls></video>`).join('')}
        </div>
      </body>
    </html>`)
  })
  router.post('/', (req, res) => {
    const { headers } = req

    const busboy = new Busboy({ headers })

    busboy
      .on('file', (_, file, filename, __, mimeType) => {
        const bucket = new GridFSBucket(db, { bucketName: 'testBucket' })
        const uploadStream = bucket.openUploadStream(filename, { metadata: { mimeType } })

        file.pipe(uploadStream)
      })
      .once('finish', () => {
        res.redirect('/files')
      })

    req.pipe(busboy)
  })

  return router
}

module.exports = { filesRouter }
