const { exec } = require('child_process')
const fs = require('fs').promises
const path = require('path')
const os = require('os')
const { v4: uuid } = require('uuid')
const TIMEOUT = 5000
const tempDir = path.join(os.tmpdir(), 'online-compiler')
const setup = async () => {
  try {
    await fs.mkdir(tempDir, { recursive: true })
    console.log('Cleaning up temporary job directories...')
    const jobDirs = await fs.readdir(tempDir)
    const cleanupPromises = jobDirs.map(dir =>
      fs
        .rm(path.join(tempDir, dir), { recursive: true, force: true })
        .catch(err => {
          console.error(`Could not clean up directory: ${dir}`, err.message)
        })
    )
    await Promise.all(cleanupPromises)
    console.log('Temporary directories cleaned.')
  } catch (err) {
    console.error('Error during setup or cleanup of temp directory', err)
  }
}
setup()
const executeCpp = (filepath, inputPath) => {
  const jobDir = path.dirname(filepath)
  const outPath = path.join(jobDir, 'a.exe')
  return new Promise((resolve, reject) => {
    exec(
      `g++ "${filepath}" -o "${outPath}"`,
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

const executeCode = async (language, code, input) => {
  const jobId = uuid()
  const jobDir = path.join(tempDir, jobId)
  await fs.mkdir(jobDir, { recursive: true })
  const sourceFilename = `main.${language}`
  const sourcePath = path.join(jobDir, sourceFilename)
  const inputPath = path.join(jobDir, 'input.txt')
  await fs.writeFile(sourcePath, code)
  await fs.writeFile(inputPath, input)

  try {
    let output
    if (language === 'cpp') {
      output = await executeCpp(sourcePath, inputPath)
    } else if (language === 'py') {
      output = await executePy(sourcePath, inputPath)
    } else {
      throw new Error(`Unsupported language: ${language}`)
    }
    return { output }
  } catch (e) {
    return { output: '', error: e.message }
  } finally {
    fs.rm(jobDir, { recursive: true, force: true }).catch(err =>
      console.error(`Error cleaning up job directory ${jobDir}:`, err)
    )
  }
}

module.exports = {
  executeCode
}
