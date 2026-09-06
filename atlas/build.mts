// Static build entrypoint for the Product Atlas (HORO-285). Run under
// Node's native TypeScript type stripping (Node >= 22.6 with the
// --experimental-strip-types flag, default-on from 22.18) — no bundler, no
// transpile step, no new dependency. productRegistry.ts is fully erasable
// syntax (interfaces, type aliases, `as const`), so stripping is sufficient
// without a real type-check at build time; `pnpm typecheck:atlas` is what
// actually checks types, run separately in CI before this script.
//
// The corporate site's own build stays on Node 20 (.github/workflows/ci.yml
// `build` job, untouched) — this script and its CI job run on Node 22.
// Do NOT bump the root package.json "engines" field to match; that would
// misrepresent the corporate site's own requirement.
import {mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {PRODUCT_REGISTRY} from '../src/data/productRegistry.ts';
import {resolveDestination} from './destinations.mjs';
import {renderPage} from './render.mjs';
import {extractTokens} from './tokens.mjs';

const ATLAS_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(ATLAS_DIR, '..');
const DIST_DIR = join(ATLAS_DIR, 'dist');

mkdirSync(DIST_DIR, {recursive: true});

// HORO-612: embed the commit this build was produced from so a deployed
// artifact's provenance can be checked directly against `main`'s current
// tip (see .github/workflows/atlas-deploy-guard.yml) without guessing from
// content hashes alone. Falls back to 'local' outside CI so a developer's
// local build doesn't need a real SHA to run.
const buildCommit = process.env.GITHUB_SHA ?? 'local';
const html = renderPage([...PRODUCT_REGISTRY], resolveDestination).replace(
  '</head>',
  `  <meta name="horonom:build-commit" content="${buildCommit}" />\n</head>`,
);
writeFileSync(join(DIST_DIR, 'index.html'), html);

const customCss = readFileSync(join(REPO_ROOT, 'src', 'css', 'custom.css'), 'utf8');
const tokens = extractTokens(customCss);
const atlasCss = readFileSync(join(ATLAS_DIR, 'atlas.css'), 'utf8');
writeFileSync(join(DIST_DIR, 'atlas.css'), `${tokens}\n${atlasCss}`);

console.log(`Product Atlas built: ${DIST_DIR} (${PRODUCT_REGISTRY.length} product(s))`);
