/** HORO-1498. The warm-up's retry has to actually wait between attempts. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {backoffMs} from './warm-fonts.mjs';

/**
 * A rate-limit or a dropped connection upstream is not over in the few hundred
 * milliseconds it takes to tear down one browser context and navigate a new one, so
 * back-to-back attempts sample almost the same instant and fail together — which is
 * how a run on main reported three exhausted attempts against a transient upstream
 * failure. This asserts the delay exists and grows; it does not claim to prove the
 * warm-up calls it, which needs a browser and a controllable upstream.
 */
test('the warm-up waits between attempts, for longer each time',()=>{
  assert.ok(backoffMs(1)>0,'a retry with no delay is not a retry');
  assert.ok(backoffMs(2)>backoffMs(1),'a second failure waits longer than the first');
  // Bounded, so a genuinely absent font stays a diagnosis in seconds rather than
  // minutes: the first family that cannot be acquired ends the run.
  assert.ok(backoffMs(1)+backoffMs(2)<=10000,'total waiting stays within a diagnosis, not a hung job');
});
