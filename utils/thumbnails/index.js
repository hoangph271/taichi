import fs from 'fs'
import path, { dirname } from 'path'
import { exec } from 'child_process'
// import thumb from 'video-thumbnail'
import { fileURLToPath } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url))

const files = fs.readdirSync(path.join(__dirname, 'test-data', 'input'))
// const files = ['bad_name.mp4']

  ; (async () => {
    for (const file of files) {
      const input = path.join(__dirname, 'test-data', 'input', file)
      const output = path.join(__dirname, 'test-data', 'output', `${file}.output.gif`)

      const cmd = `ffmpeg -i ${input} -t 15 -vf scale=320:240 -crf 20 -b 800k ${output} -y`

      await new Promise((resolve, reject) => {
        exec(cmd, (err, stdout) => {
          if (err) {
            console.error(`:"{ ${file}`)
            // reject(err)
            resolve(output)
          } else {
            resolve(output)
            console.info(file)
          }
        })
      })
    }
  })()
