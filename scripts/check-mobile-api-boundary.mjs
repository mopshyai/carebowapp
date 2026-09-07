import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const mobileSrc = path.join(root, 'apps/mobile/src');
const inspectedConfig = [
  path.join(root, 'apps/mobile/.env.example'),
  path.join(root, 'apps/mobile/__mocks__/@env.js'),
];

function walk(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) files.push(full);
  }
  return files;
}

function lineNumber(source, index) {
  return source.slice(0, index).split('\n').length;
}

const violations = [];
const apiClientCall = /ApiClient\.(get|post|put|patch|delete)\b/g;

for (const file of walk(mobileSrc)) {
  const source = fs.readFileSync(file, 'utf8');
  for (const match of source.matchAll(apiClientCall)) {
    const methodEnd = match.index + match[0].length;
    const openParen = source.indexOf('(', methodEnd);
    if (openParen === -1 || openParen - methodEnd > 600) continue;

    let cursor = openParen + 1;
    while (/\s/.test(source[cursor] ?? '')) cursor += 1;
    const quote = source[cursor];
    if (!['\'', '"', '`'].includes(quote)) continue; // Helper call with a guarded/dynamic path.

    const start = cursor + 1;
    let end = start;
    while (end < source.length) {
      if (source[end] === '\\') {
        end += 2;
        continue;
      }
      if (source[end] === quote) break;
      end += 1;
    }
    if (end >= source.length) continue;

    const endpoint = source.slice(start, end);
    if (endpoint.startsWith('/') && endpoint !== '/v1' && !endpoint.startsWith('/v1/')) {
      violations.push({
        file: path.relative(root, file),
        line: lineNumber(source, cursor),
        detail: `${match[1].toUpperCase()} ${endpoint}`,
      });
    }
  }

  // SSE/manual fetches can bypass the JSON ApiClient method wrappers. When a
  // CareBow URL is composed from ApiClient.getBaseUrl(), it must still enter at
  // /v1. This catches the known streaming pattern and future copies of it.
  const baseUrlPattern = /ApiClient\.getBaseUrl\(\)\}([^`'"\s]*)/g;
  for (const match of source.matchAll(baseUrlPattern)) {
    const suffix = match[1] || '';
    if (suffix.startsWith('/') && suffix !== '/v1' && !suffix.startsWith('/v1/')) {
      violations.push({
        file: path.relative(root, file),
        line: lineNumber(source, match.index),
        detail: `base URL composed with non-v1 suffix ${suffix}`,
      });
    }
  }
}

for (const file of inspectedConfig) {
  if (!fs.existsSync(file)) continue;
  const source = fs.readFileSync(file, 'utf8');
  for (const forbidden of [
    'ASK_CAREBOW_API_KEY',
    'ASK_CAREBOW_API_URL',
    'https://api.carebow.com',
  ]) {
    const index = source.indexOf(forbidden);
    if (index !== -1) {
      violations.push({
        file: path.relative(root, file),
        line: lineNumber(source, index),
        detail: `obsolete/unsafe mobile config: ${forbidden}`,
      });
    }
  }
}

if (violations.length) {
  console.error('Mobile CareBow API boundary violations:');
  for (const violation of violations) {
    console.error(`- ${violation.file}:${violation.line} ${violation.detail}`);
  }
  console.error('\nAll CareBow mobile traffic must enter carebow-main through /api/v1.');
  process.exit(1);
}

console.log('Mobile CareBow API boundary is v1-only.');
