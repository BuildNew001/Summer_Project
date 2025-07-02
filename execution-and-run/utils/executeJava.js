const { execFile, spawn } = require('child_process')
const path = require('path')
const fs = require('fs')
const TIMEOUT = 5000

const executeJava = (filepath, inputPath) => {
  const jobDir = path.dirname(filepath)
  const mainClassName = path.basename(filepath, '.java')
  return new Promise((resolve, reject) => {
    execFile('javac', [filepath], (compileError, stdout, stderr) => {
      if (compileError) {
        return reject(
          new Error(`Compilation Error: ${stderr || compileError.message}`.trim())
        )
      }
      const runProcess = spawn('java', ['-cp', jobDir, mainClassName], {
        timeout: TIMEOUT,
      })
      let output = ''
      let errorOutput = ''

      runProcess.stdout.on('data', (data) => {
        output += data.toString()
      })

      runProcess.stderr.on('data', (data) => {
        errorOutput += data.toString()
      })

      runProcess.on('close', (code) => {
        if (errorOutput && !errorOutput.includes('Picked up _JAVA_OPTIONS')) {
          return reject(new Error(`Runtime Error: ${errorOutput}`))
        }
        resolve(output)
      })

      runProcess.on('error', (err) => {
        if (err.signal === 'SIGTERM') {
          return reject(new Error('Time Limit Exceeded'))
        }
        reject(new Error(`Runtime Error: ${err.message}`))
      })
      const inputStream = fs.createReadStream(inputPath)
      inputStream.pipe(runProcess.stdin)
    })
  })
}

module.exports = {
  executeJava,
}