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

The event names below are drawn verbatim from the Epic (HORO-39). The
canonical parameter dictionary, key-event configuration, and validation
plan are HORO-45's deliverable — this section only binds pages to
events so downstream implementation tickets know what to fire where.

**Convention.** Event names are snake_case. Every event carries at
minimum `hostname`, `page_path`, and `surface` (one of
`horonomy_site`, `product_site`, `docs`, `github_readme`). CTA-bound
events additionally carry `cta_location` (`hero`, `nav`, `body`,
`install_block`, `footer`, `thank_you`). No PII in any parameter.

### 5.1 Horonomy (`horonomy.dev`)

Owned by HORO-41.

| Page                     | Event                              | Trigger                                                     |
|--------------------------|------------------------------------|-------------------------------------------------------------|
| Home                     | `horonomy_product_agent_assembly_click` | Any click leaving to `agent-assembly.com`               |
| Home / global            | `horonomy_github_click`            | Any click to `github.com/ai-agent-assembly`                 |
| Home / Manifesto         | `horonomy_manifesto_click`         | Any click to the manifesto / about page                     |
| Home / Contact           | `horonomy_contact_click`           | Any click on the contact link (email, form, or DM)          |
| Home / Blog              | `horonomy_blog_click`              | Any click on a blog post title or nav Blog link             |

### 5.2 Agent Assembly (`agent-assembly.com`)

Owned by HORO-42 (landing), HORO-43 (early access), HORO-44 (install).

| Page / block             | Event                                | Trigger                                                              |
|--------------------------|--------------------------------------|----------------------------------------------------------------------|
| Landing hero             | `cta_start_self_hosting_click`       | Primary hero CTA "Start self-hosting"                                |
| Landing hero             | `cta_cloud_early_access_click`       | Secondary hero CTA "Request Cloud Early Access"                      |
| Landing hero             | `cta_view_github_click`              | Tertiary hero CTA "View GitHub" (== `github_core_repo_click` fallback) |
| Landing nav              | `cta_view_docs_click` / `docs_click` | Nav item "Docs" (cross-hostname to docs)                             |
| Landing install block    | `copy_install_command`               | Copy-to-clipboard action on the install command                      |
| Landing security section | `section_security_model_view` (== `security_model_view`) | ≥50% viewport visibility of security-model section     |
| Landing architecture     | `section_architecture_view` (== `architecture_view`)     | ≥50% viewport visibility of architecture section       |
| Landing use cases        | `outbound_click`                     | Any outbound click not covered by a more specific event              |
| Early-access page        | `cloud_early_access_page_view`       | Route-change to the early-access page                                |
| Early-access page        | `cloud_early_access_submit` (Key Event) | Form submit success                                               |
| Early-access thank-you   | `cloud_early_access_oss_docs_click`  | "See OSS docs" next-step link                                        |
| Early-access thank-you   | `cloud_early_access_github_click`    | "View on GitHub" next-step link                                      |
| Install path (all pages) | `copy_install_command` (Key Event)   | Any install-command copy on the product site                         |
| GitHub deep links        | `github_core_repo_click` (Key Event) | Any click to the core repo                                           |
| Examples repo link       | `examples_repo_click` (Key Event)    | Any click to `agent-assembly-examples`                               |
| SDK page previews        | `sdk_page_view`                      | Rendered SDK preview block on the product site                       |
| Contact page             | `contact_click` (Key Event)          | Contact form submit or contact link click                            |

### 5.3 Docs (`docs.agent-assembly.com`)

Owned by HORO-48.

| Page                     | Event                                    | Trigger                                                    |
|--------------------------|------------------------------------------|------------------------------------------------------------|
| Overview                 | `quickstart_click`                       | Click on "Continue to Quickstart" CTA                      |
| Quickstart               | `docs_quickstart_click`                  | Any high-intent action inside quickstart                   |
| Installation             | `docs_installation_view` (== `installation_view`) | Page view                                        |
| Installation             | `docs_copy_install_command` (== `copy_install_command`) | Copy-to-clipboard on install command        |
| SDKs / Python            | `docs_sdk_python_view` (== `sdk_page_view` with `sdk=python`) | Page view                             |
| SDKs / Node              | `docs_sdk_node_view` (`sdk=node`)        | Page view                                                  |
| SDKs / Go                | `docs_sdk_go_view` (`sdk=go`)            | Page view                                                  |
| Examples                 | `docs_examples_click` (== `examples_repo_click`) | Click to `agent-assembly-examples`                  |
| Security model           | `docs_security_model_view` (== `security_model_view`) | Page view                                      |
| Troubleshooting          | `docs_github_issue_click`                | Click on "Open a GitHub issue" link                        |

### 5.4 Key Events (conversions) — final list

Copied from the Epic; HORO-45 will configure these in GA4:

- `copy_install_command`
- `cloud_early_access_submit`
- `github_core_repo_click`
- `examples_repo_click`
- `contact_click`

## 6. Handoff notes

Each downstream implementation ticket consumes specific sections of
this plan. Reviewers use this map to check that a PR is aligned with
the plan.

### HORO-41 — Horonomy site brand and routing

Consumes:

- **Section 2.1** — the surface job, audience, and primary CTAs.
- **Section 3.1** — nav shape.
- **Section 4.1–4.2, 4.4, 4.6** — messaging principles (brand-first,
  concrete, no fake doors).
- **Section 5.1** — event list.

Explicitly does NOT own:

- Any Agent Assembly landing copy.
- Any docs content.
- Any product-level SaaS / OSS-install copy.

Cross-hostname CTAs from Horonomy carry UTM per HORO-47 conventions
(`utm_source=horonomy_site`, `utm_medium=referral`, `utm_campaign=<active>`).

### HORO-42 — Agent Assembly landing conversion paths

Consumes:

- **Section 2.2** — the three-path funnel and 10-second contract.
- **Section 3.2** — nav shape and Early-Access button.
- **Section 4** — every principle, especially 4.1 (10-second),
  4.3 (one CTA per page), 4.5 (trust before ask), 4.6 (no fake doors).
- **Section 5.2** — event list; establishes the shared analytics hook
  and CTA components that HORO-43 and HORO-44 will consume.

Explicitly does NOT own:

- Cloud Early Access page implementation (HORO-43).
- Install-command copy behavior (HORO-44).
- Docs content (HORO-48).

**Blocker for HORO-43 and HORO-44** — the shared analytics hook and CTA
components land here first. HORO-43 and HORO-44 start after HORO-42
merges.

### HORO-43 — Cloud Early Access flow

Consumes:

- **Section 2.2** and **Section 4.6** — the transparent early-access
  contract; must never imply SaaS is GA.
- **Section 5.2** — the early-access page and thank-you events.

Form fields: keep the minimum viable set (email, role, team size, free
text "what are you trying to govern?", preferred deployment). No IP
tracking beyond GA4 defaults; no third-party identifier enrichment.
Thank-you page routes to OSS docs / GitHub, not to a "Coming soon" wall.

### HORO-44 — OSS install tracking

Consumes:

- **Section 2.2** — the OSS self-hosting path.
- **Section 5.2** — install-block events, especially
  `copy_install_command` (Key Event).

Constraint: install commands must be **real** commands that work today.
No placeholder URLs, no fake download endpoints. If a package is not
published yet, link to the GitHub install instructions instead.

### HORO-48 — Docs adoption funnel

Consumes:

- **Section 2.3** — the docs funnel job.
- **Section 3.3** — top-nav order (funnel, not taxonomy).
- **Section 4.2, 4.3** — functional-first, one dominant CTA per page.
- **Section 5.3** — docs event list.

The docs `Request Cloud Early Access` cross-hostname link lives in the
persistent footer / side rail (Section 3.3), not in the top nav, and
carries UTM per HORO-47.

### HORO-45 — Event taxonomy spec (Wave 1 companion)

Consumes:

- **Section 5** — the page → event bindings.

Owns:

- Event names, parameter dictionary, key-event GA4 configuration,
  DebugView validation, GTM vs code-emitted dataLayer decisions.

If HORO-45 renames or removes an event listed in Section 5, this plan
must be updated in the same PR. Do not let the plan and the taxonomy
drift.

### HORO-46 — GA4 reports / dashboard (Wave 3)

Consumes:

- **Section 5** — full event list to build explorations against.

### HORO-50 — Pre-launch QA (Wave 3)

Consumes:

- **Section 2** — verifies each surface honors its job.
- **Section 3** — verifies nav order matches spec.
- **Section 4.1, 4.6** — verifies 10-second rule and no fake doors.
- **Section 5** — verifies every listed event fires in DebugView.

## 7. Change control

This plan is a shared contract. Changes to any of the following require
a PR that updates this file AND notes the affected downstream tickets:

- The one-sentence description of Agent Assembly.
- Any surface's primary CTAs.
- Any nav order change.
- Any event name, addition, or removal in Section 5.
- The list of GA4 Key Events.

Trivial edits (typos, formatting) can go in without notifying downstream
tickets. Substantive edits require a comment on HORO-39 summarizing
what changed.
