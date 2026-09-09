import test from 'node:test';
import assert from 'node:assert/strict';
import {validateReview} from './baseline-review.mjs';

test('baseline approval rejects missing provenance and unsafe paths', () => {
  const valid={ticket:'HORO-874',reason:'Reviewed the intended typography change.',sourceCommit:'a'.repeat(40),files:['linux/chromium-desktop/website-reduced.png']};
  assert.doesNotThrow(()=>validateReview(valid));
  for(const patch of [{ticket:''},{reason:'update'},{sourceCommit:'main'},{files:['../../private.png']},{files:['/tmp/foo.png']},{files:[]}])assert.throws(()=>validateReview({...valid,...patch}));
});
