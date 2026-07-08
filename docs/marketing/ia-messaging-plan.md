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

_TBD — see following commits._

### 2.1 Horonomy (`horonomy.dev`)

### 2.2 Agent Assembly (`agent-assembly.com`)

### 2.3 Docs (`docs.agent-assembly.com`)

## 3. Suggested navigation structure per surface

_TBD — see following commits._

## 4. Page-level messaging principles

_TBD — see following commits._

## 5. GA4 event-mapping table

_TBD — see following commits._

## 6. Handoff notes

_TBD — see following commits._
