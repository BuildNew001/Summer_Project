const { exec } = require('child_process')

const TIMEOUT = 5000

const executePy = (filepath, inputPath) => {
  return new Promise((resolve, reject) => {
    exec(
      `python "${filepath}" < "${inputPath}"`,
      { timeout: TIMEOUT },
      (error, stdout, stderr) => {
        if (error) {
          if (error.killed) {
            return reject(new Error('Time Limit Exceeded'))
          }
          return reject(new Error(`Runtime Error: ${stderr || error.message}`))
        }
        resolve(stdout)
      }
    )
  })
}

module.exports = {
  executePy,
}