import assert from 'node:assert/strict';
import test from 'node:test';

import { assertLocalDatabase } from './run-local-database-command.mjs';

test('allows local and Docker Compose PostgreSQL hosts', () => {
  for (const host of ['localhost', '127.0.0.1', '[::1]', 'db']) {
    assert.doesNotThrow(() =>
      assertLocalDatabase(`postgresql://carebow:carebow@${host}:5432/carebow`)
    );
  }
});

test('rejects remote PostgreSQL hosts', () => {
  assert.throws(
    () => assertLocalDatabase('postgresql://carebow:secret@production.example.com:5432/carebow'),
    /Refusing legacy API database command/
  );
});

test('rejects missing and non-PostgreSQL URLs', () => {
  assert.throws(() => assertLocalDatabase(), /DATABASE_URL is required/);
  assert.throws(() => assertLocalDatabase('mysql://localhost/carebow'), /must use the postgres/);
});
