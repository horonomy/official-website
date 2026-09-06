import {test} from 'node:test';
import assert from 'node:assert/strict';
import {LIVE_HOSTS} from '../destinations.mjs';

// Regression guard (HORO-594/HORO-566): these legacy horo.run marketing
// hosts were retired by the domain migration — each now issues a real 301
// redirect to its horonom.com replacement (see each product's own edge
// Worker: ophiuchus-edge, fornax-edge, Circinus's equivalent) rather than
// serving a second indexable copy. Re-adding one here would resurrect the
// duplicate-canonical defect that migration fixed (see HORO-572's Fornax
// finding specifically).
const RETIRED_LEGACY_HOSTS = ['circinus.horo.run', 'ophiuchus.horo.run', 'fornax.horo.run'];

test('retired legacy horo.run marketing hosts never re-enter the allowlist', () => {
  for (const host of RETIRED_LEGACY_HOSTS) {
    assert.equal(
      LIVE_HOSTS.has(host),
      false,
      `${host} must stay off LIVE_HOSTS — it is a redirect-only legacy host now, not a second live copy`,
    );
  }
});

// Regression guard (HORO-594): Eridanus is intentionally not public —
// horonomy/.github's metadata/release-evidence/eridanus.yaml records
// claimed_lifecycle: not_yet_public (no website, no docs, no hosted
// service). Adding either host here would fabricate a live public surface
// for a release-gated product merely to make the Atlas look complete.
const ERIDANUS_HOSTS = ['eridanus.horo.run', 'eridanus.horonom.com'];

test('Eridanus stays off the allowlist while release-gated', () => {
  for (const host of ERIDANUS_HOSTS) {
    assert.equal(
      LIVE_HOSTS.has(host),
      false,
      `${host} must stay off LIVE_HOSTS while Eridanus's release-evidence claims not_yet_public`,
    );
  }
});
