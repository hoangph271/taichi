const { GridFSBucket, ObjectID } = require('mongodb')
const express = require('express')
const Busboy = require('busboy')
const _ = require('lodash')

const filesRouter = ({ db }) => {
  const router = express.Router()
  router.get('/:id', async (req, res) => {
    const _id = ObjectID(req.params.id)
    const isThumbnail = req.query.thumbnail

    const { range } = req.headers

    try {
      const file = await db.collection(isThumbnail ? 'mediaThumbnailBucket.files' : 'mediaBucket.files').findOne({ _id })

      if (_.isNil(file)) {
        res.sendStatus(404)
        return
      }

      const bucket = new GridFSBucket(db, { bucketName: isThumbnail ? 'mediaThumbnailBucket' : 'mediaBucket' })

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

        const ds = bucket.openDownloadStream(_id, { start, end: end + 1 })
        ds.once('error', () => { res.sendStatus(500) })
          .pipe(res)
      } else {
        res.writeHead(200, {
          'Content-Length': file.length,
          'Content-Disposition': `attachment; filename="${file.filename}"`,
          'Content-Type': (file.metadata || {}).mimeType || 'video/*',
        })

        bucket.openDownloadStream(_id)
          .once('error', () => { res.sendStatus(500) })
          .pipe(res)
      }
    } catch (error) {
      console.info(error)
      res.sendStatus(500)
    }
  })
  router.get('/', async (req, res) => {
    const files = await db.collection('mediaBucket.files').find().toArray()
    res.send(files)
  })
  router.post('/', async (req, res) => {
    const { headers } = req

    const busboy = new Busboy({ headers, limits: { files: 2 } })
    const _id = new ObjectID()
    let _filename;

    busboy
      .on('file', (fieldname, file, filename, encoding, mimeType) => {
        if (res.finished) {
          return file.resume()
        }

        if (_.isNil(_filename)) {
          res.status(400).send({ error: 'Invalid form field order...! :"{' })
          file.resume()
          return
        }

        if (fieldname === 'thumbnail') {
          const bucket = new GridFSBucket(db, { bucketName: 'mediaThumbnailBucket' })
          const uploadStream = bucket.openUploadStreamWithId(_id, filename, { metadata: { mimeType, encoding } })

          file.pipe(uploadStream)
          return
        }

        if (fieldname === 'file') {
          const bucket = new GridFSBucket(db, { bucketName: 'mediaBucket' })
          const uploadStream = bucket.openUploadStreamWithId(_id, filename, { metadata: { mimeType, encoding } })

          file.pipe(uploadStream)
          return
        }

        res.status(400).send({ error: 'Invalid file field...! :"{' })
        busboy.end()
      })
      .once('field', (fieldname, val) => {
        if (res.finished) return

        if (fieldname === 'filename') {
          _filename = val
        }
      })
      .once('finish', () => {
        if (res.finished) return

        res.sendStatus(201)
      })
      .on('error', (e) => {
        if (res.finished) return

        console.error(e)
        res.sendStatus(500)
      })

    req.pipe(busboy)
  })

  return router
}

module.exports = { filesRouter }
