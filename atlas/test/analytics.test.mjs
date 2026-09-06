import {test} from 'node:test';
import assert from 'node:assert/strict';
import {
  ATLAS_MEASUREMENT_ID,
  destinationTypeFor,
  renderAnalyticsHead,
  renderConsentBanner,
  renderInteractionScript,
} from '../analytics.mjs';

test('the Atlas uses the founder-provided Horonom company Measurement ID', () => {
  assert.equal(ATLAS_MEASUREMENT_ID, 'G-J14S6YWLNL');
});

test('destinationTypeFor classifies a plain marketing host as marketing', () => {
  assert.equal(destinationTypeFor('https://fornax.horonom.com'), 'marketing');
  assert.equal(destinationTypeFor('https://agent-assembly.com'), 'marketing');
  assert.equal(destinationTypeFor('https://octans.horo.run'), 'marketing');
});

test('destinationTypeFor classifies a docs. subdomain as docs', () => {
  assert.equal(destinationTypeFor('https://docs.fornax.horonom.com'), 'docs');
});

test('destinationTypeFor classifies app./api./ingest. prefixes as runtime', () => {
  assert.equal(destinationTypeFor('https://app.example.horo.run'), 'runtime');
  assert.equal(destinationTypeFor('https://api.example.horo.run'), 'runtime');
  assert.equal(destinationTypeFor('https://ingest.example.horo.run'), 'runtime');
});

test('destinationTypeFor fails closed to marketing on an unparseable URL', () => {
  assert.equal(destinationTypeFor('not-a-url'), 'marketing');
});

test('the analytics head sets Consent Mode v2 default-denied before loading gtag.js', () => {
  const head = renderAnalyticsHead();
  const consentIdx = head.indexOf("gtag('consent', 'default'");
  const loaderIdx = head.indexOf('googletagmanager.com/gtag/js');
  assert.ok(consentIdx > -1, 'must set a consent default');
  assert.ok(loaderIdx > -1, 'must load gtag.js');
  assert.ok(consentIdx < loaderIdx, 'consent default must be set before gtag.js loads');
  assert.match(head, /analytics_storage: 'denied'/);
});

test('the analytics head only ever references the Atlas Measurement ID', () => {
  const head = renderAnalyticsHead();
  const ids = [...head.matchAll(/G-[A-Z0-9]{8,12}/g)].map((m) => m[0]);
  assert.ok(ids.length > 0, 'expected at least one Measurement ID reference');
  for (const id of ids) {
    assert.equal(id, ATLAS_MEASUREMENT_ID, `found a non-Atlas Measurement ID: ${id}`);
  }
});

test('the consent banner starts hidden and offers accept/decline', () => {
  const banner = renderConsentBanner();
  assert.match(banner, /hidden/);
  assert.match(banner, /data-consent-action="accept"/);
  assert.match(banner, /data-consent-action="decline"/);
});

test('the interaction script only forwards the closed-vocabulary data-* attributes, never link text/URL', () => {
  const script = renderInteractionScript();
  assert.match(script, /product_slug/);
  assert.match(script, /product_status/);
  assert.match(script, /destination_type/);
  assert.doesNotMatch(script, /\.href\b/);
  assert.doesNotMatch(script, /textContent/);
  assert.doesNotMatch(script, /innerText/);
});
