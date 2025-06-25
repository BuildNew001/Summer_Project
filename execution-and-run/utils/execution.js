const fs = require('fs').promises
const path = require('path')
const os = require('os')
const { v4: uuid } = require('uuid')
const { executeCpp } = require('./executeCpp')
const { executeC } = require('./executeC')
const { executeJava } = require('./executeJava')
const { executePy } = require('./executePy')

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

const executeCode = async (language, code, input) => {
  const jobId = uuid()
  const jobDir = path.join(tempDir, jobId)
  await fs.mkdir(jobDir, { recursive: true })

  let sourceFilename
  if (language === 'java') {
    const match = code.match(/\s*public\s+class\s+([a-zA-Z0-9_]+)/)
    const className = match ? match[1] : 'main'
    sourceFilename = `${className}.java`
  } else {
    sourceFilename = `main.${language}`
  }
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
    } else if (language === 'c') {
      output = await executeC(sourcePath, inputPath)
    } else if (language === 'java') {
      output = await executeJava(sourcePath, inputPath)
    } else {
      throw new Error(`Unsupported language: ${language}`)
    }
    return { output, error: '' }
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
