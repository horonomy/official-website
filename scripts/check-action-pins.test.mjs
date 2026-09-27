/** HORO-1503. The pin gate, including the case it exists to catch. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {findUnpinnedReferences, readWorkflows} from './check-action-pins.mjs';

const SHA = '3d3c42e5aac5ba805825da76410c181273ba90b1';
const only = text => findUnpinnedReferences([{path: 'w.yml', text}]);

test('a pinned and annotated reference is accepted', () => {
  assert.deepEqual(only(`      - uses: actions/checkout@${SHA} # v7.0.1`), []);
});

test('a major tag is reported, with the line it is on', () => {
  assert.deepEqual(only('a\nb\n      - name: Checkout\n        uses: actions/checkout@v7'), [
    {path: 'w.yml', line: 4, reference: 'actions/checkout@v7', problem: 'a tag or branch, which the owner can re-point at any commit'},
  ]);
});

test('a full semver tag is reported too, because a tag is still a pointer', () => {
  // The case most likely to be waved through by a reader scanning for bare
  // majors: `@v7.0.0` reads as a pin and is not one. The owner can move
  // refs/tags/v7.0.0 to any commit, and nothing here would record that it did.
  assert.equal(only('        uses: actions/setup-node@v7.0.0')[0].problem,
    'a tag or branch, which the owner can re-point at any commit');
});

test('an abbreviated SHA is not a pin', () => {
  // Short SHAs are ambiguous by construction: a future object can share the
  // prefix, and git's disambiguation is not something to stake a deploy on.
  assert.equal(only(`        uses: actions/checkout@${SHA.slice(0, 8)} # v7.0.1`)[0].problem,
    'a tag or branch, which the owner can re-point at any commit');
});

test('omitting the version entirely is the worst case, and says so', () => {
  assert.equal(only('        uses: actions/checkout')[0].problem,
    'no version is given at all, so this tracks the default branch');
});

test('a pinned reference with no comment is reported', () => {
  // The SHA is immutable but opaque. Without the release name a reviewer cannot
  // tell an ordinary bump from a downgrade, and that is the whole reason the
  // inaccurate annotation in this repository went unnoticed.
  assert.equal(only(`        uses: actions/checkout@${SHA}`)[0].problem,
    'pinned, but no comment says which release the SHA is');
});

test('quotes around the reference do not hide it either way', () => {
  assert.deepEqual(only(`        uses: "actions/checkout@${SHA}" # v7.0.1`), []);
  assert.equal(only('        uses: "actions/checkout@v7"')[0].reference, 'actions/checkout@v7');
});

test('an action in this repository needs no pin', () => {
  // Nobody who cannot already commit here can change it.
  assert.deepEqual(only('        uses: ./.github/actions/setup\n        uses: ../shared'), []);
});

test('a commented-out step is documentation, not something that runs', () => {
  assert.deepEqual(only('        # uses: actions/checkout@v7'), []);
});

test('a container step must name a digest', () => {
  assert.equal(only('        uses: docker://alpine:3.20')[0].problem,
    'a container reference must name a digest, not a tag');
  assert.deepEqual(only('        uses: docker://alpine@sha256:' + 'a'.repeat(64)), []);
});

test('a reusable workflow is judged on its ref, not its path depth', () => {
  assert.deepEqual(only(`    uses: owner/repo/.github/workflows/build.yml@${SHA} # v1.2.3`), []);
  assert.equal(only('    uses: owner/repo/.github/workflows/build.yml@main')[0].problem,
    'a tag or branch, which the owner can re-point at any commit');
});

test('an annotation names one release, or says plainly that none does', () => {
  // The case that got through. `pnpm/action-setup` was annotated
  // `# v6, ahead of v6.1.0`, and both halves were false: the pinned SHA was the
  // annotated tag object for v6, not a commit, and its commit is tagged v6.0.10 --
  // a month behind v6.1.0. Prose leaves room for a claim like that; one release
  // identifier does not.
  assert.equal(only(`        uses: pnpm/action-setup@${SHA} # v6, ahead of v6.1.0`)[0].problem,
    'the comment must name exactly one release, or begin with "untagged" — not "v6, ahead of v6.1.0"');
  for (const prose of ['# latest', '# TODO', '# v6 only', '# see HORO-1503', '# v7.0.1 (probably)'])
    assert.equal(only(`        uses: owner/repo@${SHA} ${prose}`).length, 1, prose + ' must be rejected');
  // And the forms that do name a release, so the rule is not simply "reject".
  for (const release of ['# v7.0.1', '# v4.0', '# 1.2.3', '# v2.0.0-rc.1'])
    assert.deepEqual(only(`        uses: owner/repo@${SHA} ${release}`), [], release + ' must be accepted');
  // A commit no release names is a real situation and stays expressible -- it just
  // has to be asserted rather than left to the reader to notice.
  assert.deepEqual(only(`        uses: owner/repo@${SHA} # untagged: ahead of v6.1.0, no release names it`), []);
});

test('a release whose name is not a bare version is still one release', () => {
  // The false positive this rule had. `github/codeql-action` names its bundle
  // releases `codeql-bundle-v2.25.2`, and for the commit this repository pins
  // that tag is the only ref that resolves to it, so demanding a bare `vN.N.N`
  // here would have demanded an annotation that was false.
  for (const release of ['# codeql-bundle-v2.25.2', '# aws-sdk-v3.1.0', '# release-2024.1'])
    assert.deepEqual(only(`        uses: owner/repo@${SHA} ${release}`), [], release + ' must be accepted');
  // Widening the grammar must not let prose back in: every one of these was
  // rejected before and has to stay rejected, because each is a claim rather
  // than a name and it is claims that hid the original defect.
  for (const prose of ['# codeql-bundle v2.25.2', '# v6, ahead of v6.1.0', '# v6 only', '# latest',
                       '# codeql-bundle-latest', '# roughly v2.25'])
    assert.equal(only(`        uses: owner/repo@${SHA} ${prose}`).length, 1, prose + ' must be rejected');
});

test('every reference in this repository is pinned and annotated', () => {
  // The anti-vacuity guard. The cases above prove the predicate discriminates;
  // this one applies it to the real workflows, so re-floating any reference
  // fails the unit suite and not only the dedicated CI step.
  const files = readWorkflows();
  assert.ok(files.length > 0, 'found no workflows to check, which would make this vacuous');
  assert.deepEqual(findUnpinnedReferences(files), []);
});
