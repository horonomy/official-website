# HORO-890 — Required render readiness

The first main run after HORO-874 merged passed 89/90 cases and timed out before
input assertions in Firefox mobile Atlas. The required HTML/CSS had returned 200,
both analytics attempts were deliberately aborted, and no request was recorded
during the subsequent twenty-second network-idle wait. The actual image remained
styled. The trace does not establish a Firefox-internal cause or an external outage.

- [Failed run 34373748898](https://github.com/horonomy/official-website/actions/runs/34373748898)
- [Exact request/timing/source classification](https://lightning-dust-mite.atlassian.net/rest/api/3/attachment/content/10151)
- [Actual failed-state PNG](https://lightning-dust-mite.atlassian.net/rest/api/3/attachment/content/10152)
- [Complete failed Playwright trace](https://lightning-dust-mite.atlassian.net/rest/api/3/attachment/content/10153)

The repair observes required document/font/render resources instead of generic
network idleness. It preserves canonical-font checks, normal resource failures,
intentional degraded/no-JavaScript paths, all screenshot/input assertions and
bounded thirty-second performance observations. It makes no production UI change.
The performance method is now `required-render-v2`; old-method comparisons fail.

At clean fixture source `d9f1953`, all three real browser engines passed delayed
rendering, missing image/background/stylesheet/font, degraded and no-JavaScript
scenarios. A separate black-box comparison used the unchanged legacy helper from
`31f90e590f642decaf6a6098178506f0d04648e7`: with a real unrelated fetch still open,
the old method timed out and the new method accepted already complete resources.
Actual before/after frames were byte-identical in all three engines. The diagnostic
legacy timeout was explicitly shortened to one second; production timeouts were
not increased. This fixture demonstrates the readiness boundary, not a reproduction
of Firefox internals or product accessibility/performance conformance.

The owning PR must retain fresh exact-source 90-case and 12-trace CI evidence,
independent review and postmerge verification. Previous HORO-874 captures retain
their original method/source labels. No baseline approval or overall MVP verdict
follows from this repair.
