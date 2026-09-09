# Rendered verification

HORO-874 supplies website/Atlas evidence for the [accessibility contract](../ACCESSIBILITY_CONTRACT.md)
and [motion contract](../MOTION_CONSTITUTION.md). These checks do not certify all
WCAG criteria, human task efficiency, physical-device performance or MVP acceptance.

## Run against this checkout

Use Node 22, pnpm 10 and `/usr/bin/git` on macOS or Linux. No running server, browser operation, account, telemetry,
remote URL or credential is needed. The harness owns loopback ports 4174/4175 and
refuses to reuse an existing server. It serves only `build/` and `atlas/dist/`.
Normal website mode permits only its existing exact Google Fonts stylesheet and
Space Grotesk / IBM Plex Mono font files, and requires those families to load.
All other external requests (including analytics) are blocked; failed-assets mode
blocks fonts too. Font network failure fails normal-mode checks instead of passing
fallback typography as the intended design. Atlas currently links no font
stylesheet; its actual system fallback is recorded without inventing webfont
conformance. External product links
are inspected and receive trusted keyboard/pointer/touch activation with navigation
cancelled in the test; destination availability is the product registry's concern.

```bash
corepack pnpm@10 install --frozen-lockfile --ignore-scripts
corepack pnpm@10 exec playwright install chromium firefox webkit
corepack pnpm@10 build
corepack pnpm@10 build:atlas
corepack pnpm@10 test:visual-tools
corepack pnpm@10 check:visual
QA_BROWSERS=chromium,firefox,webkit corepack pnpm@10 check:visual
corepack pnpm@10 perf:visual
```

`check:visual` and `perf:visual` rebuild both surfaces first, pin the source SHA
for the run, and report dirty/untracked work. Calling the underlying tools directly
marks `freshBuild: false` and is diagnostic evidence only. `check:visual` defaults to Chromium; CI explicitly uses all three engines.
The viewport matrix is desktop 1440×1000, tablet 834×1112, mobile 390×844 at DPR 1.
Every surface gets real normal/reduced/focus/pointer screenshots, WCAG AA axe scans,
runtime reduced-motion switching and equivalent-reload pixel stability, static/no-JavaScript, failed images/fonts with no
backdrop blur, 320px reflow, 200% text and forced-color views. The living scene also
checks user pause persistence. All assertions remain active for existing defects.
A failure exits nonzero and retains evidence; fixing source is the resolution.
macOS WebKit uses native Option-Tab (`Alt+Tab`) to traverse links, recorded in each
environment attachment; other engines/platforms use Tab. This follows
[Apple's keyboard navigation contract](https://support.apple.com/guide/safari/keyboard-shortcuts-and-gestures-cpsh003/mac)
without changing host preferences or programmatically focusing the target.
Touch projects dismiss consent and activate primary actions with native taps.
Neutral captures park the real pointer outside content after consent dismissal;
separate tests deliberately produce hover/focus states. Both temporal stability
frames are retained for pixel review.
Forced-colors media emulation is not proof of a painted system palette: this macOS
WebKit build retains author colors even when the media query matches. Chromium
paints the system palette in the captured evidence; native high-contrast review
remains necessary for other platforms.
No CSS animation suppression is added to the reduced-motion test's screenshots.

The output under `.generated/` is ignored by Git. Open `.generated/report/index.html`
or use `pnpm exec playwright show-report design/validation-reports/.generated/report`.
Per-test attachments contain source commit, dirty flag, browser/platform/viewport,
real PNGs, contrast pairs, axe violations and incomplete regions. Failure traces
are Playwright interaction traces; they are distinct from the performance traces.
CI uploads the self-contained HTML report/data and performance directory as `rendered-visual-qa-<commit>` for seven days, even on test
failure. Local `results.json` duplicates PNGs as base64 and stays out of the CI artifact;
the HTML report retains every image, JSON attachment and failure trace. Link that artifact and selected public screenshots in PR Self-verification.
Attach a bounded selection of public PNGs and the compressed trace bundle to the
owning Jira ticket through the authorized evidence workflow. Commit the ticket
report and a small manifest containing capture SHA, hashes and stable attachment
links. Do not duplicate those images, HTML reports or raw traces in Git.

## Baselines require a deliberate review

The initial capture command creates **observations**, not golden baselines. Human
review compares equivalent normal, focus and reduced states before approval. It is
never correct to approve existing violations merely to turn the suite green.
Once review metadata exists, the standard gate compares reduced-state PNGs
automatically; `QA_COMPARE=1 pnpm check:visual` also requires comparison before
the first baseline exists. Comparisons use
Playwright's platform/project-specific paths and zero differing pixels. It fails
when a baseline is absent or different; automatic snapshot updates are disabled.
Use the same OS, browser version, headless mode, fonts and device settings as the
baseline. Normal motion frames remain visual review material, not nondeterministic
golden comparisons. See [Playwright's visual comparison guidance](https://playwright.dev/docs/test-snapshots).

To propose an intentional baseline change, copy the reviewed reduced screenshots
into `scripts/visual-qa/baselines/<platform>/<browser>-<viewport>/<surface>-reduced.png`.
Add/update `scripts/visual-qa/baselines/review.json` with `ticket` (`HORO-...`),
`reason` (the intended visible change), `sourceCommit` (40-character capture SHA),
and `files` (all changed PNG paths relative to `baselines/`). Run
`node scripts/visual-qa/baseline-review.mjs origin/main`; CI enforces this metadata.
The comparison CLI accepts only its documented `origin/main` base and uses literal Git arguments.
The reviewer must inspect before/after images and grant approval in the PR.
Metadata is provenance, not visual approval. Do not use `--update-snapshots` to
resolve a failure; the normal gate must pass independently of any image acceptance.

## Performance interpretation

`perf:visual` creates three cold-load samples for website and Atlas at desktop and
phone viewports. Each sample renders for 30 seconds with real pointer, Tab and six trusted link activations,
keeps an actual compressed Chrome performance trace, and reports LCP, standard
session-window CLS, observed interaction Event Timing, trusted-click response opportunities, long tasks, RAF cadence,
heap size and total script/style/layout time. Initial lab ceilings are LCP 2500ms,
CLS 0.1 and observed interaction / trusted-click response 200ms. A failed ceiling fails the command.

CLS uses the first contributing shift and strict one-second/five-second session boundaries
from the [pinned Chrome Web Vitals reference](https://github.com/GoogleChrome/web-vitals/blob/582ee7450ca5c60a947edbfd95ad53e135ca5dde/src/lib/LayoutShiftManager.ts).
Raw eligible shift entries remain in each summary sample for recalculation.

These are unthrottled **lab** measurements of local assets plus the website's
existing external font dependency; network conditions can affect the latter. Event Timing is a practical
interaction sample, not field INP; absent entries remain unavailable. The trusted-click proxy measures event timestamp to two RAF callbacks; this is a
response opportunity, not confirmed display presentation. Six measured actions are
required. RAF cadence is not effect execution time or device FPS. Use Chrome DevTools to inspect the
trace's `qa-scene-start` / `qa-scene-end` interval and attribute effect scripting and
render work against the same-device baseline before asserting the constitution's
4ms/6ms effect p95 or no newly introduced long tasks/layout shifts. No baseline
means those relative criteria are **unassessed**, not passed. Set
`QA_PERF_BASELINE=/path/to/summary.json` for a same-environment comparison: missing
metrics/mismatched environments fail. Baselines must be complete, clean, freshly built captures with a valid source SHA, no failures, and all twelve unique expected surface/viewport/run cells with matching viewport dimensions and at least thirty seconds of observation. Diagnostic, failed, duplicated or malformed evidence is rejected before comparison. Median LCP/trusted-click response regressions
above 10% fail. Keep absolute values and trace findings in the PR.

Raw traces are capped at 64 MiB per sample before compression; only twelve samples
are captured. No native/private product evidence belongs in these public artifacts.
Hardware performance, VoiceOver/screen reader comprehension, worst bright-background
contrast, overlay/focus occlusion, text spacing/long localization and offscreen work
need explicit review beyond the current automated assertions. Record uncovered
cells with owner and follow-up ticket; an automated pass cannot erase them.

## Native evidence contract

Native iOS visual work stays in the owning private repository. Reuse its existing
`apps/ios/PetLifeSimulatorUITests/`, `scripts/test.sh`, `scripts/ci.sh`,
`docs/art/ANIMATION_BIBLE.md` and `docs/verification/<ticket>/` convention. Do not
add a browser harness to the native app or copy product fixtures into this repo.

Capture SpriteKit/Metal-composited output from the Simulator/device screen:

```swift
let attachment = XCTAttachment(screenshot: XCUIScreen.main.screenshot())
attachment.name = "ticket-state-device"
attachment.lifetime = .keepAlways
add(attachment)
```

Do not substitute `XCUIApplication().screenshot()`, view-layer snapshots or blank
SwiftUI host captures for the composited world. Inspect the actual image to verify
that the pet, room and changed state are present. Use deterministic product-owned
fixtures and real touch actions; keep the `.xcresult`, test identifier, build/source
SHA, simulator/device model, OS, viewport, accessibility settings, launch arguments,
and expected/observed state in the private verification report. Export only selected
images from the result bundle. Keep a short screen recording for timing, contact,
interruption or behavior that a still cannot establish.

Native visual acceptance includes VoiceOver order/labels, Dynamic Type, reduced
motion, contrast/readability and representative 44pt touch targets. Run the living
slice on the target physical device for sustained FPS/frame-time, memory growth and
thermal state using Xcode/Instruments; report device/build/settings, duration,
starting/ending thermal state, p95 frame time, memory samples and observed jank.
Simulator responsiveness is not device performance evidence. Unavailable device
measurements remain **unassessed** with an owner, never zero or a fabricated pass.
Native tooling/code extensions require their own implementation Jira subtasks before
another repository PR; this ticket changes no native source or existing workflow.
