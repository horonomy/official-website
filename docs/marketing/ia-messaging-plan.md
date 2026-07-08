---
title: IA and messaging plan — Horonomy, Agent Assembly, and Docs
description: Planning spec that defines the job, audience, CTAs, navigation, and GA4 event mapping for each of the three public surfaces.
status: draft
ticket: HORO-40
epic: HORO-39
---

# IA and messaging plan — Horonomy, Agent Assembly, and Docs

> Planning deliverable for Epic **HORO-39** (Marketing analytics foundation).
> This document is a spec, not a copy rewrite. Downstream implementation
> tickets (HORO-41, HORO-42, HORO-48) consume specific sections of this plan.

## 1. Purpose and scope

### 1.1 Why this document exists

Three public web surfaces are being built or refined in parallel:

| Surface | Repo | Public URL |
|---|---|---|
| Horonomy company site | `horonomy/official-website` | `horonomy.dev` |
| Agent Assembly product site | `ai-agent-assembly/official-website` | `agent-assembly.com` |
| Agent Assembly docs | `ai-agent-assembly/agent-assembly-docs` | `docs.agent-assembly.com` |

Without an explicit contract between these surfaces, they will drift — copy
will overlap, CTAs will compete, and GA4 will not be able to attribute intent
back to a specific journey. This plan fixes each surface's job, primary
CTAs, navigation shape, and the GA4 events its pages must fire, so the
downstream implementation tickets (HORO-41 for Horonomy, HORO-42 for Agent
Assembly, HORO-48 for docs) can execute against a shared spec rather than
re-derive positioning per repo.

### 1.2 Scope

**In scope**

- The differentiated job of each surface, expressed in one sentence.
- Primary audience, primary CTAs (1–3 per surface), suggested top-level nav.
- Page-level messaging principles that apply across all three surfaces.
- A GA4 event-mapping table drawn from the Epic (HORO-39) event list,
  page → event bindings that HORO-45 will finalize.
- Explicit handoff notes tying sections to downstream tickets.

**Out of scope**

- Full copy rewrites. This plan is a spec; copy will be written in the
  downstream tickets and reviewed against this plan.
- Visual design decisions beyond what the existing `design/` system already
  fixes (colours, type, mascot, threshold logic).
- The GA4/GTM implementation details (tag templates, GTM containers,
  DebugView validation) — those are HORO-45's deliverable. This plan only
  names the events and where they fire.
- Paid-acquisition strategy, SEO topic clusters, and campaign UTM
  conventions — those are separate Wave 2/3 tickets under HORO-39.

### 1.3 Guiding constraints (from Epic HORO-39)

- The product must be understandable in **under 10 seconds** on the Agent
  Assembly landing page.
- The Cloud path is described as **early access / design partner** — never
  as an available SaaS product (no fake-door language).
- Agent Assembly is positioned as **governance / runtime boundary
  infrastructure**, not "yet another agent framework".
- Events must distinguish low-intent traffic from real developer or buyer
  intent. No PII in event names, parameters, or values.

## 2. Surface roster

Each surface has exactly one primary job. Anything the surface does
beyond that job must strengthen the primary job — not compete with it.

### 2.1 Horonomy (`horonomy.dev`)

**Primary job.** Establish Horonomy as an AI-native company building
governance-first systems for autonomous software, then route
high-intent visitors into Agent Assembly.

**Primary audience.** In priority order:

1. Founders, technical evaluators, and investors assessing what
   Horonomy is and why it exists.
2. Prospective early-stage partners (design partners, advisors).
3. Developers who arrived via GitHub org page or a founder post and
   want to find the actual product surface (Agent Assembly).

**Primary CTAs (max 3).**

1. **Explore Agent Assembly** — hero primary. Cross-hostname link to
   `agent-assembly.com` with UTM (`utm_source=horonomy_site`,
   `utm_medium=referral`, `utm_campaign` matching the active
   initiative). This is the one CTA that must exist on every page.
2. **View on GitHub** — secondary. Links to
   `https://github.com/ai-agent-assembly`. Signals credibility to
   engineers and lets them self-serve validation.
3. **Read the manifesto / About** — tertiary. Same-hostname link to
   the philosophy / worldview page.

**What Horonomy MUST NOT do.**

- Do not carry product-level detail (install commands, SDK docs,
  security model diagrams). Those belong on Agent Assembly or docs.
- Do not compete with `agent-assembly.com` for "Start self-hosting" or
  "Request Cloud Early Access". Those CTAs live on the product site.
- Do not promise SaaS availability. Horonomy's job is company trust,
  not product sales.

### 2.2 Agent Assembly (`agent-assembly.com`)

**Primary job.** Convert a technical visitor into one of three explicit
paths within 10 seconds: OSS self-hosting, security/architecture
evaluation, or Cloud Early Access request.

**Primary audience.** In priority order:

1. Developers evaluating an agent framework replacement or complement,
   arriving via docs pages, GitHub, or a technical blog post.
2. Platform / security engineers evaluating governance and audit
   boundaries for production AI agents.
3. Buyers or design partners (founders, staff engineers, heads of
   platform) exploring managed / SaaS options.

**Primary CTAs (exactly 3).**

1. **Start self-hosting** — developer path. Leads to the install block
   on the landing page or a dedicated self-hosting page; must copy a
   real install command. Fires `cta_start_self_hosting_click` and,
   downstream, `copy_install_command`.
2. **Request Cloud Early Access** — buyer / design-partner path. Leads
   to the transparent early-access form (HORO-43). Copy must make clear
   that Cloud is not GA. Fires `cta_cloud_early_access_click` and,
   downstream, `cloud_early_access_submit`.
3. **View on GitHub** — validation path. Deep-links to the core repo
   `https://github.com/ai-agent-assembly/agent-assembly`. Fires
   `github_core_repo_click`.

Secondary link surfaces: docs (`docs_click`), examples repo
(`examples_repo_click`), security model section
(`security_model_view` / `architecture_view`).

**What Agent Assembly MUST NOT do.**

- No vague "Learn more" buttons without a specific target.
- No fake "Download SaaS" or "Log in to Cloud" language.
- No exhaustive company-story content — link back to Horonomy for that.

### 2.3 Docs (`docs.agent-assembly.com`)

**Primary job.** Take a developer from "I want to try this" to a
running example, and from "is this safe in production?" to the
security model — with every high-intent action measurable.

**Primary audience.** In priority order:

1. Hands-on implementers running through quickstart / installation.
2. Platform / security engineers reading the security model,
   enforcement layers, and audit story.
3. Existing users returning for SDK reference or troubleshooting.

**Primary CTAs (max 3, per docs page).** The specific CTA depends on
the page, but the set is:

1. **Copy install command / next step in quickstart** — fires
   `docs_copy_install_command` and `docs_quickstart_click`.
2. **Open on GitHub (examples repo or core repo)** — fires
   `docs_examples_click` or `github_core_repo_click` depending on target.
3. **Request Cloud Early Access** (only on relevant pages: security
   model, architecture, and end of quickstart) — fires
   `cta_cloud_early_access_click`, cross-hostname link back to the
   product site with UTM.

**What Docs MUST NOT do.**

- Do not carry brand/philosophy content. That is Horonomy's job.
- Do not omit the "next step" CTA on high-intent pages (installation,
  quickstart, SDK pages, security model). Every such page fires a
  measurable event on its outbound action.
- Do not present unversioned content as authoritative — older docs
  must route to latest where appropriate.

## 3. Suggested navigation structure per surface

Navigation is a shorthand for what each surface promises the visitor.
Nav labels should describe the destination in words the visitor
already uses — not internal terminology.

### 3.1 Horonomy top nav (`horonomy.dev`)

Left → right:

1. **Home** — company positioning and primary CTA to Agent Assembly.
2. **Products** — currently one entry: Agent Assembly (with a short
   descriptor). Reserves room for future portfolio without demoting
   the flagship.
3. **Manifesto / About** — worldview page. Retains the astronomy
   theme but always ties back to autonomy and governance.
4. **Blog** — founder-led writing. Cross-hostname UTM tagging when a
   blog post CTA points at Agent Assembly.
5. **GitHub** (outbound icon) — links to `github.com/ai-agent-assembly`
   org page. Fires `horonomy_github_click`.

Footer: Product (→ Agent Assembly), GitHub, Contact, Blog, Privacy.

### 3.2 Agent Assembly top nav (`agent-assembly.com`)

Left → right:

1. **Product** — the landing page. Answers what/why/who in 10 seconds.
2. **Docs** — cross-hostname to `docs.agent-assembly.com`. Carries
   `utm_source=product_site`, `utm_medium=docs_link`, and the active
   campaign. Fires `docs_click`.
3. **GitHub** — deep-link to the core repo (not the org page). Fires
   `github_core_repo_click`.
4. **Security** — same-hostname deep link into the security model
   section (or a dedicated page if HORO-42 splits it out). Fires
   `security_model_view`.
5. **Blog** — same-hostname product blog.
6. **Early Access** — button, visually distinct from other nav items.
   Same-hostname link to the transparent early-access page (HORO-43).
   Fires `cta_cloud_early_access_click`.

Footer: Product, Docs, GitHub, Security, Blog, Early Access,
Privacy. Every outbound link fires the appropriate event.

### 3.3 Docs top nav (`docs.agent-assembly.com`)

The docs nav is a *funnel*, not a taxonomy. Order matters — first-time
visitors read top-to-bottom until they find a next step.

1. **Start Here / Overview**
2. **Quickstart**
3. **Installation** (+ Requirements)
4. **Run your first governed agent**
5. **SDKs** (Python, Node, Go — same order everywhere for consistency)
6. **Concepts** (identity, authority, budgets, audit trails, secret isolation)
7. **Enforcement layers** (SDK hooks, sidecar proxy, eBPF)
8. **Examples**
9. **Security model**
10. **Troubleshooting**
11. **Versioning / release status**

Footer or persistent side rail carries **Request Cloud Early Access**
as a cross-hostname link (UTM: `utm_source=docs`, `utm_medium=docs_link`,
`utm_campaign=early_access`) — visible from every page but not competing
with the primary "next step in quickstart" CTA.

## 4. Page-level messaging principles

These principles apply across all three surfaces. They are how we
decide whether a proposed page or copy change is aligned with the plan.

### 4.1 The 10-second rule (Agent Assembly landing page)

A first-time visitor must be able to answer, without scrolling and
without reading long paragraphs:

- **What is Agent Assembly?** — a governance runtime for AI agents.
- **What problem does it solve?** — agents can act, but frameworks do
  not define production-grade boundaries.
- **Who is it for?** — developers, platform engineers, security
  engineers.
- **How do I try it now?** — the OSS install path (copy command,
  quickstart).
- **Where does Cloud fit?** — early access / design partner (not GA).

If any of these five questions requires scrolling past the fold to
answer, the hero copy needs to be tightened before adding new sections.

### 4.2 Developer value comes before brand poetry

The astronomy / worldbuilding theme is a positioning asset for Horonomy,
not a substitute for concrete developer value on Agent Assembly and
docs. On Horonomy, brand-first copy is appropriate; on Agent Assembly
and docs, brand takes a background role.

Concretely:

- Horonomy hero: brand-first, product-referring.
- Agent Assembly hero: value-first, brand-referring.
- Docs pages: functional-first, no brand poetry at the top.

### 4.3 CTA per page, not CTA per section

Every page has **one dominant CTA** matching that page's job (see
Section 2). Secondary CTAs are allowed but must not visually compete
with the dominant one. If a page appears to need two competing CTAs,
it is probably two pages.

### 4.4 Concrete over abstract

Prefer concrete examples over abstract descriptions:

- Not: "Enterprise-grade governance for AI agents."
- Yes: "Every agent call passes through an identity check, a policy
  check, and a budget check. If any check fails, the tool call never
  runs."

Prefer diagrams over prose when explaining enforcement layers.

### 4.5 Trust before ask

For product-selling pages (Agent Assembly landing, early access), the
visitor must encounter a trust signal (GitHub, docs link, version
status, open-source posture) before the primary CTA. A visitor who
does not know if the project is real will not submit an early-access
form.

### 4.6 No fake doors

The Cloud path must always describe itself as early access / design
partner. Copy must never imply the SaaS console is available now.
Users who submit the early-access form must be routed to next steps
that are real today (OSS install, docs, GitHub) — not to a placeholder
"Coming soon" wall.

### 4.7 One idea per section

Sections are indivisible units. A section that tries to explain two
ideas becomes hard to skim and hard to link to. If a section requires
"and also" phrasing, split it.

### 4.8 Message consistency across surfaces

The one-sentence description of Agent Assembly must be identical on
Horonomy's products section, Agent Assembly's hero, and the docs
overview page. Enforce this in review by literally comparing the three
strings.

## 5. GA4 event-mapping table

_TBD — see following commits._

## 6. Handoff notes

_TBD — see following commits._
