/** Synthetic utility fixture; never accepted or published as measured evidence. */
export function completeLabFixture() {
  const samples=[];
  for(const surface of ['website','atlas']) {
    for(const device of ['desktop','mobile']) {
      for(let run=1;run<=3;run++)samples.push({surface,device,run,viewport:device==='desktop'?{width:1440,height:1000}:{width:390,height:844},observationMs:30000,lcpMs:200,maxTrustedClickToTwoRafMs:40});
    }
  }
  return {status:'complete',freshBuild:true,dirty:false,sourceCommit:'a'.repeat(40),failures:[],platform:'test-os',architecture:'test-arch',cpu:'test-cpu',browser:'test-browser',method:'synthetic-validator-fixture',samples};
}
