// HORO-611: the consent banner's Accept/Decline buttons rendered but were
// not reliably clickable in a real production browser, despite passing
// every automated hit-testing/click/keyboard check (no z-index conflict, no
// overlay, event handler correctly attached and firing). The most plausible
// evidence-backed cause: a sub-44px touch target sitting flush against the
// viewport's bottom edge with no safe-area accounting — real fingertip
// contact is far less precise than a script clicking an exact pixel
// coordinate, so this class of defect is invisible to coordinate-based
// automated clicks but real on an actual touchscreen. These tests pin the
// two CSS properties that fix it so neither regresses silently.
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
