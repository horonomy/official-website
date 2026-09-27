import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {chromium,firefox,webkit} from '@playwright/test';
import {observeReadiness,settled,undecodedImages} from './fonts.mjs';
import {readinessFixture} from './readiness.fixture.mjs';

for(const [engine,type] of Object.entries({chromium,firefox,webkit}))test('required readiness distinguishes render failures from unrelated traffic: '+engine,async()=>{
  const fixture=await readinessFixture();
  let browser;
  try{
    browser=await type.launch();
    const context=await browser.newContext(),page=await context.newPage();
    observeReadiness(page,{url:fixture.origin});
    await page.goto(fixture.origin+'/ready',{waitUntil:'commit'});
    const ready=settled(page);
    await fixture.requested('/asset.svg');
    assert.notEqual(await page.evaluate(()=>document.readyState),'complete');
    fixture.releaseImage();
    await ready;
    assert.ok(fixture.unrelatedPending()>0,'An unrelated real fetch is still open');
    assert.equal(await page.locator('h1').evaluate(e=>getComputedStyle(e).color),'rgb(0, 221, 170)');
    assert.equal(await page.locator('img').evaluate(e=>e.naturalWidth),40);
    await mkdir('design/validation-reports/.generated/readiness',{recursive:true});
    await page.screenshot({path:'design/validation-reports/.generated/readiness/'+engine+'-ready.png'});
    await context.close();
    for(const path of ['/missing-image','/missing-background','/missing-style','/missing-font']){
      const broken=await browser.newContext(),target=await broken.newPage();
      observeReadiness(target,{url:fixture.origin});
      await target.goto(fixture.origin+path,{waitUntil:'load'});
      await assert.rejects(()=>settled(target),/Required render resources failed/);
      await broken.close();
    }
    for(const mode of ['degraded','no-JavaScript']){
      const degraded=mode==='degraded',staticContext=await browser.newContext({javaScriptEnabled:mode!=='no-JavaScript'});
      const target=await staticContext.newPage();
      if(degraded)await staticContext.route('**/*',route=>['image','font'].includes(route.request().resourceType())?route.abort('failed'):route.continue());
      observeReadiness(target,{url:fixture.origin,degraded});
      await target.goto(fixture.origin+(degraded?'/degraded':'/ready'),{waitUntil:'load'});
      await settled(target,{noJavaScript:mode==='no-JavaScript'});
      assert.equal(await target.locator('h1').innerText(),'Required content');
      await target.screenshot({path:'design/validation-reports/.generated/readiness/'+engine+'-'+mode+'.png'});
      await staticContext.close();
    }
  }finally{try{await browser?.close();}finally{await fixture.close();}}
});

/**
 * HORO-1498. The bytes-arrived gate above is not a paint gate: `img.complete` is
 * true while the raster is still undecoded, and `decoding="async"` lets the
 * engine present that frame. Holding `decode()` open proves the wait is on the
 * condition and not on elapsed time — re-floating it would make this return
 * immediately, which is the reload drift this ticket reported.
 */
for(const [engine,type] of Object.entries({chromium,firefox,webkit}))test('a capture waits for every visible image to become paintable: '+engine,async()=>{
  const fixture=await readinessFixture();
  let browser;
  try{
    browser=await type.launch();
    const context=await browser.newContext(),page=await context.newPage();
    await page.addInitScript(()=>{
      // Recorded before the override, so the assertion below is about the engine
      // rather than about this stub: a silent absence would make the gate vacuous.
      window.__decode={calls:0,supported:typeof HTMLImageElement.prototype.decode==='function'};
      const held=new Promise(resolve=>{window.__releaseDecode=resolve;});
      HTMLImageElement.prototype.decode=function(){window.__decode.calls++;return held;};
    });
    observeReadiness(page,{url:fixture.origin});
    await page.goto(fixture.origin+'/ready',{waitUntil:'commit'});
    fixture.releaseImage();
    const ready=settled(page);
    // Racing the two makes the regression report itself: a gate that no longer
    // consults decode() returns here and says so, rather than timing out on a
    // call that is never coming.
    await Promise.race([
      page.waitForFunction(()=>window.__decode.calls>0),
      ready.then(()=>{throw new Error('settled() returned without consulting decode(), so nothing waits for paint readiness');}),
    ]);
    assert.ok(await page.evaluate(()=>window.__decode.supported),'this engine provides HTMLImageElement.decode()');
    // Already-resolved beats anything not yet settled, so this is a real
    // pending-ness check rather than a race against a timer.
    assert.equal(await Promise.race([ready.then(()=>'returned'),Promise.resolve('waiting')]),'waiting');
    // Bounded, and the bound names the image: a capture runs unattended, so
    // "something never became paintable" has to say which something.
    assert.deepEqual(await undecodedImages(page,[fixture.origin+'/asset.svg'],50),
      [fixture.origin+'/asset.svg'+': still not decodable after 50ms']);
    assert.deepEqual(await undecodedImages(page,['http://127.0.0.1:1/absent.svg'],50),[],'no visible image, nothing to wait for');
    await page.evaluate(()=>window.__releaseDecode());
    await ready;
  }finally{try{await browser?.close();}finally{await fixture.close();}}
});
