import test from 'node:test';
import assert from 'node:assert/strict';
import { printDocument } from '../src/utils/printDocument.js';

test('imprime o documento em área isolada e a remove após impressão', () => {
  const oldDocument = globalThis.document;
  let printed = 0;
  let afterPrint;
  let removed = false;
  const frame = {
    style: {},
    attributes: {},
    setAttribute(name, value) { this.attributes[name] = value; },
    remove() { removed = true; },
    contentWindow: {
      addEventListener(event, handler) { if (event === 'afterprint') afterPrint = handler; },
      focus() {},
      print() { printed += 1; },
    },
  };
  globalThis.document = { createElement: () => frame, body: { appendChild(child) { assert.equal(child, frame); } } };
  try {
    printDocument('<p>Minuta</p>');
    assert.equal(frame.srcdoc, '<p>Minuta</p>');
    assert.equal(frame.attributes.sandbox, 'allow-same-origin allow-modals');
    frame.onload();
    assert.equal(printed, 1);
    afterPrint();
    assert.equal(removed, true);
  } finally { globalThis.document = oldDocument; }
});

test('informa falha na impressão e remove a área temporária', () => {
  const oldDocument = globalThis.document;
  let removed = false;
  let error = '';
  const frame = {
    style: {}, setAttribute() {}, remove() { removed = true; },
    contentWindow: { addEventListener() {}, focus() {}, print() { throw new Error('blocked'); } },
  };
  globalThis.document = { createElement: () => frame, body: { appendChild() {} } };
  try {
    printDocument('<p>Minuta</p>', { onError: message => { error = message; } });
    frame.onload();
    assert.match(error, /impressão/);
    assert.equal(removed, true);
    assert.throws(() => printDocument(''), /documento/i);
  } finally { globalThis.document = oldDocument; }
});
