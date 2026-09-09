import {test} from 'node:test';
import assert from 'node:assert/strict';
import {resolveAttentionTarget} from '../../src/components/primitives/attention.mjs';

test('keyboard attention survives pointer departure and yields only when focus clears', () => {
  const inputs = {focus: 'keyboard-target', selection: 'selected-target', hover: 'pointer-target'};
  assert.equal(resolveAttentionTarget(inputs), 'keyboard-target');
  inputs.hover = null;
  assert.equal(resolveAttentionTarget(inputs), 'keyboard-target');
  inputs.focus = null;
  assert.equal(resolveAttentionTarget(inputs), 'selected-target');
  inputs.selection = null;
  assert.equal(resolveAttentionTarget(inputs), null);
  inputs.hover = 'new-pointer-target';
  assert.equal(resolveAttentionTarget(inputs), 'new-pointer-target');
});
