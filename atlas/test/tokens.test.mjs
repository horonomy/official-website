import {test} from 'node:test';
import assert from 'node:assert/strict';
import {extractTokens} from '../tokens.mjs';

test('extracts --hn-* declarations from the first top-level :root block', () => {
  const css = `
:root {
  --hn-a: 1px;
  --hn-b: red;
}
`;
  const out = extractTokens(css, 2);
  assert.match(out, /--hn-a: 1px;/);
  assert.match(out, /--hn-b: red;/);
});

test('ignores a --hn-* declaration nested inside a later @media :root', () => {
  const css = `
:root {
  --hn-a: 1px;
}
@media (max-width: 996px) {
  :root {
    --hn-a: 2px;
  }
}
`;
  const out = extractTokens(css, 1);
  const matches = [...out.matchAll(/--hn-a: \S+;/g)];
  assert.equal(matches.length, 1);
  assert.match(matches[0][0], /1px/);
});

test('preserves a multi-line declaration value intact', () => {
  const css = `
:root {
  --hn-a: 1px;
  --hn-glass: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.045),
    rgba(11, 13, 16, 0.62)
  );
}
`;
  const out = extractTokens(css, 2);
  assert.match(out, /--hn-glass: linear-gradient\( 180deg, rgba\(255, 255, 255, 0.045\), rgba\(11, 13, 16, 0.62\) \);/);
});

test('throws if the declaration count falls below the floor', () => {
  const css = `:root {\n  --hn-a: 1px;\n}\n`;
  assert.throws(() => extractTokens(css));
});

test('throws if no top-level :root block exists', () => {
  assert.throws(() => extractTokens('.foo { color: red; }'));
});
