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

Per the cost/scope decision, the observer is a **single fixed image**, not an
animation: `static/img/hero/keeper/keeper.webp` (the keeper standing on the dais,
holding + studying its gold astrolabe — sliced from the registration reference
art). A soft static contact shadow grounds it. Contained to `ObserverSpider`.

The stone-floor light animation (the terrace magic-circle glow/orbit overlay) was
**removed**; the floor's gold paving remains as it is baked into `ground.webp`.

The full frame set + layer rig remain feasible from sheets 6–11 (registered, all
legs) if richer animation is ever wanted — this build intentionally keeps it
static and low-cost.
