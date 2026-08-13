---
adr: "0034"
adr_url: "https://github.com/ai-agent-assembly/agent-assembly/blob/HEAD/docs/src/adr/0034-one-product-truth-and-cross-repository-documentation-governance.md"
adr_revision: "AAASM-5671"
repository: "horonomy/official-website"
truth_layers: ["T7"]
content_layers: ["L0"]
claim_namespaces: []
owners:
  truth-owner-company: "@Chisanan232"
enforcement:
  pull_request: "CI / build → Check product claims (.github/workflows/ci.yml)"
  release_gate: "none"
  note: >-
    There is no release gate because there is no release: deploy.yml publishes
    to Cloudflare Pages on push to main, and is dormant until
    CLOUDFLARE_DEPLOY_ENABLED is set. The claim gate runs on pull requests and
    on main, so the tree that deploys is the tree that was checked.
local_adrs: []
exceptions: []
last_reviewed_version: "0.0.0"
last_reviewed_date: "2026-08-13"
---

# Truth adoption record

This repository adopts [ADR 0034][adr] as the canonical product-truth and
cross-repository documentation governance decision. The full decision lives in
`ai-agent-assembly/agent-assembly` and is **not** reproduced here — copying it
is forbidden design 1, and this record is the sanctioned alternative.

This repository is in a **different GitHub organisation** from the one that
owns the ADR. That changes nothing about the adoption: ADR 0034's adoption
matrix lists it as requiring a record, and
[AAASM-5616](https://lightning-dust-mite.atlassian.net/browse/AAASM-5616) and
[AAASM-5655](https://lightning-dust-mite.atlassian.net/browse/AAASM-5655) own
the crossing.

> **Naming note.** The adoption matrix lists this repository as
> `horonomy/horonomy-official-website`. Its actual name is
> `horonomy/official-website`; the local checkout directory carries the longer
> form. The `repository` field above is the real one, because that is what a
> validator resolves.

## Responsibilities

This repository sits at **T7** — the outermost truth layer and the lowest
authority in the hierarchy — and at **L0**, the company site. Where it and any
lower-numbered layer disagree about the same fact, the lower-numbered layer
wins and **this repository is the one that changes**.

| Content type | This repository | Canonical owner |
| --- | --- | --- |
| Company purpose, principles, long-term direction | **Authors** | This repository |
| The product portfolio and its ordering | **Authors** | This repository, from the pinned registry |
| Each portfolio entry's coarse stage (portfolio-lifecycle axis) | **Authors** | The pinned company registry, `horonomy/.github` |
| A bounded capability summary that narrows a verified lower-layer fact | **Restates** | `official-website` (T6) and, beneath it, the Core manifest (T2) |
| Product promise and positioning | Restates | `ai-agent-assembly/official-website` — homepage and `/product` |
| Product architecture, capability status, platform support | **Must not author** | `ai-agent-assembly/agent-assembly` (T1/T2/T4) |
| Enforcement and claim vocabulary | **Must not author** | ADR 0033 §6 |
| Documentation-area maturity labels | **Must not author** | Docs Hub `source-of-truth.md` |
| Integration steps, quick-starts, API reference | **Must not author** | The SDK and Core documentation |
| Commercial availability, pricing, dates, SLAs | **Must not author** | Not published here at all |

The operative rule, in one line: **an upper layer may simplify an approved
lower-layer fact and may never broaden it.** The company-level format that
satisfies it, and the review procedure, are in
`design/product-narrative-hierarchy.md`.

## Claim namespaces

**None.** This repository authors no claim in any capability namespace. Every
product statement here restates one owned elsewhere, so the correct value is
the empty list rather than a namespace nobody granted.

A consequence worth stating plainly: if a sentence here has no canonical source
beneath it, the remedy is to delete the sentence or to get the claim published
at the layer that owns it — never to declare a namespace here.

## Owners and reviewers

| Reviewer class | Filled by | Reviews |
| --- | --- | --- |
| `truth-owner-company` | `@Chisanan232` (via `.github/CODEOWNERS`) | Any change to product copy, product metadata, maturity labels, or canonical links |

> **Known divergence from ADR 0034 Decision 9.** That decision requires reviewer
> **classes** filled by a team or group, never an individual. This repository's
> `CODEOWNERS` names one person, because the Horonomy organisation has no team
> configured for this repository. It is recorded here rather than papered over
> with a team name that does not exist: a record naming a non-existent team
> would pass a validator and route no review. Resolving it means creating the
> team, which is an organisation-level change outside this ticket.

A material truth change requires approval from the owning class. A waiver would
additionally require a `waiver-approver` who is not the author — see below for
why none exists here.

## Enforcement

| Scope | Mechanism |
| --- | --- |
| Pull request | `CI / build` → **Check product claims** (`pnpm check:claims`), after `pnpm build` |
| Push to `main` | The same job — `deploy.yml` publishes from `main`, so the deployed tree is gated too |
| Release gate | none — this site has no release; it deploys continuously from `main` |

`scripts/check-product-claims.mjs` checks four things: banned absolutes in
published prose, banned absolutes in page metadata, product links against the
registry's canonical host, and maturity labels against what the pinned registry
can actually produce. It runs **offline** by requirement, so company-site
deployment cannot be blocked by another service being unavailable.

It deliberately does **not** attempt ADR 0034 §2.2's widening comparison. That
needs the eight-dimension claim tuple resolved against a row, and T3 — the
Approved Claims Registry — does not exist. Widening review is human here, using
the eight-move table.

Evidence that the gate fails when it should is recorded in
`design/validation-reports/AAASM-5616/gate-control-run.txt`.

## Exceptions

**None, and for two of the four categories none is possible.**

ADR 0034 Decision 10 places factual truthfulness and ADR 0033's banned
absolutes outside the waiver mechanism entirely. A waiver may reach process,
timing or review sequencing — controls whose cost is delay — and may never
reach whether a statement is true. There is no `waiver-approver` for an
unsupported absolute, because there is no waiver for one to approve.

Since the banned-absolute rule is the main thing enforced here, the exceptions
table is empty by construction rather than by luck.

| id | rule | text | scope | justification | evidence | approver | issued | expires |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |

## Local ADRs

`adr/0001-hosting-and-repo-visibility.md` exists but concerns repository
hosting and visibility, does not cite ADR 0034, and makes no product-truth
decision — so it is not listed in the `local_adrs` front-matter field, which
records repository-specific ADRs that cite ADR 0034.

`design/product-narrative-hierarchy.md` is **not** a local ADR either, and that
is deliberate: ADR 0034 Decision 5 forbids a local ADR that restates the
T-hierarchy, the claim tuple, the comparison rules or the ownership
assignments, and a document about the hierarchy cannot avoid restating it. It
is contributor documentation that cites the canonical decision.

## Open items carried from AAASM-5615

- **`discontinued` has no member** on the portfolio-lifecycle axis. The
  vocabulary is generated from the pinned registry in `horonomy/.github`, so
  adding one is an upstream change, not a local edit.
- **F12 — a scoping collision.** `content-ownership.md` quotes this site's
  product blurb as the worked example of a compliant L0 summary (2026-08-06).
  AAASM-5585 removed the same framing from the *product website's homepage
  hero* (2026-08-08), and that site's claim gate now carries a `rejected-hero`
  class matching the blurb literally. The rejection is scoped to an L1 hero
  position by its own rationale, so the blurb stands and this repository's gate
  does not import that class. Filed for a ruling by the owners of
  `content-ownership.md` and AAASM-5585.

## Last reviewed

Against ADR 0034 revision `AAASM-5671`, at `0.0.0`, on `2026-08-13`.

[adr]: https://github.com/ai-agent-assembly/agent-assembly/blob/HEAD/docs/src/adr/0034-one-product-truth-and-cross-repository-documentation-governance.md
