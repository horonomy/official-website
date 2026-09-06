// HORO-612: the deployed Atlas artifact embeds the commit it was built
// from (<meta name="horonom:build-commit">) so a CI check can compare
// production against main's current tip without guessing from content
// hashes. This test runs the real build entrypoint as a subprocess (the
// same way CI invokes it) rather than importing build.mts's internals,
// since build.mts is a script, not an exported module.
import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {after, test} from 'node:test';
import assert from 'node:assert/strict';

const ATLAS_DIR = join(dirname(fileURLToPath(import.meta.url)), '..');
const REPO_ROOT = join(ATLAS_DIR, '..');
const BUILD_SCRIPT = join(ATLAS_DIR, 'build.mts');
const INDEX_HTML = join(ATLAS_DIR, 'dist', 'index.html');

function runBuild(env) {
  execFileSync(
    process.execPath,
    [
      '--disable-warning=ExperimentalWarning',
      '--disable-warning=MODULE_TYPELESS_PACKAGE_JSON',
      '--experimental-strip-types',
      BUILD_SCRIPT,
    ],
    {cwd: REPO_ROOT, env},
  );
  return readFileSync(INDEX_HTML, 'utf8');
}

test('build embeds GITHUB_SHA as the build-commit marker when set', () => {
  const html = runBuild({...process.env, GITHUB_SHA: 'deadbeefcafe'});
  assert.match(html, /<meta name="horonom:build-commit" content="deadbeefcafe" \/>/);
});

test('build falls back to "local" when GITHUB_SHA is unset', () => {
  const env = {...process.env};
  delete env.GITHUB_SHA;
  const html = runBuild(env);
  assert.match(html, /<meta name="horonom:build-commit" content="local" \/>/);
});

// This test writes real build output to atlas/dist (gitignored, but a
// developer running `pnpm test:atlas` alone — not through the full CI
// sequence that rebuilds it afterward — would otherwise be left with a
// bogus commit marker on disk). Restore a normal build once, afterward.
after(() => {
  runBuild(process.env);
});
