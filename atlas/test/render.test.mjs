import {test} from 'node:test';
import assert from 'node:assert/strict';
import {esc, renderPage} from '../render.mjs';

const FIXTURE = [
  {
    id: 'live-one',
    name: 'Live One',
    category: 'A category',
    problem: 'A problem statement.',
    maturity: 'beta',
    canonicalUrl: 'https://live.example',
    celestialIdentity: 'Testara',
    order: 1,
  },
  {
    id: 'pending-one',
    name: 'Pending One',
    category: 'B category',
    problem: 'Another problem statement.',
    maturity: 'experimental',
    canonicalUrl: 'https://pending.example',
    celestialIdentity: 'Nullaris',
    order: 0,
  },
];

function resolve(entry) {
  return entry.canonicalUrl === 'https://live.example'
    ? {state: 'live', href: entry.canonicalUrl}
    : {state: 'pending', href: null};
}

test('esc escapes the five HTML-significant characters', () => {
  assert.equal(esc(`<a href="x">'&'</a>`), '&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;');
});

test('renders entries in ascending order regardless of input order', () => {
  const html = renderPage(FIXTURE, resolve);
  const iLive = html.indexOf('Live One');
  const iPending = html.indexOf('Pending One');
  assert.ok(iPending < iLive, 'order:0 entry must render before order:1 entry');
});

test('a live product gets a real anchor to its canonical URL', () => {
  const html = renderPage(FIXTURE, resolve);
  assert.match(html, /<a class="hn-atlas-card__link" href="https:\/\/live\.example"[^>]*>Visit Live One/);
});

test('a live product’s anchor carries HORO-595 analytics data attributes', () => {
  const html = renderPage(FIXTURE, resolve);
  const cardStart = html.indexOf('Live One');
  const cardEnd = html.indexOf('</li>', cardStart);
  const cardHtml = html.slice(cardStart, cardEnd);
  assert.match(cardHtml, /data-ga-event="product_card_click"/);
  assert.match(cardHtml, /data-product-slug="live-one"/);
  assert.match(cardHtml, /data-product-status="beta"/);
  assert.match(cardHtml, /data-destination-type="marketing"/);
});

test('a pending product gets no anchor at all — not a disabled link', () => {
  const html = renderPage(FIXTURE, resolve);
  const cardStart = html.indexOf('Pending One');
  const cardEnd = html.indexOf('</li>', cardStart);
  const cardHtml = html.slice(cardStart, cardEnd);
  assert.doesNotMatch(cardHtml, /<a[\s>]/);
  assert.match(cardHtml, /Not yet available\./);
});

test('user-supplied strings are escaped in the output', () => {
  const malicious = [
    {
      id: 'x',
      name: '<script>alert(1)</script>',
      category: 'c',
      problem: 'p',
      maturity: 'beta',
      canonicalUrl: 'https://live.example',
      celestialIdentity: 'z',
      order: 0,
    },
  ];
  const html = renderPage(malicious, resolve);
  assert.doesNotMatch(html, /<script>alert/);
  assert.match(html, /&lt;script&gt;/);
});
