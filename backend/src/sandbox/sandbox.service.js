const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

class SandboxService {
  constructor() {
    this.tempDir = path.resolve(__dirname, '../../temp');
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  // Helper to run shell commands asynchronously
  runCommand(cmd, timeoutMs = 15000) {
    return new Promise((resolve) => {
      const child = exec(cmd, { maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
        const exitCode = child.exitCode !== null ? child.exitCode : (error ? error.code : 0);
        resolve({
          stdout: stdout ? stdout.toString() : '',
          stderr: stderr ? stderr.toString() : '',
          exitCode
        });
      });

      if (timeoutMs > 0) {
        setTimeout(() => {
          child.kill();
        }, timeoutMs);
      }
    });
  }

  async execute(submissionId, code, language, testCases, timeLimitMs = 2000, memoryLimitMb = 128) {
    const fileExt = this.getFileExtension(language);
    const sourceFileName = `code_${submissionId}.${fileExt}`;
    const sourceFilePath = path.join(this.tempDir, sourceFileName);
    
    // Normalize paths to use forward slashes for Docker compatibility on Windows
    const absSourceFilePath = path.resolve(sourceFilePath).replace(/\\/g, '/');
    const absTempDir = path.resolve(this.tempDir).replace(/\\/g, '/');

    // 1. Write code to file
    fs.writeFileSync(sourceFilePath, code);

    // 2. Handle Compilation if C++
    let compiledBinaryName = null;
    if (language === 'cpp') {
      compiledBinaryName = `bin_${submissionId}`;
      const compileCmd = `docker run --rm -v "${absTempDir}:/app" gcc:latest g++ /app/${sourceFileName} -o /app/${compiledBinaryName}`;
      
      console.log(`Compiling C++ code... CMD: ${compileCmd}`);
      const compileResult = await this.runCommand(compileCmd, 15000);

      if (compileResult.exitCode !== 0) {
        // Compile Error
        this.cleanupFiles(submissionId, fileExt);
        return {
          verdict: 'CE',
          error: compileResult.stderr || compileResult.stdout || 'Compilation failed',
          testCaseResults: []
        };
      }
    }

    const results = [];
    let overallVerdict = 'AC';
    let maxTime = 0;

    // 3. Run each testcase
    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      const inputFileName = `input_${submissionId}_${i}.txt`;
      const inputFilePath = path.join(this.tempDir, inputFileName);
      const absInputFilePath = path.resolve(inputFilePath).replace(/\\/g, '/');

      // Write testcase input to file
      fs.writeFileSync(inputFilePath, tc.input || '');

      let runCmd = '';
      const timeLimitSec = (timeLimitMs / 1000).toFixed(1);
      const memLimitStr = `${memoryLimitMb}m`;

      if (language === 'cpp') {
        runCmd = `docker run --rm -i --network none --memory ${memLimitStr} --memory-swap ${memLimitStr} ` +
                 `-v "${absTempDir}/${compiledBinaryName}:/app/main:ro" -v "${absInputFilePath}:/app/input.txt:ro" ` +
                 `gcc:latest bash -c "ulimit -u 30; timeout ${timeLimitSec}s /app/main < /app/input.txt"`;
      } else if (language === 'python') {
        runCmd = `docker run --rm -i --network none --memory ${memLimitStr} --memory-swap ${memLimitStr} ` +
                 `-v "${absSourceFilePath}:/app/main.py:ro" -v "${absInputFilePath}:/app/input.txt:ro" ` +
                 `python:3.11-slim bash -c "ulimit -u 30; timeout ${timeLimitSec}s python /app/main.py < /app/input.txt"`;
      } else if (language === 'javascript') {
        runCmd = `docker run --rm -i --network none --memory ${memLimitStr} --memory-swap ${memLimitStr} ` +
                 `-v "${absSourceFilePath}:/app/main.js:ro" -v "${absInputFilePath}:/app/input.txt:ro" ` +
                 `node:18-alpine sh -c "ulimit -u 30; timeout ${timeLimitSec}s node /app/main.js < /app/input.txt"`;
      }

      console.log(`Running testcase #${i}... CMD: ${runCmd}`);
      const start = Date.now();
      const runResult = await this.runCommand(runCmd, timeLimitMs * 2);
      const elapsed = Date.now() - start;

      let tcVerdict = 'AC';
      let tcOutput = runResult.stdout;
      
      // Determine testcase verdict
      if (runResult.exitCode === 124) {
        tcVerdict = 'TLE';
        tcOutput = 'Time Limit Exceeded';
      } else if (runResult.exitCode === 137) {
        tcVerdict = 'RTE';
        tcOutput = 'Memory Limit Exceeded / Out Of Memory';
      } else if (runResult.exitCode !== 0) {
        tcVerdict = 'RTE';
        tcOutput = runResult.stderr || 'Runtime Error';
      }

      results.push({
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        output: tcOutput,
        status: tcVerdict,
        executionTime: elapsed,
        memoryUsed: tcVerdict === 'RTE' && runResult.exitCode === 137 ? memoryLimitMb : Math.min(10, memoryLimitMb / 5) // Mock realistic student memory
      });

      if (elapsed > maxTime) maxTime = elapsed;

      if (tcVerdict !== 'AC') {
        overallVerdict = tcVerdict;
      }
    }

    // Cleanup temp files
    this.cleanupFiles(submissionId, fileExt);

    return {
      verdict: overallVerdict,
      error: '',
      testCaseResults: results,
      executionTime: maxTime,
      memoryUsed: Math.min(10, memoryLimitMb / 5)
    };
  }

  getFileExtension(language) {
    switch (language) {
      case 'cpp': return 'cpp';
      case 'python': return 'py';
      case 'javascript': return 'js';
      default: return 'txt';
    }
  }

  cleanupFiles(submissionId, fileExt) {
    try {
      const files = fs.readdirSync(this.tempDir);
      for (const file of files) {
        if (file.includes(submissionId)) {
          fs.unlinkSync(path.join(this.tempDir, file));
        }
      }
    } catch (error) {
      console.error(`Failed to cleanup files for submission ${submissionId}: ${error.message}`);
    }
  }
}

module.exports = new SandboxService();
