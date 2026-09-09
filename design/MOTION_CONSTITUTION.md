# Motion Constitution v1

Companion to the [Visual Design Constitution](VISUAL_DESIGN_CONSTITUTION.md).
Motion explains an input, state transition or environmental cause. It never delays
a usable control, invents progress, or makes a domain conclusion feel more certain.
The [accessibility contract](ACCESSIBILITY_CONTRACT.md) applies to every row below.
These are browser presentation defaults; Pets' product-owned Animation Bible owns
its behavior and timing. No new library or engine is selected by this document.

## Technology and scheduling

Prefer **CSS → existing Motion/declarative animation → SVG/Canvas → Rive → WebGL**,
stopping at the first sufficient option. SVG is also appropriate for static semantic
diagrams without a runtime. Escalating cost requires a concrete unmet interaction
need and measured evidence; visual richness alone does not require Rive or WebGL.
There is no requirement to install a package. Keep navigation, labels and state in
the existing DOM; an effect engine cannot own them.

Prefer transform/opacity; do not animate layout, backdrop blur or large shadows.
Layout transitions may use measured transform snapshots; reading layout on every
frame is prohibited. One owner schedules a scene, cancels obsolete work, responds
to media preference changes, and stops on document hide, offscreen or unmount.
Never replay a backlog on return. Reserve dimensions before assets load.

Timing notation: **out** = `cubic-bezier(0.16, 1, 0.3, 1)`;
**standard** = `cubic-bezier(0.4, 0, 0.2, 1)`; **linear** = constant rate.
No spring by default. A justified spring must have no overshoot on task controls,
settle inside the row's maximum duration and cancel from its current position.
The defaults are the midpoint of a stated range unless specified otherwise.

Cost classes reference the visual constitution's total-route budgets: **C1** = one
bounded transform/opacity group, no per-frame React render; **C2** = one shared
ambient scheduler/layer, measured frame cost; **C0** = static, no animation work.
A group means elements driven by one cause; grouping unrelated effects does not
evade the concurrent-group ceiling. All durations are milliseconds unless `s`.

## Motion classes

| Class | Cause → purpose | Duration / easing | Interruption / reversal | Mobile | Reduced-motion replacement | Cost |
| --- | --- | --- | --- | --- | --- | --- |
| Control feedback | Hover, focus, press → identify target and acknowledge input | 80–160 / out; focus outline immediate | Retarget from current value; release reverses, no queue | Press/focus, no hover dependency; no moving hitbox | Immediate border/fill/pressed state | C1; one control, ≤2px visual displacement |
| Panel / menu / tooltip | Explicit open/close or focus → reveal context | 160–240 / out; operational ≤180 | Close cancels entry; restore invoking focus; tooltip dismissible | Inline help or full-width sheet; ≤8px translation | Show/hide immediately; same focus and dismissal | C1; one overlay, no scale zoom |
| Layout / filtering / navigation | User changes view/order → preserve spatial continuity | 160–240 / standard; operational ≤180 | Latest request wins; preserve focus/scroll anchor; do not postpone navigation | Stack in reading order; no shared-element travel across screen | Immediate stable layout with explicit updated state | C1; bounded transform snapshots; no per-frame layout |
| Async progress / completion | Actual pending/completed request → communicate its state | State immediate; optional indicator 700–1200 loop / linear; completion 120–180 / out | Stop on completion/error/cancel; never impose a minimum wait or restart completed work | Same timing; indicator local to task | Static pending label/icon and real progress value where available; immediate completion | C1; at most one local indicator per active task, no shimmer field |
| Constellation target | Stable target hover/focus/selection → connect name and position | 160–240 / out; label and focus immediate | One active semantic target; clear or retarget without flash/trail | Persistent inline labels and direct tap destination | Static selected outline plus label | C1; only target figure, no whole-sky redraw |
| Starfield | Scene visible + motion enabled → quiet depth | 8–16s / standard, low-amplitude opacity only | Freeze/stop when disabled or out of view | ≤half desktop animated points; static by default on constrained device | Stable star positions and constant opacity | C2; one group; no bright twinkle under text |
| Atmosphere / haze | Shared environmental clock → slow spatial depth | 12–20s / linear, translation ≤8px | Stop immediately; resume from current scene, no catch-up | Static plate | Static low-contrast plate or omit | C2; one layer, no animated filters |
| Scene parallax | User scrolls visible scene → restrained depth cue | 180–240 settle / out; total displacement ≤8px | Latest scroll position wins; no scroll interception | Disabled, recompose layers | Fixed layers | C2; one scheduler; no raw pointer tracking |
| Meteor | Visible, unattended marketing scene → rare celestial event | 600–900 / out; at most once per 20s | Cancel on attention, pause, hide or reduced motion; no queued events | Omit | Omit | C2; counts as an ambient group; one meteor; no flashes |
| Horologer perception | New semantic target persists → communicate noticing | Default 180, range 120–240 delay; no easing | Cancel stale notice before it fires; do not delay the target's own feedback | Only explicit action/focus may supply target | Select static attentive pose after same semantic notice, no movement | C0 during delay; one cancellable timer |
| Horologer orientation / settle | Notice resolves / attention leaves → attend, then return to rest | Attend 360–600 / out; settle 400–700 / standard | Retarget from current pose, never snap via neutral or finish an obsolete gesture | Reduce displacement by half; no camera motion | Immediate stable target pose; no transition | C1; bounded head/instrument cue, no whole-body cursor tilt |
| Horologer idle / cloth / instrument / props | No active target + coherent environmental cause → grounded life | 4–8s / standard; ≤2px or 1° accent motion | Yield to notice; stop when hidden/paused; no independent random loops | Static by default; at most one small idle group if budget passes | Grounded neutral pose and static props | C2; one shared idle group; contact points remain fixed |

Any new animation must map to a row or amend this table with all seven fields.
Reveal staggering is optional marketing decoration only: ≤3 groups, ≤60ms stagger,
≤360ms total. Operational rows and asynchronously arriving results never cascade.
If available assets cannot support a believable cue, use a static pose; do not
stretch an intact raster character into a fabricated rig.

## First Horologer semantic attention

Use `rest → notice(targetId) → attend(targetId) → settle → rest`, plus `suspended`.
One scene owner resolves attention: keyboard focus first, explicit selection second,
stable hover third, idle last. Target IDs and canonical scene anchors are inputs;
raw cursor coordinates are not. Pointer movement within a target produces no new
notice. Decorative targets may receive attention without acquiring a fake action.

The target's label, focus and actual action respond immediately. Only the observer
has perception latency. Leaving before notice completes cancels it. A new target
replaces the old one; entering a higher-priority input cancels lower-priority work.
Attend holds while that target remains current; after it clears, wait 300ms before
settling to avoid boundary flicker. Keep at least 1200ms quiet rest before optional
idle resumes. Hover leaving cannot clear keyboard focus. Tap navigation executes
immediately; no retained selection may block it. Escape dismisses a preview without
blurring its trigger. No cursor puppet, independent competing attention state, or
random pose cycle stands in for this grammar.

On pause/reduced motion, keep the resolved semantic state in a static pose. On
hide/offscreen enter `suspended`, cancel timers and resume from current input when
visible. Test rapid target changes, focus plus pointer, touch, interruption during
orientation, and preference toggles. State transitions cannot depend on
`animationend`, a timer firing, or an animation finishing to enable navigation.
