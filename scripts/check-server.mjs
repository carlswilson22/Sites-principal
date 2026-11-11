import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const tests = fs.readdirSync('server/tests').filter(file => file.endsWith('.mjs')).map(file => `server/tests/${file}`);
const result = spawnSync(process.execPath, ['--test', ...tests], {
  stdio: 'inherit',
  env: { ...process.env, DATABASE_PATH: ':memory:' },
});
process.exitCode = result.status ?? 1;
