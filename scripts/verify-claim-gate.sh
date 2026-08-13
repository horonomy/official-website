#!/usr/bin/env bash
#
# Proves the claim gate fails when it should.
#
# WHY THIS IS A SCRIPT AND NOT A TRANSCRIPT
#
# The first version of this gate was published with a hand-written log
# asserting it had been "proven to fail". Two of its four rules were inert at
# the time, and one rule was a tautology that could only ever pass. A recorded
# transcript proves the state of the gate on the day someone ran it; it cannot
# notice when a later edit takes a rule back out of service. This script is
# re-runnable, so the claim is checkable rather than quoted.
#
# Each mutation below is a real regression, several of them defects this gate
# actually shipped with. For each, the script asserts the EXACT exit code:
#
#   0  clean            2  the gate is broken (a rule is inert, or misconfigured)
#   1  findings
#
# Exit code 2 versus 1 is the point of several cases: a gate that has stopped
# working must not report that as "found nothing", and must not report it as a
# finding either.
#
# Usage:  bash scripts/verify-claim-gate.sh
# Takes a few minutes: most mutations require a rebuild to reach the HTML.

set -uo pipefail
cd "$(dirname "$0")/.."

GATE="scripts/check-product-claims.mjs"
CONFIG="scripts/claim-gate-config.json"
LIFECYCLE="src/data/productLifecycle.ts"
CARDS="src/components/HeroUniverse/ProductCards.tsx"
SECTIONS="src/components/Sections/index.tsx"
INDEX="src/pages/index.tsx"
INTRO="docs/intro.md"

PASS=0
FAIL=0

FILES=("$GATE" "$CONFIG" "$LIFECYCLE" "$CARDS" "$SECTIONS" "$INDEX" "$INTRO")

# Snapshot to a temp dir and restore from that — NOT `git checkout`.
#
# The first version of this script restored with `git checkout --`, which
# restores from the index or HEAD, not from the working tree it started with.
# Run against uncommitted work it silently reverts the very changes it was
# written to verify: it destroyed the gate fixes it was supposed to prove, then
# reported six failures caused by its own cleanup. A verifier must not be able
# to damage the thing it verifies.
SNAP="$(mktemp -d)"
for f in "${FILES[@]}"; do
  mkdir -p "$SNAP/$(dirname "$f")"
  cp "$f" "$SNAP/$f"
done

restore() {
  for f in "${FILES[@]}"; do cp "$SNAP/$f" "$f"; done
}
cleanup() { restore; rm -rf "$SNAP"; }
trap cleanup EXIT

build() { CI=true pnpm build >/dev/null 2>&1; }

# mutate <file> <sed-expression>
#
# Asserts the edit actually changed the file. A sed whose pattern no longer
# matches is a silent no-op, and a no-op mutation makes the gate look correct
# for the wrong reason — the run reports "clean" and the reader credits the
# gate. That exact mistake put a defect through this suite once already, so a
# mutation that does not land is a hard failure of the verifier, not a finding.
mutate() {
  local file="$1" expr="$2" before after
  before="$(md5 -q "$file" 2>/dev/null || md5sum "$file" | cut -d' ' -f1)"
  sed -i.bak "$expr" "$file" && rm -f "$file.bak"
  after="$(md5 -q "$file" 2>/dev/null || md5sum "$file" | cut -d' ' -f1)"
  if [ "$before" = "$after" ]; then
    printf '  ERROR mutation did not apply to %s\n          %s\n' "$file" "$expr"
    FAIL=$((FAIL + 1))
    return 1
  fi
}

# assert <label> <expected-exit> [rebuild]
assert() {
  local label="$1" want="$2" rebuild="${3:-no}"
  [ "$rebuild" = "rebuild" ] && build
  node "$GATE" >/tmp/claim-gate-check.log 2>&1
  local got=$?
  if [ "$got" -eq "$want" ]; then
    printf '  PASS  %-58s exit %s\n' "$label" "$got"
    PASS=$((PASS + 1))
  else
    printf '  FAIL  %-58s exit %s, wanted %s\n' "$label" "$got" "$want"
    sed -n '1,4p' /tmp/claim-gate-check.log | sed 's/^/          /'
    FAIL=$((FAIL + 1))
  fi
  restore
}

echo "Claim gate control run — $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "commit $(/usr/bin/git rev-parse --short HEAD)"
echo

echo "BASELINE"
build
assert "unmodified tree" 0

echo
echo "REGRESSIONS THIS GATE SHIPPED WITH (both were found in review, not by me)"

# The original defect, verbatim. Docusaurus minifies the build and drops quotes
# from attribute values; in the current build 36 of 43 hrefs are unquoted. An
# extractor written only for the quoted form reads almost nothing and reports
# every page clean. The first self-test missed this because it asserted only
# "did the rule fire at all" against a fixture carrying two independent
# violations, so the quoted one alone satisfied it.
perl -0pi -e "s/  const re = new RegExp\(\n    '.*?',\n    'gi',\n  \);/  const re = new RegExp('\\\\\\\\b' + attr + '\\\\\\\\s*=\\\\\\\\s*\"([^\"]*)\"', 'gi');/s" "$GATE"
assert "attrValues reverted to quoted-only" 2

# The tautology. `expectedLabels` was parsed out of productLifecycle.ts, and the
# rendered pill comes from that same map — so editing it moved both sides at
# once and the gate stayed green while the site shipped the new string. The gate
# now keeps its own lifecycle -> label map in claim-gate-config.json.
mutate "$LIFECYCLE" "s/release_candidate: 'Release candidate',/release_candidate: 'Generally Available — Enterprise Ready',/" \
  && assert "label map edited to an unapproved string" 1 rebuild

echo
echo "CONTENT REGRESSIONS — one per rule, through a real build"

mutate "$SECTIONS" 's/can hold an action instead of answering it/governs every action an agent takes/' \
  && assert "banned absolute in visible product copy" 1 rebuild

mutate "$INDEX" 's|description="Horonomy is an|description="Comprehensive governance. Horonomy is an|' \
  && assert "banned absolute in the meta description" 1 rebuild

mutate "$INTRO" 's|https://agent-assembly.com|https://not-canonical-agent-assembly.example.com|' \
  && assert "product link off the canonical host" 1 rebuild

mutate "$CARDS" 's/^              {maturity}$/              Generally Available/' \
  && assert "maturity pill hardcoded in markup" 1 rebuild

echo
echo "THE GATE'S OWN CONFIGURATION"

# The cheapest way to make a phrase gate green is to empty its list. Without the
# floor, that reports success.
python3 -c "
import json;p='$CONFIG';d=json.load(open(p));d['phrases']=[];json.dump(d,open(p,'w'))"
assert "phrase catalogue emptied" 2

# A registry lifecycle member with no expected label would be unchecked, so an
# incomplete map is a broken gate rather than a permissive one.
python3 -c "
import json;p='$CONFIG';d=json.load(open(p));d['maturity_labels'].pop('release_candidate');json.dump(d,open(p,'w'))"
assert "a registry lifecycle member left unmapped" 2

echo
echo "RESTORED"
build
assert "tree restored" 0

echo
echo "=============================================="
printf 'passed %d, failed %d\n' "$PASS" "$FAIL"
[ "$FAIL" -eq 0 ] || echo "THE GATE IS NOT DOING WHAT IT CLAIMS."
exit $([ "$FAIL" -eq 0 ] && echo 0 || echo 1)
