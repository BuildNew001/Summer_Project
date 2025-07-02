const { spawn } = require('child_process')
const fs = require('fs')

const TIMEOUT = 5000

const executePy = (filepath, inputPath) => {
  return new Promise((resolve, reject) => {
    const pyProcess = spawn('python3', [filepath], { timeout: TIMEOUT })

    let output = ''
    let errorOutput = ''

    pyProcess.stdout.on('data', (data) => {
      output += data.toString()
    })

    pyProcess.stderr.on('data', (data) => {
      errorOutput += data.toString()
    })

    pyProcess.on('close', (code) => {
      if (errorOutput) {
        return reject(new Error(`Runtime Error: ${errorOutput}`))
      }
      resolve(output)
    })

    pyProcess.on('error', (err) => {
      if (err.signal === 'SIGTERM') {
        return reject(new Error('Time Limit Exceeded'))
      }
      reject(new Error(`Runtime Error: ${err.message}`))
    })

    const inputStream = fs.createReadStream(inputPath)
    inputStream.pipe(pyProcess.stdin)
  })
}

module.exports = {
  executePy,
}