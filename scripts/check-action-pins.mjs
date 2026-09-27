#!/usr/bin/env node
// Every third-party action this repository runs must be named by commit SHA (HORO-1503).
//
// A tag is a mutable pointer. `wrangler-action@v4` resolved to a release that
// could not execute at all for roughly 26 hours (HORO-1499), and the only
// reason no deploy failed is that nobody pushed to main inside that window.
// A SHA is the only reference an upstream owner cannot change underneath us.
//
// The check is deliberately offline and syntactic: it proves the *shape* of
// every reference, never what a tag currently resolves to. A gate that asked
// GitHub what `v7` means today would fail when GitHub is unreachable and would
// pass or fail differently on two runs over the same commit, which is exactly
// the property being defended against. Whether an annotation names the right
// release is checked by a human at review time, and Dependabot proposes the
// bumps.
//
// Usage: node scripts/check-action-pins.mjs
// Exit 0 = every reference is pinned and annotated. Exit 1 = at least one is not.

import {readFileSync, readdirSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const WORKFLOW_DIR = join(REPO_ROOT, '.github', 'workflows');

/** A reference to an action in the same repository cannot be changed by anyone
 *  who cannot already commit here, so it needs no pin. */
const LOCAL = /^\.{1,2}\//;
const SHA = /^[0-9a-f]{40}$/;

/**
 * Collect every unpinned or unannotated reference across the given workflow
 * sources. Pure and synchronous so the tests can feed it text rather than
 * needing a repository on disk.
 *
 * @param {Array<{path: string, text: string}>} files
 * @returns {Array<{path: string, line: number, reference: string, problem: string}>}
 */
export function findUnpinnedReferences(files) {
  const violations = [];
  for (const {path, text} of files) {
    text.split('\n').forEach((raw, index) => {
      // A commented-out step is documentation, not something the runner executes.
      if (/^\s*#/.test(raw)) return;
      const match = raw.match(/^\s*(?:-\s*)?uses:\s*(\S+)/);
      if (!match) return;
      const reference = match[1].replace(/^['"]|['"]$/g, '');
      const annotated = /#/.test(raw.slice(raw.indexOf(match[1]) + match[1].length));
      const report = problem => violations.push({path, line: index + 1, reference, problem});
      if (LOCAL.test(reference)) return;
      if (reference.startsWith('docker://')) {
        if (!reference.includes('@sha256:')) report('a container reference must name a digest, not a tag');
        return;
      }
      const at = reference.lastIndexOf('@');
      // No `@` at all means the implicit default branch, which is the most
      // mutable reference there is -- it changes on every upstream merge.
      if (at === -1) report('no version is given at all, so this tracks the default branch');
      else if (!SHA.test(reference.slice(at + 1))) report('a tag or branch, which the owner can re-point at any commit');
      else if (!annotated) report('pinned, but no comment says which release the SHA is');
    });
  }
  return violations;
}

/** Read the workflow directory in a stable order, so the report is diffable. */
export function readWorkflows(directory = WORKFLOW_DIR) {
  return readdirSync(directory)
    .filter(name => /\.ya?ml$/.test(name))
    .sort()
    .map(name => ({path: join('.github', 'workflows', name), text: readFileSync(join(directory, name), 'utf8')}));
}

// Only when run directly, so importing this from a test does not exit the process.
if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  const files = readWorkflows();
  const violations = findUnpinnedReferences(files);
  if (violations.length) {
    console.error(`FAIL: ${violations.length} action reference(s) are not pinned to an annotated commit SHA.\n`);
    for (const {path, line, reference, problem} of violations) {
      console.error(`  ${path}:${line}`);
      console.error(`    ${reference}`);
      console.error(`    ${problem}\n`);
    }
    console.error('Pin each to a full 40-character commit SHA with a comment naming the release,');
    console.error('for example: uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1');
    process.exit(1);
  }
  const count = files.reduce((total, file) => total + (file.text.match(/^\s*(?:-\s*)?uses:/gm) ?? []).length, 0);
  console.log(`OK: ${count} action reference(s) across ${files.length} workflow(s) are pinned and annotated.`);
}
