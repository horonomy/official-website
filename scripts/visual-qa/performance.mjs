/** Cold local lab evidence. Frame interval is cadence, never effect CPU cost or device FPS. */
import {chromium} from '@playwright/test';
import {execFileSync, spawn} from 'node:child_process';
import {mkdir, writeFile, readFile} from 'node:fs/promises';
import {gzipSync} from 'node:zlib';
import os from 'node:os';

const out='design/validation-reports/.generated/performance';
await mkdir(out,{recursive:true});
const sourceCommit=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const dirty=!!execFileSync('git',['status','--porcelain','--untracked-files=normal'],{encoding:'utf8'}).trim();
const browser=await chromium.launch();
const samples=[];
const failures=[];
const percent=(values,p)=>values.length ? [...values].sort((a,b)=>a-b)[Math.ceil(values.length*p)-1] : null;
const server=spawn(process.execPath,['scripts/visual-qa/server.mjs'],{stdio:['ignore','pipe','inherit']});
try {
  await new Promise((resolve,reject)=>{server.stdout.once('data',resolve);server.once('error',reject);server.once('exit',code=>reject(new Error('QA server exited '+code)));});
  for (const [surface,port] of [['website',4174],['atlas',4175]]) {
    for (const [device,viewport] of [['desktop',{width:1440,height:1000}],['mobile',{width:390,height:844}]]) {
      for (let run=1;run<=3;run++) {
        const context=await browser.newContext({viewport,locale:'en-US',timezoneId:'UTC',colorScheme:'dark',serviceWorkers:'block',deviceScaleFactor:1});
        const page=await context.newPage();
        const origin='http://127.0.0.1:'+port;
        await context.route('**/*',route=>new URL(route.request().url()).origin===origin ? route.continue() : route.abort('blockedbyclient'));
        const cdp=await context.newCDPSession(page);
        await cdp.send('Network.enable');
        await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});
        await cdp.send('Performance.enable');
        await page.addInitScript(()=>{
          const q={lcp:null,shifts:[],events:[],actionFrames:[],longTasks:[],frames:[]};window.__horoQA=q;
          for(const type of ['largest-contentful-paint','layout-shift','event','longtask']){
            new PerformanceObserver(list=>{for(const e of list.getEntries()){
              if(type==='largest-contentful-paint')q.lcp=e.startTime;
              if(type==='layout-shift'&&!e.hadRecentInput)q.shifts.push({start:e.startTime,value:e.value});
              if(type==='event'&&e.interactionId)q.events.push({name:e.name,start:e.startTime,duration:e.duration,interactionId:e.interactionId});
              if(type==='longtask')q.longTasks.push({start:e.startTime,duration:e.duration});
            }}).observe({type,buffered:true,...(type==='event'?{durationThreshold:16}:{})});
          }
        });
        const traceName=surface+'-'+device+'-'+run+'.trace.json.gz';
        await cdp.send('Tracing.start',{categories:'devtools.timeline,blink.user_timing,v8.execute',transferMode:'ReturnAsStream'});
        await page.goto(origin+'/',{waitUntil:'load'});
        await page.evaluate(()=>document.fonts.ready);
        const decline=page.getByRole('button',{name:surface==='website'?'Reject':'Decline',exact:true});
        if(await decline.isVisible())await decline.click();
        await page.evaluate(()=>document.addEventListener('click',event=>{
          if(!event.target.closest?.('a'))return;
          event.preventDefault();
          if(event.isTrusted)requestAnimationFrame(()=>requestAnimationFrame(()=>window.__horoQA.actionFrames.push(performance.now()-event.timeStamp)));
        }));
        const action=page.locator(surface==='website'?'#observatory a[href="/#products"]':'.hn-atlas-card__link').first();
        const initial=await cdp.send('Performance.getMetrics');
        const start=await page.evaluate(()=>{
          performance.mark('qa-scene-start');
          const start=performance.now();let previous=start;
          const frame=now=>{window.__horoQA.frames.push(now-previous);previous=now;if(now-start<30000)requestAnimationFrame(frame);};
          requestAnimationFrame(frame);return start;
        });
        // The pointer/keyboard inputs are real browser events while the persistent scene runs.
        for(let second=0;second<30;second++){
          if(second%5===0){await page.mouse.move(viewport.width*(second%10===0?.7:.3),viewport.height*.4);await page.keyboard.press('Tab');await action.click();}
          await page.waitForTimeout(1000);
        }
        const final=await cdp.send('Performance.getMetrics');
        const values=await page.evaluate(()=>{performance.mark('qa-scene-end');return window.__horoQA;});
        const completed=new Promise(resolve=>cdp.once('Tracing.tracingComplete',resolve));
        await cdp.send('Tracing.end');
        const {stream}=await completed;
        const chunks=[];let bytes=0;
        while(true){const r=await cdp.send('IO.read',{handle:stream,size:1048576});const chunk=Buffer.from(r.data,r.base64Encoded?'base64':'utf8');bytes+=chunk.length;if(bytes>64*1024*1024)throw new Error('Trace exceeds 64 MiB raw cap');chunks.push(chunk);if(r.eof)break;}
        await cdp.send('IO.close',{handle:stream});
        await writeFile(out+'/'+traceName,gzipSync(Buffer.concat(chunks)));
        const delta=name=>(final.metrics.find(x=>x.name===name)?.value??0)-(initial.metrics.find(x=>x.name===name)?.value??0);
        // CLS uses the standard maximum session window, not an unbounded sum.
        let cls=0,session=0,first=0,last=0;
        for(const shift of values.shifts){if(shift.start-last>1000||shift.start-first>5000){session=0;first=shift.start;}session+=shift.value;last=shift.start;cls=Math.max(cls,session);}
        const sample={surface,device,run,viewport,lcpMs:values.lcp,cls,
          maxObservedInteractionMs:values.events.length?Math.max(...values.events.map(e=>e.duration)):null,
          eventTimings:values.events, trustedClickToTwoRafMs:values.actionFrames,
          maxTrustedClickToTwoRafMs:values.actionFrames.length?Math.max(...values.actionFrames):null,sceneLongTasks:values.longTasks.filter(e=>e.start>=start),
          frameIntervalP95Ms:percent(values.frames,.95),
          scriptSeconds:delta('ScriptDuration'),layoutSeconds:delta('LayoutDuration'),styleSeconds:delta('RecalcStyleDuration'),
          jsHeapBytes:final.metrics.find(x=>x.name==='JSHeapUsedSize')?.value,trace:traceName};
        samples.push(sample);
        if(values.actionFrames.length!==6)failures.push(surface+'/'+device+'/'+run+': expected six measured trusted actions');
        if(sample.maxTrustedClickToTwoRafMs>200)failures.push(surface+'/'+device+'/'+run+': trusted action response exceeded 200ms');
        if(sample.lcpMs===null)failures.push(surface+'/'+device+'/'+run+': LCP unavailable');
        if(sample.lcpMs>2500||sample.cls>0.1||sample.maxObservedInteractionMs>200)failures.push(surface+'/'+device+'/'+run+': exceeds local lab LCP 2500ms / CLS 0.1 / observed interaction 200ms ceiling');
        console.log(surface,device,'run',run,JSON.stringify({lcpMs:sample.lcpMs,cls:sample.cls,longTasks:sample.sceneLongTasks.length}));
        await context.close();
      }
    }
  }
} catch(error){failures.push(error.message);}
finally {
  await browser.close();server.kill('SIGTERM');
  const report={sourceCommit,dirty,browser:browser.version(),platform:os.platform(),architecture:os.arch(),cpu:os.cpus()[0]?.model,
    method:'Three fresh contexts per surface/viewport; cache disabled; loopback/no network or CPU throttling; thirty seconds of actual scene rendering with pointer, Tab and six trusted link activations; navigation prevented; external network blocked.',
    limitations:['Local lab, not physical-device evidence.','Observed event duration is not field INP; no observed entries means unavailable, not zero. Trusted click to two RAF callbacks is a local response opportunity proxy, not confirmed display presentation.','RAF intervals are cadence, not scripting/render cost. Trace and total scripting/layout/style durations require attribution against a same-device baseline for effect p95 and new long-task acceptance.','No golden performance baseline was automatically approved.'],samples,failures};
  if(process.env.QA_PERF_BASELINE){
    try{
      const base=JSON.parse(await readFile(process.env.QA_PERF_BASELINE,'utf8'));
      if(base.platform!==report.platform||base.architecture!==report.architecture||base.cpu!==report.cpu||base.browser!==report.browser||base.method!==report.method)throw new Error('Performance baseline environment mismatch');
      for(const surface of ['website','atlas'])for(const device of ['desktop','mobile'])for(const metric of ['lcpMs','maxTrustedClickToTwoRafMs']){
        const old=base.samples.filter(x=>x.surface===surface&&x.device===device).map(x=>x[metric]);
        const next=samples.filter(x=>x.surface===surface&&x.device===device).map(x=>x[metric]);
        if(old.length!==3||next.length!==3||[...old,...next].some(x=>!Number.isFinite(x)))throw new Error('Baseline metric unavailable: '+surface+'/'+device+'/'+metric);
        if(percent(next,.5)>percent(old,.5)*1.1)failures.push(surface+'/'+device+'/'+metric+': median regressed over 10%');
      }
      report.baselineCommit=base.sourceCommit;
    }catch(error){failures.push(error.message);}
  }
  await writeFile(out+'/summary.json',JSON.stringify(report,null,2)+'\n');
  if(failures.length){console.error(failures.join('\n'));process.exitCode=1;}
}
