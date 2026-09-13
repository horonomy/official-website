import test from 'node:test';
import assert from 'node:assert/strict';
import {validateBase,validateReview} from './baseline-review.mjs';

test('baseline comparisons accept production and campaign bases, never arbitrary revisions', () => {
  assert.equal(validateBase(),'origin/main');
  assert.equal(validateBase('origin/uiux/visual-experience-overhaul'),'origin/uiux/visual-experience-overhaul');
  for(const base of ['HEAD','origin/main...HEAD','--output=/tmp/file','origin/feature/unreviewed',''])assert.throws(()=>validateBase(base));
});

test('baseline approval rejects missing provenance and unsafe paths', () => {
  const valid={ticket:'HORO-874',reason:'Reviewed the intended typography change.',sourceCommit:'a'.repeat(40),files:['linux/chromium-desktop/website-reduced.png']};
  assert.doesNotThrow(()=>validateReview(valid));
  for(const patch of [{ticket:''},{reason:'update'},{sourceCommit:'main'},{files:['../../private.png']},{files:['/tmp/foo.png']},{files:[]}])assert.throws(()=>validateReview({...valid,...patch}));
});
