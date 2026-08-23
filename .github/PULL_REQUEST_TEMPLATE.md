<!--
PR title format: [<ticket>] <emoji> (<scope>): <summary>
Example:        [AAASM-4024] ✨ (site): Implement Horonom homepage
-->

## What changed

<!-- One paragraph: what this PR does. -->

## Why

<!-- Motivation / context. Link the ticket. -->

Closes: <!-- AAASM-XXXX -->
Relates: <!-- AAASM-XXXX -->

## How to verify

<!-- Manual steps or automated test references a reviewer can run. -->

```bash
pnpm install
pnpm typecheck
pnpm build
pnpm serve
```

## Self-verification

<!-- For front-end work, attach screenshots (desktop / mobile / interaction states)
     and note the design source. -->

## Checklist

- [ ] Title follows `[<ticket>] <emoji> (<scope>): <summary>`
- [ ] Commits are granular and GitEmoji-style
- [ ] `pnpm typecheck` passes
- [ ] `pnpm build` passes
- [ ] Screenshots attached (front-end changes)
- [ ] No secrets, credentials, or tokens committed
- [ ] Linked Jira ticket set to the correct status
