import {test} from 'node:test';
import assert from 'node:assert/strict';
import {resolveDestination, LIVE_HOSTS} from '../destinations.mjs';

test('a host on the allowlist resolves live with its canonical URL', () => {
  const result = resolveDestination({canonicalUrl: 'https://agent-assembly.com'});
  assert.deepEqual(result, {state: 'live', href: 'https://agent-assembly.com'});
});

test('a host not on the allowlist resolves pending with no href', () => {
  const result = resolveDestination({canonicalUrl: 'https://octans.horo.run'});
  assert.deepEqual(result, {state: 'pending', href: null});
});

test('an unparseable URL fails closed to pending, not a thrown error', () => {
  const result = resolveDestination({canonicalUrl: 'not-a-url'});
  assert.deepEqual(result, {state: 'pending', href: null});
});

test('the family-alias host is never on the allowlist', () => {
  assert.equal(LIVE_HOSTS.has('agent-assembly.horo.run'), false);
});
