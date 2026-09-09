import test from 'node:test';
import assert from 'node:assert/strict';
import {cumulativeLayoutShift} from './performance-metrics.mjs';

test('CLS preserves early-start clusters and splits at one-second and five-second boundaries',()=>{
  const shift=(start,value=.125)=>({start,value});
  const early=[200,900,1700,2500,3300,4100,4900,5100].map(start=>shift(start));
  assert.equal(cumulativeLayoutShift(early),1);
  assert.equal(cumulativeLayoutShift([shift(200),shift(1200)]),.125);
  assert.equal(cumulativeLayoutShift([...early,shift(5200)]),1);
  assert.equal(cumulativeLayoutShift([...early,shift(7000,.75),shift(7100,.75)]),1.5);
  assert.equal(cumulativeLayoutShift([]),0);
});
