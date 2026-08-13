#!/usr/bin/env node
/**
 * Offline publication gate for product claims on the Horonomy company site.
 *
 * WHY THIS EXISTS
 *
 * This site is T7/L0 — the outermost layer of ADR 0034's product-truth
 * hierarchy and the lowest authority in it. It may simplify a verified
 * lower-layer fact and may never broaden one, and it is the surface furthest
 * from the evidence, so a reader here has the least context in which to notice
 * an implied scope. Review alone did not hold: three broadenings were live on
 * this page when AAASM-5616 opened, one of them claiming a capability the
 * product's own site says does not exist.
 *
 * WHAT IT CHECKS, AND WHAT IT DELIBERATELY DOES NOT
 *
 * It checks the four things a machine can decide without judgement:
 *
 *   1. Banned absolutes (ADR 0033 forbidden design 7) in published text.
 *   2. Product links resolve to the registry's canonical host.
 *   3. Every maturity label rendered is one the registry vocabulary defines.
 *   4. Page metadata carries no product absolute.
 *
 * It does NOT try to decide whether a sentence broadens its canonical source.
 * That comparison needs the eight-dimension claim tuple in ADR 0034 §2.1 and a
 * resolvable manifest row, and T3 — the Approved Claims Registry — does not
 * exist yet. A gate that guessed at it would produce findings nobody could act
 * on, and would be switched off. Widening review stays human, against the
 * eight-move table in design/product-narrative-hierarchy.md §3.
 *
 * OFFLINE BY REQUIREMENT
 *
 * No network, no service dependency, no fetch of the upstream ADR. AAASM-5616
 * requires that company-site deployment stay independent and resilient, so this
 * gate must be unable to fail because something else is down. The cost is that
 * scripts/banned-absolutes.json is a synced copy rather than a live read; the
 * file documents how to keep it in step.
 *
 * IT SCANS THE BUILD, NOT THE SOURCE
 *
 * Published HTML under build/ is what a reader and a crawler actually receive.
 * Scanning source would both miss text assembled at render time and fire on
 * dead code that ships to nobody — this repository has a dead
 * src/components/Hero/ carrying rejected copy, and a source-scanning gate would
 * block on a file with no importers.
 *
 * Usage:  node scripts/check-product-claims.mjs [--build-dir build]
 * Exit:   0 clean · 1 findings · 2 the gate itself is broken
 */

import {readFileSync, readdirSync, statSync} from 'node:fs';
import {join, relative} from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const argIdx = process.argv.indexOf('--build-dir');
const BUILD_DIR = join(ROOT, argIdx > -1 ? process.argv[argIdx + 1] : 'build');

const RED = (s) => `\x1b[31m${s}\x1b[0m`;
const GREEN = (s) => `\x1b[32m${s}\x1b[0m`;
const DIM = (s) => `\x1b[2m${s}\x1b[0m`;

/** Exit 2, not 1: a broken gate is a different event from a failing one. A
 *  build that cannot tell those apart will eventually treat one as the other. */
function brokenGate(message) {
  console.error(RED('GATE BROKEN: ') + message);
  process.exit(2);
}

// ---------------------------------------------------------------------------
// Matching
// ---------------------------------------------------------------------------

/**
 * Word-boundary matcher.
 *
 * `\b` on both ends is what separates "complete" from "incomplete" and
 * "completeness". Hyphens and apostrophes are word boundaries in JS regex, so
 * "feature-complete" would still match `\bcomplete\b` — that is intended: a
 * hyphenated absolute is still the absolute. "incomplete" does not match
 * because there is no boundary between "in" and "complete".
 *
 * Multi-word phrases are matched with flexible internal whitespace, because
 * HTML wraps lines wherever it likes and "every\n  action" is the same claim
 * as "every action".
 */
function phraseRegex(phrase) {
  const escaped = phrase
    .split(/\s+/)
    .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('\\s+');
  return new RegExp(`\\b${escaped}\\b`, 'gi');
}

// ---------------------------------------------------------------------------
// Load and self-verify the catalogue
// ---------------------------------------------------------------------------

let catalogue;
try {
  catalogue = JSON.parse(
    readFileSync(join(ROOT, 'scripts/banned-absolutes.json'), 'utf8'),
  );
} catch (e) {
  brokenGate(`cannot read scripts/banned-absolutes.json — ${e.message}`);
}

const PHRASES = catalogue.phrases ?? [];

/**
 * Catalogue floor.
 *
 * An emptied or truncated phrase list makes every page pass. Without this the
 * cheapest way to make the gate green is to delete its contents, and the build
 * would report success. The floor is declared in the data file so shrinking the
 * list is a visible, reviewable edit to two numbers rather than one.
 */
if (PHRASES.length < (catalogue.minimum_phrase_count ?? 1)) {
  brokenGate(
    `phrase catalogue has ${PHRASES.length} entries, below the declared ` +
      `floor of ${catalogue.minimum_phrase_count}. ADR 0033 forbidden ` +
      `design 7 is the source — restore the list rather than lowering the floor.`,
  );
}

const COMPILED = PHRASES.map((p) => ({phrase: p, re: phraseRegex(p)}));

function findPhrases(text) {
  const hits = [];
  for (const {phrase, re} of COMPILED) {
    re.lastIndex = 0;
    const m = re.exec(text);
    if (m) hits.push({phrase, index: m.index, matched: m[0]});
  }
  return hits;
}

/**
 * Prove the detector still works, on every run, before trusting any clean
 * result. A zero-finding report from a detector that cannot detect is
 * indistinguishable from a zero-finding report from a clean site.
 */
function runSelfTest() {
  const failures = [];

  for (const [text, expected] of Object.entries(catalogue.must_match ?? {})) {
    if (text.startsWith('$')) continue;
    const hits = findPhrases(text).map((h) => h.phrase);
    if (!hits.includes(expected)) {
      failures.push(
        `positive control did not fire: ${JSON.stringify(text)} should match ` +
          `"${expected}" (matched: ${hits.length ? hits.join(', ') : 'nothing'})`,
      );
    }
  }

  for (const [text, notExpected] of Object.entries(
    catalogue.must_not_match ?? {},
  )) {
    if (text.startsWith('$')) continue;
    const hits = findPhrases(text).map((h) => h.phrase);
    if (hits.includes(notExpected)) {
      failures.push(
        `negative control fired: ${JSON.stringify(text)} must NOT match ` +
          `"${notExpected}" — the matcher has lost its word boundaries`,
      );
    }
  }

  if (failures.length) {
    brokenGate(
      'detector self-test failed, so no result from this run is\n  ' +
        'trustworthy:\n  - ' + failures.join('\n  - '),
    );
  }
  return (
    Object.keys(catalogue.must_match ?? {}).filter((k) => !k.startsWith('$'))
      .length +
    Object.keys(catalogue.must_not_match ?? {}).filter((k) => !k.startsWith('$'))
      .length
  );
}

// ---------------------------------------------------------------------------
// Registry-derived expectations
// ---------------------------------------------------------------------------

/**
 * The canonical product hosts and the declared maturity labels both come from
 * the pinned registry projection, not from constants here — a second
 * hand-maintained copy of either is the drift this whole ticket is about.
 */
function readRegistry() {
  let src;
  try {
    src = readFileSync(join(ROOT, 'src/generated/company-metadata.ts'), 'utf8');
  } catch (e) {
    brokenGate(`cannot read the generated company metadata — ${e.message}`);
  }
  const websites = [...src.matchAll(/website:\s*"([^"]+)"/g)].map((m) => m[1]);
  const lifecycles = [...src.matchAll(/^\s*\|\s*"([a-z_]+)"$/gm)].map((m) => m[1]);
  const catalog = [...src.matchAll(/\{id:\s*"([^"]+)"[^}]*lifecycle:\s*"([a-z_]+)"\}/g)].map(
    (m) => ({id: m[1], lifecycle: m[2]}),
  );
  if (!websites.length || !lifecycles.length || !catalog.length) {
    brokenGate(
      'could not parse websites, lifecycle members or catalog entries out of ' +
        'src/generated/company-metadata.ts — the generator shape changed, so ' +
        'this gate is reading nothing and would pass vacuously',
    );
  }
  return {websites, lifecycles, catalog};
}

/** The lifecycle -> rendered-label map, as an object. */
function readDeclaredLabels() {
  let src;
  try {
    src = readFileSync(join(ROOT, 'src/data/productLifecycle.ts'), 'utf8');
  } catch (e) {
    brokenGate(`cannot read src/data/productLifecycle.ts — ${e.message}`);
  }
  const block = src.match(
    /const LABELS: Record<ProductLifecycle, string \| null> = \{([\s\S]*?)\};/,
  );
  if (!block) {
    brokenGate(
      'could not parse the LABELS map out of src/data/productLifecycle.ts — ' +
        'the maturity rule would have nothing to compare against',
    );
  }
  const map = {};
  for (const m of block[1].matchAll(/([a-z_]+):\s*(?:'([^']*)'|null)/g)) {
    map[m[1]] = m[2] ?? null;
  }
  return map;
}

// ---------------------------------------------------------------------------
// HTML helpers
// ---------------------------------------------------------------------------

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) out.push(...walk(p));
    else if (name.endsWith('.html')) out.push(p);
  }
  return out;
}

/**
 * Attribute values, however the minifier chose to quote them.
 *
 * Docusaurus minifies the build and drops quotes from any attribute value that
 * does not need them, so `href=https://agent-assembly.com` and
 * `href="https://…?a=1&b=2"` both occur in the same page. A matcher written
 * only for the quoted form reads zero hrefs and reports every page clean — the
 * canonical-link rule did exactly that until a deliberately broken link failed
 * to trip it (AAASM-5616).
 */
function attrValues(html, attr) {
  const re = new RegExp(
    '\\b' + attr + '\\s*=\\s*(?:"([^"]*)"|\'([^\']*)\'|([^\\s"\'>]+))',
    'gi',
  );
  const out = [];
  let m;
  while ((m = re.exec(html))) out.push(m[1] ?? m[2] ?? m[3] ?? '');
  return out;
}

/**
 * Strip the parts of a page that are not prose a reader receives: scripts,
 * styles, and comments. Without this the gate reads minified bundles and
 * reports matches inside variable names.
 */
function visibleText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;|&#\d+;/gi, ' ')
    .replace(/\s+/g, ' ');
}

/** Meta values that a search result or a social card quotes on their own. */
function metaContents(html) {
  const out = [];
  const re = /<meta\b[^>]*>/gi;
  let tag;
  while ((tag = re.exec(html))) {
    const key = [...attrValues(tag[0], 'name'), ...attrValues(tag[0], 'property')][0];
    const value = attrValues(tag[0], 'content')[0];
    if (key && value && /description|title|og:|twitter:/i.test(key)) {
      out.push({key, value});
    }
  }
  return out;
}

/**
 * Inner text of every maturity pill, found by its axis-naming `title`.
 *
 * A regex stopping at the first `</span>` is wrong here and was: the section
 * card nests a visually-hidden `<span>` carrying the axis name inside the
 * badge, so the lazy match closed on the inner tag and returned the axis
 * prefix as if it were the label. Walking span depth is what makes the
 * extraction match the DOM the browser builds.
 */
function pillLabels(html) {
  const out = [];
  const open = /<span\b[^>]*\btitle\s*=\s*(?:"Portfolio stage[^"]*"|'Portfolio stage[^']*'|Portfolio)[^>]*>/gi;
  let m;
  while ((m = open.exec(html))) {
    const start = m.index + m[0].length;
    let depth = 1;
    const tag = /<\/?span\b[^>]*>/gi;
    tag.lastIndex = start;
    let t2;
    while (depth > 0 && (t2 = tag.exec(html))) {
      depth += t2[0].startsWith('</') ? -1 : 1;
      if (depth === 0) break;
    }
    if (depth !== 0) continue; // unbalanced markup: skip rather than guess
    out.push(
      visibleText(html.slice(start, t2.index))
        .replace(/Portfolio stage\s*:\s*/i, '')
        .replace(/\s+/g, ' ')
        .trim(),
    );
  }
  return out;
}

// ---------------------------------------------------------------------------
// The rules
// ---------------------------------------------------------------------------

const RULES = [
  {
    id: 'banned-absolute',
    run: (html) =>
      findPhrases(visibleText(html)).map(
        (h) =>
          `"${h.matched}" — ADR 0033 forbidden design 7. Unwaivable ` +
          `(ADR 0034 Decision 10); there is no approver for this.`,
      ),
  },
  {
    id: 'banned-absolute-metadata',
    run: (html) => {
      const out = [];
      for (const {key, value} of metaContents(html)) {
        for (const h of findPhrases(value)) {
          out.push(
            `<meta ${key}> contains "${h.matched}" — a metadata surface no ` +
              `bound travels to (ADR 0034 Decision 10, bound 3).`,
          );
        }
      }
      return out;
    },
  },
  {
    id: 'canonical-link',
    run: (html, ctx) => {
      const out = [];
      for (const href of attrValues(html, 'href')) {
        if (/github\.com\/AI-agent-assembly/.test(href)) {
          out.push(
            `${href} — organisation is 'ai-agent-assembly' (lowercase), and ` +
              `product discovery belongs on the canonical host, not a source tree.`,
          );
          continue;
        }
        const m = href.match(/^https?:\/\/([^/?#]+)/);
        if (!m) continue;
        const host = m[1].replace(/^www\./, '');
        if (/agent-assembly/.test(host) && !ctx.canonicalHosts.has(host)) {
          out.push(
            `${href} — host '${host}' is not a canonical product host in the ` +
              `registry (${[...ctx.canonicalHosts].join(', ')}).`,
          );
        }
      }
      return out;
    },
  },
  {
    id: 'maturity-vocabulary',
    run: (html, ctx) =>
      pillLabels(html)
        .filter((l) => l && !ctx.expectedLabels.has(l))
        .map(
          (l) =>
            `maturity label "${l}" is not one the pinned registry produces ` +
            `(expected one of: ${[...ctx.expectedLabels].join(', ')}). A pill ` +
            `hardcoded in markup bypasses the derivation the registry owns.`,
        ),
  },
];

// ---------------------------------------------------------------------------
// Rule-level self-test
// ---------------------------------------------------------------------------

/**
 * Every rule must fire on a page built to violate it, and stay silent on one
 * built not to. The phrase-matcher self-test above is not enough: it proves the
 * matcher works, not that the extractor feeding it reads anything. Three of the
 * four rules here were inert against real minified output while the matcher
 * passed its own tests, and the gate reported the site clean.
 */
function ruleSelfTest(ctx) {
  const good = [...ctx.expectedLabels][0] ?? 'Release candidate';
  const canonical = [...ctx.canonicalHosts][0] ?? 'agent-assembly.com';

  // Unquoted attributes on purpose — that is how the minifier emits them.
  const dirty = `<html><head>
<meta name="description" content="It governs every action an agent takes.">
</head><body>
<p>Agent Assembly cannot be bypassed.</p>
<a href=https://not-the-canonical-agent-assembly.example.com>x</a>
<a href="https://github.com/AI-agent-assembly">y</a>
<span title="Portfolio stage — axis"><span>Portfolio stage: </span>Totally Made Up</span>
</body></html>`;

  const clean = `<html><head>
<meta name="description" content="A company building governance-first systems.">
</head><body>
<p>It records what it decided.</p>
<a href=https://${canonical}>x</a>
<span title="Portfolio stage — axis"><span>Portfolio stage: </span>${good}</span>
</body></html>`;

  const failures = [];
  for (const rule of RULES) {
    if (rule.run(dirty, ctx).length === 0) {
      failures.push(
        `rule '${rule.id}' did not fire on a page built to violate it — it is ` +
          `inert, so a clean report from it means nothing`,
      );
    }
    const noise = rule.run(clean, ctx);
    if (noise.length > 0) {
      failures.push(
        `rule '${rule.id}' fired on a compliant page: ${noise[0]}`,
      );
    }
  }
  if (failures.length) {
    brokenGate(
      'rule self-test failed, so no result from this run is trustworthy:\n  - ' +
        failures.join('\n  - '),
    );
  }
  return RULES.length * 2;
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

const phraseControls = runSelfTest();
const {websites, lifecycles, catalog} = readRegistry();
const labelMap = readDeclaredLabels();

/**
 * The labels the registry can actually produce today: the rendered label for
 * each catalog product's declared lifecycle. Comparing the build against the
 * whole LABELS map would be circular — it would accept any label the map
 * happens to contain, including one just edited in. This accepts only what the
 * pinned registry's own lifecycle values map to, so a pill hardcoded in markup,
 * or a label attached to a lifecycle no product holds, is a finding.
 */
const expectedLabels = new Set(
  catalog
    .map((p) => labelMap[p.lifecycle])
    .filter((l) => typeof l === 'string' && l.length > 0),
);
if (!expectedLabels.size) {
  brokenGate(
    'no maturity label is derivable from the pinned registry, so the ' +
      'maturity rule would accept anything',
  );
}

const canonicalHosts = new Set(
  websites.map((w) => new URL(w).host.replace(/^www\./, '')),
);
const ctx = {canonicalHosts, expectedLabels, lifecycles};
const ruleControls = ruleSelfTest(ctx);

let pages;
try {
  pages = walk(BUILD_DIR);
} catch (e) {
  brokenGate(
    `cannot read the build directory at ${BUILD_DIR} — run \`pnpm build\` ` +
      `first. (${e.message})`,
  );
}
if (!pages.length) {
  brokenGate(`no HTML found under ${BUILD_DIR} — nothing was checked`);
}

const findings = [];
for (const page of pages) {
  const rel = relative(ROOT, page);
  const html = readFileSync(page, 'utf8');
  for (const rule of RULES) {
    for (const detail of rule.run(html, ctx)) {
      findings.push({rule: rule.id, page: rel, detail});
    }
  }
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

console.log(
  DIM(
    `checked ${pages.length} page(s) against ${PHRASES.length} banned ` +
      `phrase(s), ${expectedLabels.size} registry-derived maturity label(s), ` +
      `and ${canonicalHosts.size} canonical host(s); ` +
      `${phraseControls} phrase control(s) and ${ruleControls} rule control(s) passed`,
  ),
);

if (!findings.length) {
  console.log(GREEN('✓ no product-claim findings'));
  process.exit(0);
}

const byRule = new Map();
for (const f of findings) {
  if (!byRule.has(f.rule)) byRule.set(f.rule, []);
  byRule.get(f.rule).push(f);
}
console.error(RED(`✗ ${findings.length} product-claim finding(s)\n`));
for (const [rule, items] of byRule) {
  console.error(RED(`  [${rule}]`));
  for (const f of items) console.error(`    ${f.page}\n      ${f.detail}`);
  console.error('');
}
console.error(
  DIM(
    '  See design/product-narrative-hierarchy.md for what this site may ' +
      'claim and why.',
  ),
);
process.exit(1);
