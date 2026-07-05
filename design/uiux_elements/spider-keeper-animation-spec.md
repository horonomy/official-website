# Spider Keeper — Animation Asset Spec (design elements)

Source art for animating the hero observer ("The First Horologer"). The reference
sheets live beside this file. Sheets 1–5 are catalog/spec art; sheets **6–11** add
a **shared registration canvas** (safe box + centre cross + ground baseline per
cell) so parts and poses align. They are RGB with the character on a light
background, so the pipeline background-keys, slices, and registers frames into
transparent WebP under `static/img/hero/keeper/`.

## Sheets

| File | Contents |
|---|---|
| `spider_keeper-animation_1.png` | 4×4 idle/angle variations (astrolabe framing) |
| `spider_keeper-animation_2.png` | Gaze atlas (labelled head directions + blink/curious/thinking) |
| `spider_keeper-animation_3.png` | Foreleg + astrolabe interaction; astrolabe orientation/glow variants |
| `spider_keeper-animation_4.png` | Cloak wind (calm→gust, edge flutter) + idle body poses |
| `spider_keeper-animation_5.png` | Layered parts catalog (spec only — missing 7 legs, unregistered) |
| `..._6_accurate.png` | **Master registration reference** — full keeper + anchor labels (head/body/astrolabe centre, foreleg pivot, ground baseline) |
| `..._7_accurate.png` | Full 8-leg set · body core · body+rear-legs combo · contact shadow (registered) |
| `..._8_accurate.png` | Cloak main · cloak edge/hem · hood rim/piping/clasp · emblem (registered) |
| `..._9_accurate.png` | Head poses (neutral/up/down/scan-L/scan-R) + eyes-blink overlay (registered) |
| `..._10_accurate.png` | **6 complete keeper poses** (astrolabe held, all legs, cloak) — gaze/examine |
| `..._11_accurate.png` | Forelegs rest→reach→touch/adjust + astrolabe rotation/glow states |

## Implemented — the keeper (HORO-30)

The observer is a **whole-pose crossfade** built from the complete,
registration-matched frames of sheets 10 + 11 (`slice-keeper-poses.py` →
`static/img/hero/keeper/*.webp`, feet-registered so crossfades never jump):

- 6 `examine-*` frames (idle head/astrolabe study) + `rest`/`reach`/`touch`.
- The keeper **holds the gold astrolabe** and runs an autonomous loop: study →
  reach → touch/adjust (**astrolabe glows** via `.working`) → settle.
- Grounded with a soft contact shadow; sways with `--obs-wind` gusts.
- Reduced-motion → a single static resting pose; contained to `ObserverSpider`.

Why whole-pose (not a layer rig): the layered catalog (sheet 5) can't be
code-assembled (missing 7 legs, unregistered). Sheets 6–11 make a true layer rig
*feasible*, but the complete registered poses in 10/11 deliver the astrolabe
interaction robustly today.

## Open (optional next)

Independent **cloak-cloth flutter** decoupled from the pose — needs the sheet 7–9
layers composited as a real rig (body + legs + cloak-main/edge + head + foreleg +
astrolabe), driven by `--obs-wind`. The shared registration in sheets 6–11 makes
this buildable if the extra fidelity is wanted.
