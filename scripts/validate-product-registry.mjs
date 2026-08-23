#!/usr/bin/env node
// Deterministic validation for src/data/productRegistry.ts (HORO-282).
//
// TypeScript's structural typing already guarantees every entry has the
// required fields at the right *type* — this script checks the invariants
// TypeScript cannot express: non-empty strings, unique ids/slugs/order,
// well-formed URLs, and that maturity is one of the controlled vocabulary
// values (defence in depth if the type ever gets widened by mistake).
//
// Usage: node scripts/validate-product-registry.mjs
// Exit 0 = clean. Exit 1 = a registry entry is invalid.

import {readFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const REGISTRY_PATH = join(REPO_ROOT, 'src', 'data', 'productRegistry.ts');

const MATURITY_VALUES = new Set(['experimental', 'beta', 'release_candidate', 'available']);

const source = readFileSync(REGISTRY_PATH, 'utf8');

// The registry is a TS module (typed object literals), not JSON, so it
// can't be JSON.parse'd directly. Extracting each `{...}` entry inside the
// PRODUCT_REGISTRY array via a targeted regex is enough to check the
// invariants below without a full TS parser dependency; `pnpm typecheck`
// is what enforces the structural shape.
const arrayMatch = source.match(/PRODUCT_REGISTRY:[^=]*=\s*\[([\s\S]*)\]\s*as const;/);
if (!arrayMatch) {
  console.error('FAIL: could not locate PRODUCT_REGISTRY array in productRegistry.ts');
  process.exit(1);
}

function field(entryText, name) {
  const m = entryText.match(new RegExp(`${name}:\\s*(?:'([^']*)'|null)`));
  if (!m) return undefined;
  return m[1] === undefined ? null : m[1];
}

function orderField(entryText) {
  const m = entryText.match(/order:\s*(\d+)/);
  return m ? Number(m[1]) : undefined;
}

// Split on top-level entry boundaries ("{\n    id: '...'").
const entries = arrayMatch[1]
  .split(/\n\s*\{\s*\n\s*id:/)
  .slice(1)
  .map((chunk) => 'id:' + chunk);

if (entries.length === 0) {
  console.error('FAIL: PRODUCT_REGISTRY is empty — the public portfolio must not be empty.');
  process.exit(1);
}

const errors = [];
const seenIds = new Set();
const seenSlugs = new Set();
const seenOrders = new Set();
const httpsRe = /^https:\/\/[^\s]+$/;

for (const entryText of entries) {
  const id = field(entryText, 'id');
  const name = field(entryText, 'name');
  const slug = field(entryText, 'slug');
  const problem = field(entryText, 'problem');
  const maturity = field(entryText, 'maturity');
  const canonicalUrl = field(entryText, 'canonicalUrl');
  const githubUrl = field(entryText, 'githubUrl');
  const order = orderField(entryText);
  const label = id || name || '(unknown entry)';

  if (!id) errors.push(`${label}: missing id`);
  if (!name) errors.push(`${label}: missing name`);
  if (!slug) errors.push(`${label}: missing slug`);
  if (!problem) errors.push(`${label}: missing problem`);
  if (!maturity || !MATURITY_VALUES.has(maturity)) {
    errors.push(`${label}: maturity "${maturity}" is not in the controlled vocabulary (${[...MATURITY_VALUES].join(', ')})`);
  }
  if (!canonicalUrl || !httpsRe.test(canonicalUrl)) {
    errors.push(`${label}: canonicalUrl must be an https URL, got "${canonicalUrl}"`);
  }
  if (!githubUrl || !httpsRe.test(githubUrl)) {
    errors.push(`${label}: githubUrl must be an https URL, got "${githubUrl}"`);
  }
  if (id) {
    if (seenIds.has(id)) errors.push(`duplicate id "${id}"`);
    seenIds.add(id);
  }
  if (slug) {
    if (seenSlugs.has(slug)) errors.push(`duplicate slug "${slug}"`);
    seenSlugs.add(slug);
  }
  if (order === undefined) {
    errors.push(`${label}: missing order`);
  } else if (seenOrders.has(order)) {
    errors.push(`duplicate order value ${order}`);
  } else {
    seenOrders.add(order);
  }
}

if (errors.length > 0) {
  console.error(`FAIL: ${errors.length} product registry finding(s):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log(`OK: ${entries.length} product registry entr${entries.length === 1 ? 'y' : 'ies'} valid.`);
