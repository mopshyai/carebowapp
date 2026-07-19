import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const LOCAL_DATABASE_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]', 'db']);

export function assertLocalDatabase(databaseUrl) {
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required for legacy API database commands.');
  }

  let parsed;
  try {
    parsed = new URL(databaseUrl);
  } catch {
    throw new Error('DATABASE_URL is not a valid URL.');
  }

  if (!['postgres:', 'postgresql:'].includes(parsed.protocol)) {
    throw new Error('DATABASE_URL must use the postgres or postgresql protocol.');
  }

  if (!LOCAL_DATABASE_HOSTS.has(parsed.hostname)) {
    throw new Error(
      `Refusing legacy API database command for remote host "${parsed.hostname}". ` +
        'Production database changes belong in mopshyai/carebow-main migrations.'
    );
  }
}

function readDatabaseUrl(apiDirectory) {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  try {
    const contents = readFileSync(resolve(apiDirectory, '.env'), 'utf8');
    const match = contents.match(/^DATABASE_URL\s*=\s*["']?([^\r\n"']+)["']?\s*$/m);
    return match?.[1];
  } catch {
    return undefined;
  }
}

function main() {
  const apiDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const command = process.argv.slice(2);

  if (command.length === 0) {
    throw new Error('No database command was provided.');
  }

  assertLocalDatabase(readDatabaseUrl(apiDirectory));

  const pnpm = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
  const result = spawnSync(pnpm, ['exec', ...command], {
    cwd: apiDirectory,
    env: process.env,
    stdio: 'inherit',
  });

  if (result.error) {
    throw result.error;
  }

  process.exitCode = result.status ?? 1;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
