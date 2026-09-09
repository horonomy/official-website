/** Comparable evidence must be a complete, clean capture of all expected lab cells. */
function validateSample(sample, seen, label) {
  const viewport=sample?.device==='desktop'?{width:1440,height:1000}:{width:390,height:844};
  if(!sample || !['website','atlas'].includes(sample.surface) || !['desktop','mobile'].includes(sample.device) || !Number.isInteger(sample.run) || sample.run<1 || sample.run>3)throw new Error(label+' has an unexpected sample cell');
  const key=sample.surface+'/'+sample.device+'/'+sample.run;
  if(seen.has(key))throw new Error(label+' has a duplicated sample cell: '+key);
  seen.add(key);
  if(sample.viewport?.width!==viewport.width || sample.viewport?.height!==viewport.height)throw new Error(label+' viewport mismatch: '+key);
  if(!Number.isFinite(sample.observationMs) || sample.observationMs<30000)throw new Error(label+' observation is shorter than thirty seconds: '+key);
  for(const metric of ['lcpMs','maxTrustedClickToTwoRafMs']) {
    if(!Number.isFinite(sample[metric]) || sample[metric]<0)throw new Error(label+' metric unavailable: '+key+'/'+metric);
  }
}

function validateCapture(report, label) {
  if(report?.status!=='complete' || report.freshBuild!==true || report.dirty!==false || !/^[0-9a-f]{40}$/.test(report.sourceCommit??'') || !Array.isArray(report.failures) || report.failures.length) {
    throw new Error(label+' must be complete, clean, freshly built evidence with source provenance and no failures');
  }
  if(!Array.isArray(report.samples) || report.samples.length!==12)throw new Error(label+' requires twelve samples');
  const seen=new Set();
  for(const sample of report.samples)validateSample(sample,seen,label);
}

export function validatePerformanceBaseline(base, current) {
  validateCapture(base,'Baseline');
  validateCapture(current,'Current capture');
  for(const field of ['platform','architecture','cpu','browser','method']) {
    if(typeof base[field]!=='string' || !base[field].trim() || base[field]!==current[field])throw new Error('Performance baseline environment mismatch: '+field);
  }
}
