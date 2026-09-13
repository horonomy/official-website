import {test} from 'node:test';
import assert from 'node:assert/strict';
import {resolveDestination, resolveDocsDestination, LIVE_DOCS_URLS, LIVE_HOSTS} from '../destinations.mjs';

test('a host on the allowlist resolves live with its canonical URL', () => {
  const result = resolveDestination({canonicalUrl: 'https://agent-assembly.com'});
  assert.deepEqual(result, {state: 'live', href: 'https://agent-assembly.com'});
});

test('a host not on the allowlist resolves pending with no href', () => {
  const result = resolveDestination({canonicalUrl: 'https://ganymede.horo.run'});
  assert.deepEqual(result, {state: 'pending', href: null});
});

test('an unparseable URL fails closed to pending, not a thrown error', () => {
  const result = resolveDestination({canonicalUrl: 'not-a-url'});
  assert.deepEqual(result, {state: 'pending', href: null});
});

test('the family-alias host is never on the allowlist', () => {
  assert.equal(LIVE_HOSTS.has('agent-assembly.horo.run'), false);
});

test('documentation resolves only the five verified exact public roots', () => {
  assert.equal(LIVE_DOCS_URLS.size, 5);
  for (const docsUrl of LIVE_DOCS_URLS) {
    assert.equal(resolveDocsDestination({docsUrl}), docsUrl);
  }
  for (const docsUrl of [null, undefined, 'https://octans.horo.run/docs', 'https://eridanus.horo.run/docs', 'https://docs.agent-assembly.com/unverified', 'javascript:alert(1)', 'http://docs.agent-assembly.com']) {
    assert.equal(resolveDocsDestination({docsUrl}), null);
  }
});
