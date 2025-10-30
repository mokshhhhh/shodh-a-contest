import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';
import { runInDocker } from './utils/dockerRunner.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: true }));
app.use(express.json({ limit: '512kb' }));

const problemsDir = path.join(__dirname, 'problems');

function loadProblem(problemId) {
  const p = path.join(problemsDir, `${problemId}.json`);
  if (!fs.existsSync(p)) {
    return null;
  }
  const content = fs.readFileSync(p, 'utf-8');
  return JSON.parse(content);
}
app.get('/', (req, res) => {
  res.send('Backend is running. Use /problems, /run, or /submit endpoints.');
});

app.get('/problems', (_req, res) => {
  try {
    const files = fs.readdirSync(problemsDir).filter(f => f.endsWith('.json'));
    const problems = files.map(f => {
      const json = JSON.parse(fs.readFileSync(path.join(problemsDir, f), 'utf-8'));
      return { id: path.basename(f, '.json'), name: json.name, description: json.description, io_format: json.io_format };
    });
    res.json({ problems });
  } catch (e) {
    res.status(500).json({ error: 'Failed to load problems' });
  }
});

app.get('/problems/:id', (req, res) => {
  const problem = loadProblem(req.params.id);
  if (!problem) return res.status(404).json({ error: 'Problem not found' });
  res.json({ id: req.params.id, ...problem });
});

// Run a single execution with provided input (ad-hoc) or with a specific test of a problem
app.post('/run', async (req, res) => {
  try {
    const { language, code, input, problemId, testIndex } = req.body || {};
    if (!language || !code) return res.status(400).json({ error: 'language and code are required' });

    let stdin = input ?? '';
    if (problemId) {
      const problem = loadProblem(problemId);
      if (!problem) return res.status(404).json({ error: 'Problem not found' });
      const tIdx = Number.isInteger(testIndex) ? testIndex : 0;
      if (!problem.tests || !problem.tests[tIdx]) return res.status(400).json({ error: 'Invalid test index' });
      stdin = problem.tests[tIdx].input;
    }

    const result = await runInDocker({ language, sourceCode: code, stdin, timeLimitMs: 4000 });
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: 'Run failed', details: String(e.message || e) });
  }
});

// Run against all tests of a problem and return verdict per test
app.post('/submit', async (req, res) => {
  try {
    const { language, code, problemId } = req.body || {};
    if (!language || !code || !problemId) return res.status(400).json({ error: 'language, code, and problemId are required' });
    const problem = loadProblem(problemId);
    if (!problem) return res.status(404).json({ error: 'Problem not found' });

    const results = [];
    for (let i = 0; i < problem.tests.length; i++) {
      const t = problem.tests[i];
      // eslint-disable-next-line no-await-in-loop
      const run = await runInDocker({ language, sourceCode: code, stdin: t.input, timeLimitMs: 4000 });
      const normalizedOut = (run.stdout || '').trim().replace(/\r\n/g, '\n');
      const expected = (t.output || '').trim().replace(/\r\n/g, '\n');
      const passed = run.exitCode === 0 && normalizedOut === expected;
      results.push({
        index: i,
        passed,
        expected,
        stdout: run.stdout,
        stderr: run.stderr,
        exitCode: run.exitCode,
        timeMs: run.timeMs,
        timeout: run.timeout === true
      });
    }

    const allPassed = results.every(r => r.passed);
    res.json({ verdict: allPassed ? 'ACCEPTED' : 'REJECTED', results });
  } catch (e) {
    res.status(500).json({ error: 'Submit failed', details: String(e.message || e) });
  }
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend listening on http://localhost:${PORT}`);
});




