/** Evidence uses fresh anonymous local contexts; private/product URLs are never inputs. */
import {expect} from '@playwright/test';
import {execFileSync} from 'node:child_process';
import {readFile} from 'node:fs/promises';
import os from 'node:os';
import AxeBuilder from '@axe-core/playwright';

export const surfaces = [
  {name:'website', url:'http://127.0.0.1:4174/', action:'#observatory a[href="/#products"]', decline:'Reject'},
  {name:'atlas', url:'http://127.0.0.1:4175/', action:'.hn-atlas-card__link', decline:'Decline'},
];
export async function json(info, name, value) {
  await info.attach(name, {body:Buffer.from(JSON.stringify(value,null,2)),contentType:'application/json'});
}
export async function open(page, surface, info, {degraded=false}={}) {
  await page.context().route('**/*', route => {
    const url = new URL(route.request().url());
    if (url.origin !== new URL(surface.url).origin) return route.abort('blockedbyclient');
    if (degraded && ['image','font'].includes(route.request().resourceType())) return route.abort('failed');
    return route.continue();
  });
  const errors=[];
  page.on('pageerror', error => errors.push(error.message));
  const response = await page.goto(surface.url, {waitUntil:'load'});
  expect(response.status()).toBe(200);
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('h1')).toBeVisible();
  const decline = page.getByRole('button', {name:surface.decline,exact:true});
  if (await decline.isVisible()) await decline.click();
  await json(info, surface.name+'-environment', {
    sourceCommit:process.env.QA_SOURCE_COMMIT ?? execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),
    freshBuild:!!process.env.QA_SOURCE_COMMIT,
    dirty:process.env.QA_SOURCE_DIRTY==='true'||!!execFileSync('git',['status','--porcelain','--untracked-files=normal'],{encoding:'utf8'}).trim(),
    browser:page.context().browser().version(), platform:os.platform(), architecture:os.arch(),
    viewport:page.viewportSize(), project:info.project.name, url:surface.url,
    network:'loopback; uncached; all external requests blocked', physicalDevice:false,
  });
  return errors;
}
export async function capture(page, info, name) {
  await info.attach(name, {body:await page.screenshot({fullPage:false}),contentType:'image/png'});
}
export async function layout(page) {
  expect.soft(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Page must not overflow horizontally').toBe(true);
  await expect.soft(page.locator('h1')).toBeVisible();
}
export async function scan(page, info, name) {
  const result = await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze();
  // Include passing contrast pairs and incomplete regions; the latter need human review.
  await json(info, name+'-accessibility', {violations:result.violations,incomplete:result.incomplete,contrast:result.passes.filter(rule=>rule.id==='color-contrast')});
  expect.soft(result.violations, name+' WCAG violations').toEqual([]);
}
export async function stableMotion(page, info, name) {
  const active = await page.evaluate(() => document.getAnimations().filter(a=>a.playState==='running' && a.effect?.getTiming().iterations===Infinity).map(a=>({target:a.effect?.target?.tagName,name:a.animationName ?? null})));
  await json(info, name+'-motion', {activeInfiniteAnimations:active});
  expect.soft(active, 'Reduced motion must stop continuous CSS animation').toEqual([]);
  const first = await page.screenshot();
  await page.waitForTimeout(300);
  const second = await page.screenshot();
  expect.soft(second.equals(first), 'Reduced motion must render a stable frame (including JS/Canvas)').toBe(true);
}
export async function compare(page, info, name) {
  if (process.env.QA_COMPARE !== '1') {
    info.annotations.push({type:'baseline',description:'Observation only; no approved visual comparison requested. Human review required.'});
    return;
  }
  const manifest = JSON.parse(await readFile(new URL('./baselines/review.json',import.meta.url),'utf8'));
  expect(manifest.ticket).toMatch(/^HORO-\d+$/);
  expect(manifest.reason?.trim().length).toBeGreaterThan(10);
  expect(manifest.sourceCommit).toMatch(/^[0-9a-f]{40}$/);
  await expect.soft(page).toHaveScreenshot(name+'.png', {animations:'allow',maxDiffPixels:0});
}
