// Pulls the --hn-* shared design tokens (HORO-283) out of the corporate
// site's src/css/custom.css at build time, so the Atlas reads the same
// color/spacing/radius/elevation/focus values without importing the whole
// (heavily Docusaurus-coupled) stylesheet. This is deliberately read-only —
// it never writes back to custom.css, and it does not extract tokens into
// a new shared file, per ADR-0002's "share token values, not layout".
//
// The floor below guards against silent drift: if custom.css's token block
// shrinks unexpectedly (a refactor moved/renamed the block), the build
// fails loudly instead of silently shipping an Atlas with half its tokens
// missing.
const MIN_TOKEN_COUNT = 30;

/**
 * @param {string} cssSource full contents of src/css/custom.css
 * @param {number} [minCount] declaration-count floor; defaults to the real
 *   custom.css floor. Tests pass a lower value against small fixtures.
 * @returns {string} a `:root { ... }` block containing every --hn-* token
 */
export function extractTokens(cssSource, minCount = MIN_TOKEN_COUNT) {
  // Only the FIRST top-level `:root { ... }` block — a later `:root`
  // nested inside `@media (max-width: 996px)` redefines --hn-gutter for
  // that breakpoint, and naive matching would pick that one up too. The
  // Atlas declares its own responsive gutter rather than inheriting the
  // corporate site's.
  const rootStart = cssSource.indexOf(':root {');
  if (rootStart === -1) {
    throw new Error('extractTokens: no top-level ":root {" block found in custom.css');
  }
  const bodyStart = cssSource.indexOf('{', rootStart) + 1;
  let depth = 1;
  let i = bodyStart;
  while (depth > 0 && i < cssSource.length) {
    if (cssSource[i] === '{') depth++;
    else if (cssSource[i] === '}') depth--;
    i++;
  }
  const body = cssSource.slice(bodyStart, i - 1);

  // Match by declaration, not by line: several --hn-* values (e.g.
  // --hn-glass-bg's linear-gradient(...)) span multiple lines, so a
  // line-by-line split would truncate them mid-value.
  const declarations = [...body.matchAll(/--hn-[\w-]+:\s*[^;]+;/gs)].map((m) =>
    m[0].replace(/\s+/g, ' ').trim(),
  );

  if (declarations.length < minCount) {
    throw new Error(
      `extractTokens: found only ${declarations.length} --hn-* declarations, expected at least ${minCount} — custom.css's token block may have moved or been renamed.`,
    );
  }

  return `:root {\n  ${declarations.join('\n  ')}\n}\n`;
}
