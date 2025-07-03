const { execFile, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const TIMEOUT = 5000;
const executeC = (filepath, inputPath) => {
  const jobDir = path.dirname(filepath);
  const outPath = path.join(jobDir, 'a.out');

  return new Promise((resolve, reject) => {
    execFile('gcc', [filepath, '-o', outPath], (compileError, stdout, stderr) => {
      if (compileError) {
        return reject(
          new Error(`Compilation Error: ${stderr || compileError.message}`.trim())
        );
      }

      const runProcess = spawn(outPath, [], { timeout: TIMEOUT });

      let output = '';
      let errorOutput = '';

      runProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      runProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      runProcess.on('close', (code) => {
        if (errorOutput) {
          return reject(new Error(`Runtime Error: ${errorOutput}`));
        }
        resolve(output);
      });

      runProcess.on('error', (err) => {
        if (err.signal === 'SIGTERM') {
          return reject(new Error('Time Limit Exceeded'));
        }
        reject(new Error(`Runtime Error: ${err.message}`));
      });
      runProcess.stdin.on('error', (err) => {
        if (err.code !== 'EPIPE') { console.error('stdin error:', err); }
      });
      const inputStream = fs.createReadStream(inputPath);
      inputStream.pipe(runProcess.stdin);
    });
  });
};

module.exports = {
  executeC,
};
