import test from 'node:test';
import assert from 'node:assert/strict';
import { createRecordId } from '../src/utils/recordId.js';

test('registros funcionam sem randomUUID no acesso HTTP e não repetem IDs locais', () => {
  assert.equal(createRecordId({ randomUUID: () => 'native-id' }), 'native-id');
  assert.equal(createRecordId({ getRandomValues: bytes => bytes.fill(1) }), '01'.repeat(16));
  const ids = Array.from({ length: 100 }, () => createRecordId(null));
  assert.equal(new Set(ids).size, 100);
  assert(ids.every(id => typeof id === 'string' && id.length > 0));
});
