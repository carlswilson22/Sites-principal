import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';

const tests = fs.readdirSync('server/tests').filter(file => file.endsWith('.mjs')).map(file => `server/tests/${file}`);
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'sites-server-tests-'));
const result = spawnSync(process.execPath, ['--test', ...tests], {
  stdio: 'inherit',
  env: { ...process.env, DATABASE_PATH: ':memory:', MEDIA_DIR: temp },
});
if (path.dirname(temp) === path.resolve(os.tmpdir()) && path.basename(temp).startsWith('sites-server-tests-')) fs.rmSync(temp, { recursive: true, force: true });
process.exitCode = result.status ?? 1;
