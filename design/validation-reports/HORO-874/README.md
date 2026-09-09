# HORO-874 rendered verification evidence

Capture source: `577cf73118d182618205b1f6c5695eee7f98ca36`, freshly built and clean, including merged HORO-873, HORO-887 and HORO-888. Commit `6b0676f` originally added this report and [manifest](manifest.json). Subsequent QA repairs pin the Git executable and baseline command, retain startup/cleanup failures, validate complete comparable performance baselines, and add overflow diagnostics; they change no production rendering or measurement formula. This is the preserved macOS capture, not a claim that the later Linux gate passed. Local host: macOS 26.4.1 arm64, Apple M3 Max, Node 23.11.0, pnpm 10.34.5. CI independently uses Node 22 on Linux.

The browser run passed **90/90 checks**, with no retry, skip or unexpected result: Chromium 153.0.8010.12, Firefox 155.0 and WebKit 26.6; desktop 1440×1000, tablet 834×1112, mobile 390×844; DPR 1. All 108 environment attachments identify the same clean, freshly built capture commit. Coverage includes both public surfaces, native keyboard/pointer/touch, normal/reduced/runtime-pause states, temporal and independent-reload pixel identity, no JavaScript, failed assets/fonts/backdrop blur, 320px reflow and 200% text. All **54 strict axe scans** returned zero definite violations; all 54 retained **color-contrast incomplete regions**. Those regions require manual assessment and are not WCAG or universal contrast passes.

Normal website captures loaded the canonical Space Grotesk and IBM Plex Mono families. Atlas currently supplies no font stylesheet, so its actual system fallback is recorded. Failed-assets mode intentionally blocks fonts. No image masks, tolerance changes or blanket animation suppression were applied. These screenshots are observations, not approved golden baselines. Missing approval was verified to fail without creating baseline images; absent provenance and absolute/unsafe image paths also fail validation.

## Subsequent Linux verification

The first [Linux rendered run](https://github.com/horonomy/official-website/actions/runs/34364976610), on GitHub merge source `94d588722a4b95ad08428adc03ba37115ffbac6f` for PR head `6b0676f`, passed 87/90 checks and failed all three Atlas mobile 200% text cases. Actual PNGs show the 80px “Horonom” heading extending beyond the 390px viewport with the Linux system fallback; the 320px normal-text stage passed. The failure HTML, PNGs and interaction traces were retained. Its performance step did not run. That failure is an outstanding production repair prerequisite, not waived by the Mac pass above.

Sonar's command-boundary and cleanup findings were repaired, and a separate review found malformed performance baselines could otherwise pass comparison. Four QA utility tests now pass, including failed/diagnostic provenance and duplicate/mismatched sample rejection. A real missing-browser launch probe exits 1 with a new failed summary, zero samples and the startup error; it cannot leave a prior success masquerading as the current result. The original Mac artifacts remain immutable. Updated source must pass fresh Linux 90-case and 12-trace gates before merge.

## Actual screenshots

The PNGs were copied byte-for-byte from Playwright attachments and uploaded to [HORO-874](https://lightning-dust-mite.atlassian.net/browse/HORO-874). The manifest records all 14 verified attachment IDs, byte counts, SHA-256 hashes and links: 12 selected PNGs (6,793,763 bytes), the capture report and the compressed trace bundle. No duplicate images or private product evidence are committed here.

| Surface | Desktop | Tablet | Mobile |
| --- | --- | --- | --- |
| Website | [Normal PNG](https://lightning-dust-mite.atlassian.net/rest/api/3/attachment/content/10120) | [Normal PNG](https://lightning-dust-mite.atlassian.net/rest/api/3/attachment/content/10127) | [Normal PNG](https://lightning-dust-mite.atlassian.net/rest/api/3/attachment/content/10125) |
| Atlas | [Normal PNG](https://lightning-dust-mite.atlassian.net/rest/api/3/attachment/content/10118) | [Normal PNG](https://lightning-dust-mite.atlassian.net/rest/api/3/attachment/content/10126) | [Normal PNG](https://lightning-dust-mite.atlassian.net/rest/api/3/attachment/content/10122) |

Interaction/state evidence: [WebKit desktop motion-control focus](https://lightning-dust-mite.atlassian.net/rest/api/3/attachment/content/10130), [Firefox mobile Atlas focus](https://lightning-dust-mite.atlassian.net/rest/api/3/attachment/content/10128), [website reduced motion](https://lightning-dust-mite.atlassian.net/rest/api/3/attachment/content/10121), [mobile Atlas reduced motion](https://lightning-dust-mite.atlassian.net/rest/api/3/attachment/content/10123), [mobile failed assets](https://lightning-dust-mite.atlassian.net/rest/api/3/attachment/content/10124), and [Chromium forced colors](https://lightning-dust-mite.atlassian.net/rest/api/3/attachment/content/10119).

The [capture report](https://lightning-dust-mite.atlassian.net/rest/api/3/attachment/content/10117) records all cases, environment/provenance, incomplete contrast targets, 51 occlusion checks and raw performance measurements. The complete local HTML report retains additional pointer/touch, initial/delayed/reloaded reduced frames, static, text and focus images; CI uploads its own complete report for seven days.

## Persistent scene observations

All 12 fresh-context Chromium samples ran for at least 30 seconds, with six trusted local link activations each. All 72 actions and observed Event Timing entries were present. The command completed with no failed lab ceiling and zero recorded long tasks within the measured scene intervals.

| Surface / viewport | Samples | Median LCP | Maximum CLS | Maximum observed event | Maximum click → two RAF callbacks |
| --- | ---: | ---: | ---: | ---: | ---: |
| Website / desktop | 3 | 176 ms | 0.0005051312 | 48 ms | 34.2 ms |
| Website / mobile | 3 | 216 ms | 0.0004320491 | 56 ms | 32.0 ms |
| Atlas / desktop | 3 | 28 ms | 0 | 32 ms | 33.0 ms |
| Atlas / mobile | 3 | 28 ms | 0 | 32 ms | 33.1 ms |

The [trace bundle](https://lightning-dust-mite.atlassian.net/rest/api/3/attachment/content/10129) contains all 12 real gzip Chrome traces and their summary. Each trace was parsed and checked for `qa-scene-start` / `qa-scene-end`. CLS was independently recalculated from each sample's raw eligible shift rows using the [pinned Chrome session-window semantics](https://github.com/GoogleChrome/web-vitals/blob/582ee7450ca5c60a947edbfd95ad53e135ca5dde/src/lib/LayoutShiftManager.ts), including strict gap/window boundaries and zero-value handling.

These are unthrottled local lab observations with the existing website font dependency. Event duration is not field INP; the two-RAF proxy is a response opportunity, not confirmed physical presentation. RAF cadence is not device FPS or attributed effect cost. No same-device approved performance baseline exists: effect p95, relative regression and newly introduced long-task/layout-shift criteria remain **unassessed**. The earlier `599624e` capture is pre-repair diagnostic evidence with the earlier CLS reducer; it is not this final acceptance capture or a golden performance baseline.

## Manual review and remaining acceptance cells

The reviewed normal images show readable main headlines, body copy and primary actions at the captured widths. Native focus images show distinct cyan rings. The earlier sticky-navbar/Pause overlap failed the added hit-test regression on old source, then passed after HORO-888. The final run's 51 checks confirm the exercised controls are inside the viewport and receive actual center-point input, including native Skip/primary-action/manual-scroll recovery and desktop Blog/GitHub links. Actual WebKit desktop/mobile images show the full Pause focus ring clear of the opaque navbar. This does not certify every overlay or focus sequence.

Chromium's forced-colors image paints white/yellow text and cyan focus with black text backing. macOS WebKit only activates the media query while retaining author colors; its emulation is **not painted system-palette conformance**. Native platform high-contrast review remains unassessed. Failed-assets images retain readable main content and actions but expose broken decorative image borders/icons, a HORO-875 polish finding.

Mobile constellation SVG labels remain visibly small (approximately 6–10px for some scaled labels), with accessible link names and larger DOM product alternatives. Readability of those labels remains an explicit HORO-875 / HORO-882 review cell. Worst bright-background contrast, the 54 axe incomplete regions, screen-reader comprehension, text spacing/localization and broader overlay/focus cases remain **unassessed** for the HORO-882 acceptance owner. Physical-device FPS, memory and thermal measurements remain private and native-product-owned; simulator/browser responsiveness is not that evidence. The [native contract](../README.md#native-evidence-contract) reuses the existing XCUIScreen screenshot workflow without native source changes or copied private evidence. No overall MVP acceptance verdict is made here.

## Reproduce

Follow the [verification contract](../README.md). Both typechecks and builds, claims/registry gates, 37 Atlas tests and three QA utility tests passed. Run `QA_BROWSERS=chromium,firefox,webkit corepack pnpm@10 check:visual` followed by `corepack pnpm@10 perf:visual`; both commands freshly build the surfaces. Generated HTML reports and raw traces stay under ignored `.generated/`; CI preserves complete evidence under the commit-named artifact, including failed checks. The bounded Jira artifacts above remain linked by exact capture SHA and hashes in the manifest.
