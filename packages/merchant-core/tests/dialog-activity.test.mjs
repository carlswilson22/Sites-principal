import test from 'node:test';
import assert from 'node:assert/strict';
import { hasOpenDialogs, isTopDialog, registerDialog, subscribeDialogActivity } from '../src/utils/dialogActivity.js';

test('atividade e foco acompanham diálogos sobrepostos até o último fechar', () => {
  const states = [];
  const unsubscribe = subscribeDialogActivity(open => states.push(open));
  const outer = {};
  const nested = {};
  const closeOuter = registerDialog(outer);
  const closeNested = registerDialog(nested);
  try {
    assert.equal(isTopDialog(nested), true);
    assert.equal(isTopDialog(outer), false);
    closeNested();
    assert.equal(hasOpenDialogs(), true);
    assert.equal(isTopDialog(outer), true);
    closeOuter();
    assert.equal(hasOpenDialogs(), false);
    assert.deepEqual(states, [false, true, true, true, false]);
    unsubscribe();
    const closeAgain = registerDialog(outer);
    closeAgain();
    assert.equal(states.length, 5);
  } finally {
    unsubscribe();
    closeNested();
    closeOuter();
  }
});
