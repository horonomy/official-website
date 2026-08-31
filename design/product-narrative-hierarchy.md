# Horonom → product narrative hierarchy

How the company site talks about a product it does not own the truth about.

**Status:** Accepted · **Ticket:** [AAASM-5615](https://lightning-dust-mite.atlassian.net/browse/AAASM-5615) · **Applies to:** every product surface on `horonom.com`

---

## Why this document exists

Horonom is a company. Agent Assembly is a product. The two have separate
websites, separate repositories and — since the product lives in a different
GitHub organisation — separate review populations. That separation is what makes
the failure mode available: this site can publish a sentence about Agent Assembly
that is broader than anything Agent Assembly's own sources support, and nobody in
either review population is looking at both halves.

This document fixes the boundary so a contributor here does not have to
re-derive it, and so the next product added to the portfolio inherits the answer
instead of re-litigating it.

### What this document is not

It is **not** a local ADR, and it deliberately does not become one. ADR 0034
Decision 5 permits a repository-local ADR only for a genuinely
repository-specific implementation decision, and forbids one that restates or
re-orders the truth hierarchy, the claim tuple, the comparison rules or the
ownership assignments. A document whose subject *is* the hierarchy cannot meet
that bar. So this is contributor documentation that **cites** the canonical
decision; it invents no rule of its own, and where it disagrees with a source in
[Sources](#sources), the source wins and this file is what changes.

The machine-readable half — the adoption record ADR 0034 Decision 4 requires at
`TRUTH-ADOPTION.md` — is [AAASM-5616](https://lightning-dust-mite.atlassian.net/browse/AAASM-5616)'s,
not this document's.

---

## 1. Where this site sits

ADR 0034 Decision 1 places `horonomy/official-website` at **T7**, the outermost
of seven truth layers, and `content-ownership.md` places it at **L0**, the
outermost of seven content layers. Both are the far end: the furthest surface
from the evidence, and the one whose readers have the least context in which to
notice an implied scope.

Two consequences follow, and they pull in opposite directions.

**This site is allowed to be short.** Simplification is the job of an outer
layer, not a concession it makes. A company page that reads like component
documentation has moved content to the wrong layer.

**This site is the least able to afford an unbounded sentence.** T7 is the lowest
authority in the hierarchy: where this site and any lower-numbered layer state
incompatible things about the same fact, the lower-numbered layer wins and *this
site is the one that changes*. Nothing here authors product truth. Everything
here restates it.

---

## 2. The boundary

`content-ownership.md`'s L0 row is the authority for this table; it is reproduced
here in the terms a contributor to this repository will meet.

| | Horonom owns (author it here) | Agent Assembly owns (restate only) |
|---|---|---|
| **Purpose** | Why the company exists; the thesis about autonomy needing structure | Why the product exists; the pain it addresses |
| **Principles** | The company's engineering and ethical principles | The product's design rationale and architecture |
| **Portfolio** | Which products exist, their order, their coarse stage | A product's internal roadmap and release plan |
| **Direction** | The company's long-term direction, stated as intent | Any dated commitment about product capability |
| **Capability** | A **bounded capability summary** that narrows a verified lower-layer fact | The capability itself, its status, evidence and limits |
| **Maturity** | Each portfolio entry's **coarse stage** on the portfolio-lifecycle axis (§5) | Per-capability status, platform support, documentation-area maturity |
| **Adoption** | Nothing | Integration steps, quick-starts, SDK usage, code samples |

Read the right-hand column as a prohibition, because that is how the L0 row
states it. This site **must not author** a per-capability status, a platform
claim, integration instructions, or any statement that widens.

### Company direction is not a product commitment

The one place the left column can quietly become the right column is
long-term direction. Company intent — *we believe autonomous systems need
explicit boundaries* — is Horonom's to state. The same sentence acquires a
product subject the moment it names a capability, a date or an availability, and
at that point it is a product roadmap claim, which ADR 0034 hand-off 4 assigns to
the product website, not here.

The test is mechanical: **if a reader could act on it — evaluate, budget, plan a
migration, or wait for it — it is a product commitment and does not belong on
this site.**

---

## 3. The one rule

> An upper layer may **simplify** an approved lower-layer fact. It may never
> **broaden** it.

That is ADR 0034 Decision 2, and it is the whole of this document compressed to
one sentence. `content-ownership.md` states the operational form:

> A derivative may drop **detail**. It may not drop a **bound**.

Detail is a fact a reader does not need in order to act correctly. A bound is a
fact that, if removed, lets a reader act correctly on a case the canonical source
excludes.

### The first-pass question

> Is there a situation in which a reader who read only this page would act, and a
> reader who read the canonical product source would not?

A **yes** is conclusive — the sentence widened, however carefully it is worded. A
**no** is *not* conclusive: two of the recurring widening moves slip past it, and
it cannot see understating at all. Understating is also an error; it is simply
the less dangerous one.

So the question is a filter. The review is the eight-move table in
`content-ownership.md` → *Moves that widen a claim*. Walk it and, for each move,
state what the sentence keeps. The moves most likely to bite on this site are
**dropping a precondition**, **unbounding a scope**, **promoting a claim term**
and **aggregating partial coverage into a whole**.

### Absolutes are not available here

ADR 0033 forbidden design 7 bans a specific list of unqualified absolutes from
product descriptions. That ban is **unwaivable** — ADR 0034 Decision 10 places it
outside the waiver mechanism entirely. No approver, expiry, named owner or
fail-closed renewal makes an unsupported absolute publishable. There is no
`waiver-approver` to ask, because there is no waiver to approve.

The single route to publishing one of those phrases is that it stops being
banned, through an evidence-backed amendment to ADR 0033 in the
`agent-assembly` repository. That is a product decision and it is not this site's
to make.

The list itself is not reproduced here. It is a literal-match list feeding a CI
gate, and a copy of it in this repository is a copy that goes stale silently;
read it from ADR 0033 forbidden design 7, which is its only source.

---

## 4. The approved company-level product summary

This is the format every current and future portfolio entry uses.

### The five requirements

1. **Nouns, not verbs with objects.** Name what the product deals in. A noun
   asserts that a capability exists; a verb with an object additionally invites
   the reader to infer *which* cases, *when*, and *how far*. Under ADR 0034
   §2.0's substitution test, a noun phrase collapses to "this capability exists"
   and is a **capability mention** — outside the governed-claim test altogether.
   The same content as a verb with an object is a **governed claim** and must
   then survive the full eight-dimension comparison.
2. **A canonical link in the same block.** Not in a footer, not in a
   further-reading list. ADR 0034 §2.3 makes this a locality requirement with a
   machine-checkable radius: the same Markdown block-level element, list item,
   table row or admonition. Anything outside that radius does not count, and the
   omitted dimensions are then read at their **broadest** admissible value.
3. **The maturity label the registry carries**, on the portfolio-lifecycle axis,
   derived — never typed as a literal. See §5.
4. **No platform, no quantifier over coverage, no absolute.** Those are the three
   additions that turn a compliant summary into a widening, and none of them
   touches the nouns. What gets attached is the risk, not the vocabulary.
5. **No precondition dropped.** If the product's own source bounds a statement by
   a routing, launch, configuration or opt-in step, this site either carries the
   bound or does not make the statement. Carrying half of it is the failure.

### The sanctioned example

The Agent Assembly card blurb currently reads:

> A governance layer for AI agents — permissions, approval checkpoints, and evidence.

This exact sentence is quoted in `content-ownership.md` as the **worked example
of a compliant L0 summary**, so it is not merely acceptable here — it is the
reference the canonical source itself points at. It is compliant because each
noun maps onto an ADR 0033 §6 claim term without claiming a scope for it:

| Noun on this site | ADR 0033 §6 term it maps to |
|---|---|
| permissions | **Evaluated** |
| approval checkpoints | **Approval required** |
| evidence | **Observed** |

It attaches no status, no platform and no claim about how far any of them
reaches. That is the construction to copy.

### Constructions that fail

- A definite article over an unbounded scope — *"the runtime boundary"*, *"the
  audit log"* — where the product's source bounds the same fact to a configured
  path or a named sink. This is *unbounding a scope*.
- A verb with an object and no precondition — *"decides which tools an agent may
  use"* — where the product's source states the routing or configuration the
  decision depends on. This is *dropping a precondition*, and under ADR 0034
  §2.2 a dropped D2 conjunct is a **broadening**, the blocking severity.
- A list of categories that reads as the full set. This is *aggregating partial
  coverage into a whole*.
- An adjective in place of a measured number — *fast*, *negligible overhead*.
  Rule M in ADR 0034 §2.2 handles measurements, and this site should simply not
  carry them.

---

## 5. Three axes, and which one a label is on

This is the section a reviewer should read twice, because conflating two of these
three is the defect that recurs.

ADR 0034 hand-off 7 settles it: **there are three vocabularies, not two**, and
they range over three different subjects. No axis may be applied to another's
subject.

| Axis | Vocabulary | Owner | Ranges over |
|---|---|---|---|
| **Behaviour on evidence** | ADR 0033 §6's eleven claim terms | ADR 0033 §6 (`agent-assembly`) | One **action** on one host, at one time |
| **Documentation-area maturity** | `🧪 Release candidate`, `🗺️ Planned` | Docs Hub `source-of-truth.md` | One **area of Agent Assembly documentation** |
| **Portfolio lifecycle** | `available`, `beta`, `release_candidate`, `coming_soon` | **This site's pinned product registry** | One **product in the Horonom portfolio** |

Concretely: a portfolio-lifecycle value says nothing about a documentation area;
a documentation-area label says nothing about an action's behaviour; and a §6
term says nothing about how finished anything is. A `release_candidate` product
can be *Unsupported* on a platform, and a shipped capability can be *Unmeasured*
on a path.

**Wherever a maturity label appears on this site, the axis it belongs to must be
recoverable by the reader.** A bare pill reading *Release candidate* with nothing
naming its axis is the conflation this table exists to prevent.

### The portfolio-lifecycle axis is this site's own

Of the three, exactly one belongs to Horonom. Its four members are declared in
`src/generated/company-metadata.ts` as the `ProductLifecycle` union and rendered
by `src/data/productLifecycle.ts`:

| Member | Rendered label | Means, on this axis |
|---|---|---|
| `available` | *(no label)* | Generally available. A qualifier here would understate it |
| `beta` | Beta | Released for use, still stabilising |
| `release_candidate` | Release candidate | A candidate build for a release, not yet the final one |
| `coming_soon` | Coming soon | In the portfolio, not yet released |

ADR 0034 hand-off 7 **ratifies** this set — including its reuse of the Docs Hub's
exact `Release candidate` wording, which it records as a genuine coincidence at
product level and a deliberate refusal to coin a fourth spelling. It is *not* a
shared definition: each axis keeps its own, and neither cites the other as its
source. Where they diverge, each is right about its own subject.

The ADR is explicit that nothing in it obliges this site to change.

### Two words this axis deliberately does not use

AAASM-5615's scope line names four intents — *active*, *experimental*, *planned*
and *discontinued*. Three of them are satisfied by members that already exist,
and they are **mapped, not renamed**:

| Intent | Member on this axis | Why not the scope word |
|---|---|---|
| active | `available` | Same state, existing ratified spelling |
| experimental | `beta` | **`Experimental` is an ADR 0033 §6 term** on the behaviour-on-evidence axis. Spelling a portfolio state with it invites exactly the cross-axis read hand-off 7 forbids |
| planned | `coming_soon` | **`Planned` is an ADR 0033 §6 term** *and* a Docs Hub documentation-area label. It is the single most overloaded word in this vocabulary space; a third meaning is the worst available choice |
| discontinued | **none — gap, see below** | |

`release_candidate` reusing the Hub's wording is ratified because hand-off 7
ratified it on the evidence. `experimental` and `planned` have no such ruling,
and both would collide with a term ADR 0033 §6 owns rather than with a
coincidental label. Adopting them would be a change, not a coincidence.

### The `discontinued` gap

There is no member for a retired product, and this repository cannot add one.

`src/generated/company-metadata.ts` is generated, not authored: it is a
projection of the pinned company registry in **`horonomy/.github`** at
`metadata/generated/company.json`, and `scripts/generate-company-metadata.mjs`
fails closed on drift. AAASM-5655 requires that the derivation stay intact —
whatever ships must still come from the registry rather than being
hand-maintained.

So a `discontinued` member is a change to the upstream registry vocabulary in a
different repository. It is **recorded here as a known gap and escalated**, not
invented locally. Until the registry declares it, no product on this site may be
labelled discontinued — and because `productLifecycle.ts` types its label map as
`Record<ProductLifecycle, …>` rather than a partial map, a new registry member
will fail this repository's build until someone names it on the page. That is the
intended behaviour and should not be softened to a partial map.

### What this section does not do

It does not carry the decision across to the Docs Hub, and it does not edit
`source-of-truth.md` or the registry. Naming the axes on *both* surfaces with a
cross-reference is
[AAASM-5655](https://lightning-dust-mite.atlassian.net/browse/AAASM-5655)'s, and
that ticket is still open. Nothing here contradicts it: this document names the
axis on the Horonom side and leaves the crossing where 5655 owns it.

---

## 6. Cross-site handoff

A visitor arriving at `horonom.com` should be able to tell, without reading
carefully, that Agent Assembly is a product with its own home, and should be able
to get there.

**The canonical product URL is the `agent-assembly.com` apex.** ADR 0007
(*Public Domain & URL Contract*, `agent-assembly`) fixes it as the primary public
marketing host. It is stored bare, with no trailing slash, in the company
registry's `website` field, and `products.ts` renders that value verbatim into an
accessible name — a trailing slash would be spoken aloud.

A handoff must carry four things:

1. **The canonical destination**, from the registry — never a hand-typed URL, and
   never the GitHub organisation as a substitute for the product home. Source
   validation and product discovery are different journeys; GitHub is a separate,
   secondary link.
2. **Enough context that the destination is not a surprise.** The link's
   accessible name should name the product and the host it opens.
3. **The maturity label**, on the portfolio-lifecycle axis, with its axis
   recoverable.
4. **UTM parameters on cross-hostname links only.** Same-hostname anchors carry
   none. The `utm_source` / `utm_medium` / `utm_campaign` triple is fixed per the
   established convention; only `utm_content` varies by on-page location.

What the handoff must **not** do is answer the product's questions here. Pricing,
availability, platform support, integration steps and capability status live on
the product's own surfaces. A visitor who wants them should arrive there, not
read a summary of them written by a layer with no authority to author them.

---

## 7. Adding a future product to the portfolio

The hierarchy is meant to survive the second and third products, so the procedure
is written as a checklist rather than as prose about Agent Assembly.

1. **Add the product to the upstream registry first** (`horonomy/.github`), with
   its `id`, `name`, `website`, `githubOrg` and `lifecycle`. Then re-pin and
   regenerate `src/generated/company-metadata.ts`. Never hand-edit the generated
   module; never introduce a product to the page that the registry does not know.
2. **Write the summary in the §4 format** — nouns, canonical link in the same
   block, derived maturity label, no platform, no quantifier over coverage, no
   absolute.
3. **Identify the canonical source for every claim in it.** If the product has no
   published source that supports a sentence, the sentence does not ship. A claim
   traceable only to another marketing page is not traceable.
4. **Walk the eight-move table** and record, per move, what the summary keeps.
5. **Check the axis** — the label is a portfolio-lifecycle value, and the page
   makes that recoverable.
6. **Check the handoff** — canonical URL from the registry, UTM on cross-hostname
   links only.
7. **Verify at 1440px and 390px.** The portfolio is a card grid; a new entry
   changes the wrap, and the label pill is the element most likely to reflow.

A product with no public website yet takes `lifecycle: coming_soon`, a `null`
`website`, and a non-interactive card. It gets no capability summary at all —
there is no canonical source to narrow, and a summary with nothing beneath it is
the case this hierarchy exists to prevent.

---

## 8. Where a correction goes first

When this site and a product source disagree, the correction does **not**
default to this site's copy deck.

1. **Is the disagreement about observable behaviour of the current tree, or about
   the intended contract?** Behaviour → the code wins and the document is
   corrected. Contract → the ADR wins and the divergence is a bug in the code.
   This is ADR 0034 Decision 1's carve-out, and it is why "whatever shipped is
   correct" is not the rule.
2. **If the product's source is wrong**, the correction lands in the product's
   repository first. This site does not route around it by publishing the
   corrected version early — that creates the rival truth the hierarchy exists
   to remove.
3. **If this site is wrong**, it is corrected here, and no ticket is needed
   elsewhere. T7 changing to match a lower layer is the hierarchy working.
4. **If this site is broader than its source**, that is this repository's defect
   regardless of which reads better. Narrow it.

---

## 9. Conformance findings

Applying §§3–6 to `origin/main` produced the findings below. They are
**recorded, not remediated** — remediation is
[AAASM-5616](https://lightning-dust-mite.atlassian.net/browse/AAASM-5616)'s.
Severities are ADR 0034 §2.2's: *blocking* means a dropped bound or a strength
value above the canonical row; *finding* means it is recorded and resolved before
the surface is published at a release tag.

Each row was compared against the product's own wording on `agent-assembly.com`,
read from `ai-agent-assembly/official-website` at `origin/main`. A claim
traceable only to another marketing page is not traceable, so the canonical
quote is carried here rather than referenced.

### Blocking

**F1 · The hero subhead drops the routing precondition.**
`HeroCopy.tsx` says Agent Assembly *"defines the runtime boundary where AI agents
can act"*. The product's own promise is:

> Agent Assembly evaluates the actions you route through it against your policy,
> refuses them, or blocks them pending a decision, and records what it decided.
> An action you have not routed through it is not inspected — and the record
> says so.

The product website declares its headline and subheadline **non-severable** at
the source, precisely because the headline alone reads as a claim over all agent
behaviour. This site states the capability with the bound removed entirely: a
dropped D2 conjunct, which ADR 0034 §2.2 grades blocking. It is also the
first-pass question's conclusive *yes* — a reader of this page would assume an
unrouted agent is covered; a reader of the product page would not.

**F2 · The product card claims budget enforcement the product records as
`Unmeasured`.** `Sections/index.tsx` says it *"decides which tools, domains, and
budgets an agent may use"*. On budgets, the product's own page carries the
ADR 0033 §6 term **Unmeasured** and says:

> Whether a declared cap is checked in the decision path is not established by
> any evidence row, so the honest term for the enforcement is Unmeasured — the
> claim above is about what a policy can declare, not about what stops a call.

Restating *Unmeasured* as a decision verb is a D8 strength value above the
canonical row. Blocking.

**F3 · The product card claims human review, which the product says is not
available.** The same sentence says it *"holds risky actions for human
review"*. The product's own bound reads:

> No shipped operator surface can answer the queue the hold blocks on, so in
> practice it blocks and then refuses at the timeout with no person involved.
> Do not plan on human review yet — tracked as AAASM-5657.

This is the failure AAASM-5615's acceptance criteria name directly: a company
statement implying a product capability that is not available. It is the most
serious row here, because a reader could act on it — an evaluator could choose
this product expecting a human-approval workflow.

Note the contrast with the hero card's *"approval checkpoints"*, which is a
**noun** and therefore a capability mention: it asserts the capability exists,
which is true, without asserting that a human answers it. The two surfaces state
the same subject at two different strengths, and only the verb form overreaches.

### Findings

| # | Surface | Observation |
|---|---|---|
| F4 | Maturity pills, all surfaces | *Release candidate* renders with nothing naming its axis. A reader cannot tell it is a portfolio-lifecycle value rather than the Docs Hub's documentation-area label of the same spelling (§5) |
| F5 | `products.ts` | `comingSoon?: boolean` is hand-written and independent of the registry's `lifecycle`. Two sources for one fact; nothing asserts they agree |
| F6 | `ConstellationMap.tsx` | States product status implicitly (*"in development"*) and reads no registry value — a third surface that can disagree with the other two |
| F7 | `docs/intro.md`, `blog/2026-07-03-welcome.md`, `blog/authors.yml` | Agent Assembly links point at `https://github.com/AI-agent-assembly` — wrong casing, and the GitHub organisation rather than the ADR 0007 canonical apex |
| F8 | `src/pages/index.tsx` `<meta description>` | Predates the governance repositioning. A description is a metadata surface: it travels into a search result without its bound, so it must be self-bounding or carry no coverage claim |
| F9 | `src/components/Hero/` | Dead code, imported nowhere, still carrying the `AGENT INFRASTRUCTURE` category AAASM-5614 rejected. It typechecks and builds, so nothing catches it |
| F10 | CI | No content or claim gate exists. `pnpm typecheck` and `pnpm build` do not read copy, and `onBrokenLinks: 'throw'` checks internal links only |

### Escalated

**F11 · No `discontinued` member.** Owned upstream in `horonomy/.github`; see §5.

**F12 · The sanctioned L0 example and the product site's claim gate now
disagree, and neither has been reconciled.**

`content-ownership.md` quotes this site's blurb — *"A governance layer for AI
agents — permissions, approval checkpoints, and evidence."* — as the **worked
example of a compliant L0 summary**, and argues for it on the grounds that its
nouns attach no scope. That text was committed **2026-08-06**.

Separately, AAASM-5585 removed *"a governance layer for AI agents"* from the
**product website's homepage hero** on **2026-08-08**, and the product site's
claim gate now carries a `rejected-hero` class whose `governance {unit} for`
template matches this site's blurb literally.

These are not obviously in conflict — the rejection is scoped by its own
rationale to a hero position on L1, where the product must state its own promise
with the routing bound attached, and the L0 argument is about a different
position on a different layer. But the rejection post-dates the sanction, and no
source reconciles them.

Two consequences, and neither is this document's to decide alone:

1. **The blurb stays** until a source rules otherwise. `content-ownership.md` is
   the surface ADR 0034 assigns ownership of the L0 row, its L0 argument is
   explicit, and nothing has rebutted it. Changing L0 copy on the strength of an
   L1 hero decision would be this site substituting its own reading for a
   canonical one.
2. **A claim gate here must not import the `rejected-hero` class.** That class is
   L1-scoped; importing it would fail the build on the exact sentence the
   canonical source holds up as the compliant L0 example. AAASM-5616 must scope
   its gate to the classes that bind every layer — ADR 0033 forbidden design 7's
   banned absolutes above all — and leave L1-position rulings to L1.

Raised for a ruling by the owners of `content-ownership.md` and AAASM-5585.

---

## Sources

Everything above is a restatement of one of these. None of it is authored here.

| Source | Repository | What it settles |
|---|---|---|
| ADR 0034 — *One Product Truth & Cross-Repository Documentation Governance* | `ai-agent-assembly/agent-assembly`, `docs/src/adr/` | The T-hierarchy (T7 = this site), the narrowing rule, the claim tuple, waiver semantics, the adoption record, hand-off 7's three axes |
| ADR 0033 §6 — *Claim vocabulary* | `ai-agent-assembly/agent-assembly`, `docs/src/adr/` | The eleven claim terms. Forbidden design 7 carries the banned absolutes |
| `content-ownership.md` (AAASM-5592) | `ai-agent-assembly/agent-assembly`, `docs/src/development/` | The L0 row, the eight-move widening table, the worked compliant-L0-summary example |
| Product promise and message hierarchy (AAASM-5582) | `ai-agent-assembly/official-website` | The product's own bounded promise, which this site narrows |
| `/product` and `/how-it-works` (AAASM-5586) | `ai-agent-assembly/official-website` | The product's own architecture and capability wording |
| ADR 0007 — *Public Domain & URL Contract* | `ai-agent-assembly/agent-assembly`, `docs/src/adr/` | `agent-assembly.com` as the canonical product host |
| Pinned company registry (AAASM-5520) | `horonomy/.github`, `metadata/generated/company.json` | The portfolio, and the portfolio-lifecycle vocabulary |
