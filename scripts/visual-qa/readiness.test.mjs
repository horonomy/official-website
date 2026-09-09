import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {chromium,firefox,webkit} from '@playwright/test';
import {observeReadiness,settled} from './fonts.mjs';
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
