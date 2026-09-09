import test from 'node:test';
import assert from 'node:assert/strict';
import {validatePerformanceBaseline} from './performance-baseline.mjs';
import {completeLabFixture} from './performance-baseline.fixture.mjs';

test('performance comparison rejects diagnostic provenance and noncomparable sample matrices',()=>{
  const current=completeLabFixture();
  assert.doesNotThrow(()=>validatePerformanceBaseline(completeLabFixture(),current));
  const corruptions=[
    report=>{report.status='failed';},
    report=>{report.freshBuild=false;},
    report=>{report.dirty=true;},
    report=>{delete report.sourceCommit;},
    report=>{report.failures=['A measurement failed'];},
    report=>{report.samples.forEach(sample=>{sample.run=1;});},
    report=>{report.samples[0].viewport={width:9999,height:9999};},
    report=>{report.samples.pop();},
    report=>{report.samples[0].run=4;},
    report=>{report.samples[0].device='tablet';},
    report=>{report.samples[0].observationMs=1000;},
    report=>{report.samples[0].maxTrustedClickToTwoRafMs=null;},
    report=>{report.samples[0].lcpMs=Infinity;},
    report=>{report.cpu='different-cpu';},
    report=>{delete report.method;},
  ];
  for(const corrupt of corruptions) {
    const base=completeLabFixture();corrupt(base);
    assert.throws(()=>validatePerformanceBaseline(base,current));
  }
  const incomplete=completeLabFixture();incomplete.samples[0].run=2;
  assert.throws(()=>validatePerformanceBaseline(completeLabFixture(),incomplete));
});
