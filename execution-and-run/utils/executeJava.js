const { exec } = require('child_process')
const path = require('path')

const TIMEOUT = 5000

const executeJava = (filepath, inputPath) => {
  const jobDir = path.dirname(filepath)
  const mainClassName = path.basename(filepath, '.java')
  return new Promise((resolve, reject) => {
    exec(`javac "${filepath}"`, (compileError, stdout, stderr) => {
      if (compileError) {
        return reject(
          new Error(`Compilation Error: ${stderr || compileError.message}`.trim())
        )
      }
      exec(
        `java -cp "${jobDir}" ${mainClassName} < "${inputPath}"`,
        { timeout: TIMEOUT },
        (runError, runStdout, runStderr) => {
          if (runError) {
            if (runError.killed) {
              return reject(new Error('Time Limit Exceeded'))
            }
            return reject(
              new Error(`Runtime Error: ${runStderr || runError.message}`)
            )
          }
          resolve(runStdout)
        }
      )
    })
  })
}

module.exports = {
  executeJava,
}