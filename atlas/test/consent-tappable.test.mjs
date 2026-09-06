// HORO-611: the consent banner's Accept/Decline buttons rendered but were
// not reliably clickable in a real production browser. Production
// reproduction (Playwright against https://horo.run/) found two real,
// independent defects:
//
// 1. `.hn-atlas-consent[hidden]` cascade bug (the critical one, found on
//    review): the static markup carries the `hidden` attribute, and
//    analytics.mjs's click handler only ever does `banner.hidden = true`
//    — but `.hn-atlas-consent { display: flex }` is a plain author rule
//    with the SAME specificity as the UA stylesheet's `[hidden] { display:
//    none }`, and wins on source order. The banner never actually
//    disappeared, on any code path: not on a repeat visit after a prior
//    choice was already stored, and not immediately after clicking
//    Accept/Decline. It stayed fixed, full-width, and visually unchanged
//    at the bottom of the page forever — which reads exactly like
//    "clicking doesn't do anything," even though the click was correctly
//    recorded (consent state changed, GA event fired). This is the more
//    likely explanation for the founder's report than touch-target size
//    alone, and is why `.hn-atlas-consent[hidden] { display: none }`
//    exists as its own higher-specificity rule below it.
//
// 2. Sub-44px touch targets with no safe-area accounting (found first,
//    before the review surfaced #1): Accept/Decline measured ~34px tall,
//    below the 44px (iOS HIG) / 48dp (Material) minimum recommended touch
//    target, 16px above the raw viewport edge with no
//    env(safe-area-inset-bottom) padding — real fingertip contact is far
//    less precise than a script clicking an exact pixel coordinate, so
//    this class of defect is invisible to coordinate-based automated
//    clicks but real on an actual touchscreen.
//
// These tests pin the CSS that fixes both. They check the CSS source text
// directly (not computed style in a real DOM) because this repo has no
// browser/DOM testing dependency (jsdom/Playwright) as a devDependency —
// adding one for this alone was judged out of scope. For #1, correctness
// doesn't depend on source order: an attribute selector strictly raises
// specificity over a class-only selector by CSS's own specificity rules
// (a, b, c) — (0,1,1) vs (0,1,0) — so `.hn-atlas-consent[hidden]` beats
// `.hn-atlas-consent` regardless of which rule is declared first. The live
// production reproduction (Playwright, computed getComputedStyle) that
// found and confirmed the fix for #1 is recorded on HORO-611, not
// re-run here.
import {readFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {test} from 'node:test';
import assert from 'node:assert/strict';

const ATLAS_DIR = join(dirname(fileURLToPath(import.meta.url)), '..');
const css = readFileSync(join(ATLAS_DIR, 'atlas.css'), 'utf8');

function ruleBodyStartingAt(marker) {
  const start = css.indexOf(marker);
  assert.ok(start >= 0, `expected to find ${JSON.stringify(marker)} in atlas.css`);
  const openBrace = css.indexOf('{', start);
  const closeBrace = css.indexOf('}', openBrace);
  return css.slice(openBrace + 1, closeBrace);
}

test('an explicit [hidden] rule beats the base display:flex rule (HORO-611 critical fix)', () => {
  const body = ruleBodyStartingAt('.hn-atlas-consent[hidden]');
  assert.match(
    body,
    /display:\s*none/,
    '.hn-atlas-consent[hidden] must set display:none — otherwise the plain .hn-atlas-consent{display:flex} rule ' +
      '(same specificity, same-or-later in source order) wins and the banner never visually disappears',
  );
});

test('the base .hn-atlas-consent rule still sets display:flex for the visible state', () => {
  const body = ruleBodyStartingAt('.hn-atlas-consent {');
  assert.match(body, /display:\s*flex/);
});

test('consent banner accounts for the mobile safe area below it', () => {
  const body = ruleBodyStartingAt('.hn-atlas-consent {');
  assert.match(
    body,
    /padding-bottom:[^;]*env\(safe-area-inset-bottom/,
    'the banner must pad for env(safe-area-inset-bottom) so a real device home-indicator/gesture-nav area never covers the buttons',
  );
});

test('Accept/Decline meet the 44px minimum recommended touch target height', () => {
  // Selector list shares one rule body in atlas.css.
  const body = ruleBodyStartingAt('.hn-atlas-consent__accept,');
  assert.match(body, /min-height:\s*44px/, 'buttons must be at least 44px tall (iOS HIG / Material minimum touch target)');
});
