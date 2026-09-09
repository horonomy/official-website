/** Evidence uses fresh anonymous local contexts; private/product URLs are never inputs. */
import {expect} from '@playwright/test';
import {execFileSync} from 'node:child_process';
import {readFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {validateReview} from './baseline-review.mjs';
import os from 'node:os';
import AxeBuilder from '@axe-core/playwright';
import {canonicalFontRequest, settled} from './fonts.mjs';

export const surfaces = [
  {name:'website', url:'http://127.0.0.1:4174/', action:'#observatory a[href="/#products"]', decline:'Reject'},
  {name:'atlas', url:'http://127.0.0.1:4175/', action:'.hn-atlas-card__link', decline:'Decline'},
];
export function traversalKey(info) {
  return process.platform==='darwin'&&info.project.use.browserName==='webkit'?'Alt+Tab':'Tab';
}
export async function json(info, name, value) {
  await info.attach(name, {body:Buffer.from(JSON.stringify(value,null,2)),contentType:'application/json'});
}
export async function open(page, surface, info, {degraded=false,noJavaScript=false}={}) {
  await page.context().route('**/*', route => {
    const url = new URL(route.request().url());
    if (url.origin !== new URL(surface.url).origin && (degraded || route.request().method()!=='GET' || !canonicalFontRequest(url))) return route.abort('blockedbyclient');
    if (degraded && ['image','font'].includes(route.request().resourceType())) return route.abort('failed');
    return route.continue();
  });
  const errors=[];
  page.on('pageerror', error => errors.push(error.message));
  const response = await page.goto(surface.url, {waitUntil:'load'});
  expect(response.status()).toBe(200);
  await settled(page,{noJavaScript});
  const fonts=await page.evaluate(()=>[...document.fonts].map(face=>({family:face.family,status:face.status})));
  if(surface.name==='website'&&!degraded) {
    for(const family of ['Space Grotesk','IBM Plex Mono']) expect(fonts.some(face=>face.family.replace(/["']/g,'')===family&&face.status==='loaded'),'Canonical '+family+' font loaded').toBe(true);
  }
  await expect(page.locator('h1')).toBeVisible();
  const decline = page.getByRole('button', {name:surface.decline,exact:true});
  if (await decline.isVisible()) {
    if(info.project.use.hasTouch) await decline.tap(); else await decline.click();
  }
  // Removing the consent control can expose a link underneath the pointer.
  // Neutral captures must establish their own real pointer state before paint.
  await page.mouse.move(0,0);
  await json(info, surface.name+'-environment', {
    sourceCommit:process.env.QA_SOURCE_COMMIT ?? execFileSync('/usr/bin/git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),
    freshBuild:!!process.env.QA_SOURCE_COMMIT,
    dirty:process.env.QA_SOURCE_DIRTY==='true'||!!execFileSync('/usr/bin/git',['status','--porcelain','--untracked-files=normal'],{encoding:'utf8'}).trim(),
    browser:page.context().browser().version(), platform:os.platform(), architecture:os.arch(),
    viewport:page.viewportSize(), project:info.project.name, url:surface.url, keyboardTraversal:traversalKey(info), consentInput:info.project.use.hasTouch?'tap':'pointer click',
    network:degraded?'loopback; decorative assets and all external requests blocked':'loopback plus existing canonical Google font stylesheet and family files only; analytics blocked', fonts, physicalDevice:false,
  });
  return errors;
}
export async function capture(page, info, name) {
  await info.attach(name, {body:await page.screenshot({fullPage:false}),contentType:'image/png'});
}
export async function layout(page, stage='current view') {
  const state=await page.evaluate(()=>{
    const width=innerWidth,scrollWidth=document.documentElement.scrollWidth,offenders=[];
    if(scrollWidth>width)for(const element of document.querySelectorAll('body *')) {
      const bounds=element.getBoundingClientRect();
      if(!bounds.width)continue;
      const range=document.createRange();range.selectNodeContents(element);
      const content=range.getBoundingClientRect();
      if(bounds.right<=width&&content.right<=width)continue;
      const style=getComputedStyle(element);
      offenders.push({tag:element.tagName,class:element.getAttribute('class'),text:element.textContent?.trim().slice(0,80),left:bounds.left,right:bounds.right,width:bounds.width,contentLeft:content.left,contentRight:content.right,contentWidth:content.width,fontFamily:style.fontFamily,fontSize:style.fontSize,overflowWrap:style.overflowWrap});
      if(offenders.length===12)break;
    }
    return {width,scrollWidth,offenders};
  });
  expect.soft(state.scrollWidth<=state.width,'Page must not overflow horizontally ('+stage+'): '+JSON.stringify(state)).toBe(true);
  await expect.soft(page.locator('h1')).toBeVisible();
}
export async function scan(page, info, name) {
  const result = await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze();
  // Include passing contrast pairs and incomplete regions; the latter need human review.
  await json(info, name+'-accessibility', {violations:result.violations,incomplete:result.incomplete,contrast:result.passes.filter(rule=>rule.id==='color-contrast')});
  expect.soft(result.violations.map(rule=>({id:rule.id,impact:rule.impact,targets:rule.nodes.map(node=>node.target)})), name+' WCAG violations; full contrast data is attached').toEqual([]);
}
export async function stableMotion(page, info, name) {
  const active = await page.evaluate(() => document.getAnimations().filter(a=>a.playState==='running' && a.effect?.getTiming().iterations===Infinity).map(a=>({target:a.effect?.target?.tagName,name:a.animationName ?? null})));
  await json(info, name+'-motion', {activeInfiniteAnimations:active});
  expect.soft(active, 'Reduced motion must stop continuous CSS animation').toEqual([]);
  const first = await page.screenshot();
  await page.waitForTimeout(300);
  const second = await page.screenshot();
  await info.attach(name+'-frame-1',{body:first,contentType:'image/png'});
  await info.attach(name+'-frame-2',{body:second,contentType:'image/png'});
  expect.soft(second.equals(first), 'Reduced motion must render a stable frame (including JS/Canvas)').toBe(true);
}
export async function compare(page, info, name) {
  if (process.env.QA_COMPARE !== '1' && !existsSync(new URL('./baselines/review.json',import.meta.url))) {
    info.annotations.push({type:'baseline',description:'Observation only; no approved visual comparison requested. Human review required.'});
    return;
  }
  const manifest = JSON.parse(await readFile(new URL('./baselines/review.json',import.meta.url),'utf8'));
  validateReview(manifest);
  await expect.soft(page).toHaveScreenshot(name+'.png', {animations:'allow',maxDiffPixels:0,threshold:0});
}

export async function repeatLoad(page, info, name) {
  await page.mouse.move(0,0);
  const frames=[];
  for(let run=0;run<2;run++) {
    await page.reload({waitUntil:'load'});
    await settled(page);
    frames.push(await page.screenshot());
    await info.attach(name+'-load-'+(run+1),{body:frames[run],contentType:'image/png'});
  }
  expect.soft(frames[1].equals(frames[0]),'Equivalent reduced scenes must survive independent reloads without pixel drift').toBe(true);
}

export async function unobscured(control, info, name) {
  const state=await control.evaluate(element=>{
    const r=element.getBoundingClientRect();
    const hit=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);
    return {bounds:{x:r.x,y:r.y,width:r.width,height:r.height},
      insideViewport:r.width>0&&r.height>0&&r.top>=0&&r.left>=0&&r.bottom<=innerHeight&&r.right<=innerWidth,
      receivesInput:!!hit&&element.contains(hit),
      hit:hit?{tag:hit.tagName,name:hit.getAttribute('aria-label')??hit.textContent?.trim().slice(0,80)}:null};
  });
  await json(info,name+'-occlusion',state);
  expect.soft(state.insideViewport,name+' remains inside the viewport').toBe(true);
  expect.soft(state.receivesInput,name+' receives input without an overlay intercepting it').toBe(true);
}

export async function cardTextWithinContent(page, info) {
  const rows=await page.locator('.hn-atlas-card__name, .hn-atlas-card__link').evaluateAll(elements=>elements.map(element=>{
    const card=element.closest('.hn-atlas-card'),bounds=card.getBoundingClientRect(),style=getComputedStyle(card);
    const contentLeft=bounds.left+parseFloat(style.borderLeftWidth)+parseFloat(style.paddingLeft);
    const contentRight=bounds.right-parseFloat(style.borderRightWidth)-parseFloat(style.paddingRight);
    const walker=document.createTreeWalker(element,NodeFilter.SHOW_TEXT),ranges=[];
    while(walker.nextNode()) {
      if(!walker.currentNode.textContent.trim())continue;
      const range=document.createRange();range.selectNodeContents(walker.currentNode);
      for(const rect of range.getClientRects())ranges.push({left:rect.left,right:rect.right,width:rect.width,top:rect.top,bottom:rect.bottom});
    }
    return {tag:element.tagName,text:element.textContent.trim(),href:element.getAttribute('href'),font:getComputedStyle(element).font,contentLeft,contentRight,ranges};
  }));
  await json(info,'atlas-text-200-reflow-320-card-ranges',rows);
  expect.soft(rows.length,'Atlas enlarged card text is present').toBeGreaterThan(0);
  for(const row of rows) {
    expect.soft(row.ranges.length>0&&row.ranges.every(rect=>rect.left>=row.contentLeft&&rect.right<=row.contentRight),'Card text stays inside its content edges: '+JSON.stringify(row)).toBe(true);
  }
}
