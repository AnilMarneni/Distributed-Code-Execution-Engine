import express from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const execAsync = promisify(exec);
const app = express();
app.use(express.json());

const TEMP_DIR = path.join(process.cwd(), 'temp');

async function ensureTempDir() {
  try {
    await fs.mkdir(TEMP_DIR, { recursive: true });
  } catch (err) {}
}

app.post('/execute', async (req, res) => {
  const { jobId, code, language, timeLimit = 2000, memoryLimit = 128, testCases = [] } = req.body;
  
  console.log(`[Worker] Executing job: ${jobId} (${language})`);
  
  await ensureTempDir();
  
  const results = [];
  const sourceFileName = language === 'cpp' ? 'main.cpp' : language === 'java' ? 'Main.java' : 'main.py';
  const sourcePath = path.join(TEMP_DIR, `${jobId}_${sourceFileName}`);
  
  await fs.writeFile(sourcePath, code);

  for (const tc of testCases) {
    const inputPath = path.join(TEMP_DIR, `${jobId}_input.txt`);
    await fs.writeFile(inputPath, tc.input || '');

    const timeLimitSec = timeLimit / 1000;
    const absSource = path.resolve(sourcePath);
    const absInput = path.resolve(inputPath);

    let dockerCmd = '';
    if (language === 'python') {
      dockerCmd = `docker run --rm -i --network none --memory ${memoryLimit}m -v "${absSource}:/app/main.py:ro" -v "${absInput}:/app/input.txt:ro" python:3.9-slim bash -c "timeout ${timeLimitSec}s python3 /app/main.py < /app/input.txt"`;
    } else if (language === 'cpp') {
      dockerCmd = `docker run --rm -i --network none --memory ${memoryLimit}m -v "${absSource}:/app/main.cpp:ro" -v "${absInput}:/app/input.txt:ro" gcc:latest bash -c "g++ /app/main.cpp -o /tmp/main && timeout ${timeLimitSec}s /tmp/main < /app/input.txt"`;
    }

    try {
      const { stdout, stderr } = await execAsync(dockerCmd);
      results.push({
        status: 'success',
        output: stdout || stderr,
        exitCode: 0
      });
    } catch (error: any) {
      results.push({
        status: 'error',
        output: error.stderr || error.message,
        exitCode: error.code || 1
      });
    } finally {
      await fs.unlink(inputPath).catch(() => {});
    }
  }

  await fs.unlink(sourcePath).catch(() => {});

  res.json({
    status: 'success',
    jobId,
    testCases: results
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'UP', fallback: true });
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Node Fallback Worker running on port ${PORT}`);
});
