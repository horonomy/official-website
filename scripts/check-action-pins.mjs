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
// What the annotation may say is checked, though, because the first version of
// this gate accepted any comment at all and one of the annotations it passed was
// wrong. `pnpm/action-setup` was pinned to f520ece and annotated
// `# v6, ahead of v6.1.0`. Both halves were false, from one mistake: f520ece is
// not a commit, it is the *annotated tag object* for `v6`, and its target commit
// 0977fd99 is tagged v6.0.10 — a month behind v6.1.0, not ahead of it. The
// figure the comparison was made against, d9184bf, is likewise the tag object
// for v6.1.0 rather than its commit. Two tag-object SHAs were compared, found to
// differ, and read as "an untagged commit ahead of every release".
//
// A 40-character hex string is therefore not proof of a commit, and nothing
// offline can tell the two apart: dereference it (`git/ref/tags/<tag>`, then
// `git/tags/<sha>` when the object type is `tag`) before writing the comment.
// What this gate can do is refuse prose. An annotation must name exactly one
// release, so a claim like "ahead of v6.1.0" has nowhere to hide, and a pin
// whose commit genuinely carries no release has to say so in as many words.
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
/** One release identifier and nothing else: `v7.0.1`, `v4.0`, `1.2.3-rc.1`. */
const RELEASE = /^v?\d+(?:\.\d+)*(?:-[0-9A-Za-z.]+)?$/;
/** The deliberate escape hatch, for a pinned commit no release names. Spelling it
 *  out is the point: it is a claim a reviewer can check, unlike silence. */
const UNTAGGED = /^untagged\b/;

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
      const trailing = raw.slice(raw.indexOf(match[1]) + match[1].length);
      const annotated = /#/.test(trailing);
      const annotation = annotated ? trailing.slice(trailing.indexOf('#') + 1).trim() : '';
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
      else if (!RELEASE.test(annotation) && !UNTAGGED.test(annotation))
        report(`the comment must name exactly one release, or begin with "untagged" — not ${JSON.stringify(annotation)}`);
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
    console.error('Pin each to a full 40-character commit SHA with a comment naming one release,');
    console.error('for example: uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1');
    console.error('Dereference the tag before writing that comment: an annotated tag resolves to a');
    console.error('tag object, whose own SHA is 40 hex characters and is not the commit.');
    process.exit(1);
  }
  const count = files.reduce((total, file) => total + (file.text.match(/^\s*(?:-\s*)?uses:/gm) ?? []).length, 0);
  console.log(`OK: ${count} action reference(s) across ${files.length} workflow(s) are pinned and annotated.`);
}
