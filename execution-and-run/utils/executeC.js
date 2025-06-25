const { exec } = require('child_process')
const path = require('path')

const TIMEOUT = 5000

const executeC = (filepath, inputPath) => {
  const jobDir = path.dirname(filepath)
  const outPath = path.join(jobDir, 'a.exe')
  return new Promise((resolve, reject) => {
    exec(
      `gcc "${filepath}" -o "${outPath}"`,
      (compileError, stdout, stderr) => {
        if (compileError) {
          return reject(
            new Error(
              `Compilation Error: ${stderr || compileError.message}`.trim()
            )
          )
        }
        exec(
          `"${outPath}" < "${inputPath}"`,
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
      }
    )
  })
}

module.exports = {
  executeC,
}