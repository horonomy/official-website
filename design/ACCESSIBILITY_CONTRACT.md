# Reduced Motion and Accessibility Contract v1

This is the acceptance floor for the [visual](VISUAL_DESIGN_CONSTITUTION.md) and
[motion](MOTION_CONSTITUTION.md) contracts, not a claim of current conformance.
Target WCAG 2.2 AA, with the explicit stronger local rules below. Automated scans
and successful builds are partial evidence; inspect the actual rendered states.

## Contrast and protected text

Normal text requires **4.5:1** contrast. Large text requires **3:1** (at least 24 CSS
px regular or approximately 18.67 CSS px bold). Never round a failing ratio up.
These thresholds apply to the actual foreground/background pair, including alpha
composition. See [W3C contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).

Our implementation rule: aim for 7:1 body text on opaque operational surfaces.
Measure the worst permitted scene/frame behind glass, including the brightest
asset region and every hover, focus, scroll and overlay state. Record foreground,
effective background, ratio, viewport and state. If the backdrop varies, use a
backing whose worst allowed composition is bounded, or make it opaque. Measure
again without backdrop-filter and with failed/late image loading. Never claim a
translucent token alone passes. Decorative stars cannot cross protected text areas.

Essential control boundaries, focus indicators and meaningful graphics require
3:1 against adjacent colors. State meaning cannot depend on color alone. Text must
resize to 200%; content reflows at 320 CSS px except content that requires two
dimensions, such as tables. Hover/focus content must remain dismissible, hoverable
and persistent. See [WCAG 2.2](https://www.w3.org/TR/WCAG22/), 1.4.1, 1.4.4,
1.4.10, 1.4.11 and 1.4.13.

Local defaults: use the shared 2px cyan ring with a 2px graphite separator, keep it
fully visible and unclipped, and supply a system-color outline under forced colors
when shadows disappear. A decorative low-contrast divider cannot be the sole cue
for an input or selected row. Inactive controls still need understandable labels;
unavailable product descriptions count as content, not exempt disabled controls.

## Operability and semantics

- All actions work by keyboard with visible, unobscured focus and a logical order.
  No keyboard trap; modal focus returns to its trigger. Provide a skip link and
  landmarks. Use native links, buttons, labels and table semantics first.
- Our default target is 44×44 CSS px for touch actions. Dense pointer controls
  may use 32px rows with adequate spacing and a 44px touch adaptation; never shrink
  type or overlap hit areas to meet density goals. Graph pan/zoom/selection must
  have controls and a text/list route; dragging is not the sole path.
- Preserve headings, error descriptions, sorting and selected state in accessible
  semantics. Announce meaningful async completion/error once, without reading every
  decorative update. Empty, pending and unavailable states explain themselves.
- Art is hidden from assistive technology when redundant/decorative. Meaningful
  visuals have an equivalent accessible name/description and task route. Never
  encode essential text into an image, canvas or character gesture.
- At 200% text size and with increased text spacing, labels and actions remain
  operable. At 320px, localized table/graph scrolling is labeled and keyboard
  reachable; the page itself has no horizontal overflow. Sticky chrome cannot
  cover focused controls or the last row of an inspector.

## Reduced motion is a state-preserving mode

Read `prefers-reduced-motion` before starting optional effects and respond to changes
during the session. Apply each motion-table replacement in CSS **and** JavaScript.
Disable parallax, camera travel, twinkle, meteors, drifting haze, character idle and
animated progress decoration. Keep labels, actual progress, selected state, static
character attention and immediate navigation. A short crossfade is not the default
replacement: use a stable frame with no transition.

Adopt the ability to disable nonessential interaction animation as a local rule,
including effects outside AA's minimum. [W3C's interaction-animation guidance](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)
explains the user preference mechanism and the distinction between information
and the movement used to present it.

Ambient scenes running beyond five seconds need a visible keyboard-accessible
pause/resume control; reduced-motion users start paused. No flashing effects.
Pause survives route revisits during the session; resuming never overrides an active
system reduced-motion preference. Offscreen/hidden scenes stop all continuous
work. Do not depend on the current global `0.001ms` CSS duration reset: it does not
stop JavaScript loops or define a meaningful static state. Essential content must
already exist before animation and survive failed decorative assets. Public
marketing/Atlas content and destinations remain usable with disabled JavaScript;
operational apps retain their product-owned runtime and failure-state contract.

Pets applies equivalent native accessibility preferences and truthful static/body-
language alternatives through its own Art Direction and Animation Bible. Web timing,
CSS controls and the celestial visual treatment do not transfer to the native app.

## Evidence required for a rendered change

Capture desktop 1440×1000, tablet 834×1112 and phone 390×844; check 320px reflow,
200% text, keyboard, touch, reduced motion on load and toggled at runtime, pause,
forced colors, long labels, loading/empty/error and asset failure. Record browser
versions; cover Chromium, Firefox and WebKit plus representative real-device
performance. A simulated viewport is not physical-device performance evidence.
Use real rendered screenshots and short interaction recordings linked to a source
commit, together with contrast pairs and performance traces. Compare equivalent
states to baseline; store private product evidence in its owning private repository.
The HORO-874 harness implements repeatable coverage; manually check semantics and
task comprehension beyond its assertions. Disclose every untested matrix cell.
