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

_TBD — see following commits._

## 4. Page-level messaging principles

_TBD — see following commits._

## 5. GA4 event-mapping table

_TBD — see following commits._

## 6. Handoff notes

_TBD — see following commits._
