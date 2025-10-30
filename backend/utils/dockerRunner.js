import { exec } from 'child_process';
import path from 'path';
import os from 'os';
import fs from 'fs-extra';
import { v4 as uuidv4 } from 'uuid';

function toDockerPath(hostPath) {
  // Convert Windows path like C:\dir\sub to /c/dir/sub for Docker Desktop
  if (process.platform === 'win32') {
    const drive = hostPath[0].toLowerCase();
    const rest = hostPath.slice(2).replace(/\\/g, '/');
    return `/${drive}${rest.startsWith('/') ? '' : '/'}${rest}`;
  }
  return hostPath;
}

function execAsync(cmd, options = {}) {
  return new Promise((resolve) => {
    const start = Date.now();
    const child = exec(cmd, { timeout: options.timeout, maxBuffer: 5 * 1024 * 1024 }, (error, stdout, stderr) => {
      const timeMs = Date.now() - start;
      if (error && error.killed && error.signal === 'SIGTERM') {
        return resolve({ stdout: stdout?.toString() || '', stderr: stderr?.toString() || '', exitCode: null, timeout: true, timeMs });
      }
      const exitCode = error && typeof error.code === 'number' ? error.code : 0;
      return resolve({ stdout: stdout?.toString() || '', stderr: stderr?.toString() || '', exitCode, timeout: false, timeMs });
    });
    // Ensure process is killed on explicit timeout
    if (options.timeout) {
      setTimeout(() => {
        try { child.kill('SIGTERM'); } catch (_) { /* noop */ }
      }, options.timeout + 50);
    }
  });
}

export async function runInDocker({ language, sourceCode, stdin = '', timeLimitMs = 4000 }) {
  const runId = uuidv4();
  const workDir = path.join(os.tmpdir(), `judge-${runId}`);
  await fs.ensureDir(workDir);
  const hostWork = workDir;
  const dockerWork = toDockerPath(workDir);

  try {
    let image;
    let fileName;
    let runCmdInside;

    if (language === 'python') {
      image = process.env.JUDGE_PY_IMAGE || 'python:3.10-alpine';
      fileName = 'main.py';
      await fs.writeFile(path.join(hostWork, fileName), sourceCode, 'utf-8');
      await fs.writeFile(path.join(hostWork, 'input.txt'), stdin, 'utf-8');
      runCmdInside = 'sh -lc "python3 -V >/dev/null 2>&1 && python3 main.py < input.txt"';
    } else if (language === 'cpp') {
      image = process.env.JUDGE_CPP_IMAGE || 'gcc:latest';
      fileName = 'main.cpp';
      await fs.writeFile(path.join(hostWork, fileName), sourceCode, 'utf-8');
      await fs.writeFile(path.join(hostWork, 'input.txt'), stdin, 'utf-8');
      runCmdInside = 'sh -lc "g++ -O2 -std=c++17 -o main main.cpp && ./main < input.txt"';
    } else {
      return { stdout: '', stderr: `Unsupported language: ${language}`, exitCode: 1, timeout: false, timeMs: 0 };
    }

    const limits = ['--network', 'none', '--cpus=0.5', '-m', '256m', '--pids-limit', '128'];
    const dockerCmd = [
      'docker', 'run', '--rm',
      ...limits,
      '-v', `${dockerWork}:/work`,
      '-w', '/work',
      image,
      runCmdInside
    ].join(' ');

    const result = await execAsync(dockerCmd, { timeout: timeLimitMs });
    return result;
  } finally {
    // Cleanup
    try { await fs.remove(workDir); } catch (_) { /* ignore */ }
  }
}




