import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, readFile, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';

const root = fileURLToPath(new URL('..', import.meta.url));
const validator = join(root, 'scripts', 'validate-product-registry.mjs');
const sourcePath = join(root, 'src', 'data', 'productRegistry.ts');

async function runWith(mutator) {
  const dir = await mkdtemp(join(tmpdir(), 'registry-validator-'));
  const fixture = join(dir, 'registry.ts');
  const source = await readFile(sourcePath, 'utf8');
  await writeFile(fixture, mutator(source));
  const result = spawnSync(process.execPath, [validator, fixture], {encoding: 'utf8'});
  await rm(dir, {recursive: true, force: true});
  return result;
}

test('rejects a released beta entry without a canonical identity', async () => {
  const result = await runWith((source) => source
    .replace("id: 'eridanus'", "id: 'eridanus'")
    .replace("maturity: 'experimental',\n    // Intentionally NOT public", "maturity: 'beta',\n    // Intentionally NOT public")
  );
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /null canonicalUrl is only valid/);
});

test('rejects a gated null identity with secondary public surfaces', async () => {
  const result = await runWith((source) => source.replace(
    "canonicalUrl: null,\n    familyAliasUrl: null,\n    docsUrl: null,",
    "canonicalUrl: null,\n    familyAliasUrl: 'https://eridanus.horo.run',\n    docsUrl: null,",
  ));
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /must not expose familyAliasUrl/);
});

test('rejects malformed or insecure secondary URLs', async () => {
  const result = await runWith((source) => source.replace(
    "docsUrl: 'https://docs.fornax.horonom.com'",
    "docsUrl: 'https://'",
  ));
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /docsUrl must be an https URL/);
});

