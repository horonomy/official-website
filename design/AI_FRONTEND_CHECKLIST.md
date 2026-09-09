# AI Frontend Implementation Checklist v1

Read the authoritative repository instructions, then the [visual](VISUAL_DESIGN_CONSTITUTION.md),
[motion](MOTION_CONSTITUTION.md) and [accessibility](ACCESSIBILITY_CONTRACT.md)
contracts before implementing a reference slice. Use this checklist in the PR;
it applies equally to human and AI contributors and is not a new approval flow.

## Before implementation

- [ ] Name the actual route/component, source commit, ticket and surface mode:
  marketing, Atlas, operational or native Pets. Read the active implementation;
  old screenshots and `src/components/Hero/` do not establish current behavior.
- [ ] Read the product-owned documents linked in the visual constitution. Keep
  claims, state meanings, destination/availability and maturity vocabulary with
  their owners. Keep private references and evidence out of public artifacts.
- [ ] Read [the token manifest](design-token-contract.json) and its
  [JSON Schema](design-token-contract.schema.json). Resolve values from the first
  `:root` in `src/css/custom.css`; the manifest carries role references only.
  Preserve CSS aliases and Atlas extraction. Do not invent a page-specific palette,
  font, radius or timing vocabulary because a role is missing; extend the shared
  contract where needed and show why the existing role cannot serve it.
- [ ] Specify hierarchy, one main task/action, opaque/glass placement and a phone
  composition. Operational content stays opaque; Pets retains its own identity.
- [ ] Map each animation to a motion-table row with cause, timing/easing,
  cancellation, mobile/static replacement and measured cost. Assign one attention
  owner; do not connect raw pointer coordinates to the Horologer.

## Before review

- [ ] Verify keyboard, focus, touch, all real states, long text, 320px reflow,
  reduced motion on load/change, scene pause and failed assets. Capture the matrix
  from the accessibility contract; report untested cells rather than imply a pass.
- [ ] Record worst-case contrast pairs, mobile/desktop before/after views and
  performance traces against the same baseline. Never use screenshots or browser
  automation speed alone to claim improved human task efficiency.
- [ ] Keep token values in CSS. For manifest changes validate the JSON Schema and
  resolve all referenced CSS variables/aliases using the existing Atlas extractor;
  reject missing references/cycles. HORO-873 owns runtime token/primitives adoption;
  HORO-874 owns reusable browser checks. Neither is implemented by this checklist.
- [ ] Run canonical pnpm 10 `typecheck`, `build`, `check:claims`, `check:registry`;
  for shared token/Atlas changes also run `build:atlas`, `typecheck:atlas`,
  `test:atlas`. Link actual results and evidence in the repository's PR template.
- [ ] Record consequential decisions. Tune routine values within the contract using
  measured QA. Escalate only an actual identity/North-Star/style-policy change to
  the founder/product owner; never silently rewrite product truth to fit a visual.

Documentation-only contract edits require schema/source/link checks and repository
checks, not fabricated rendered screenshots. No generated `AGENTS.md` edits, new
framework/engine, paid service or downstream reference UI is implied by this v1.
