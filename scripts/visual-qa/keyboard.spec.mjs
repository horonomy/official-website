import {test, expect} from '@playwright/test';
import {surfaces, open, capture, json} from './helpers.mjs';

for (const surface of surfaces) test(surface.name+' supports visible keyboard and pointer activation', async ({page}, info) => {
  await open(page,surface,info);
  await page.reload({waitUntil:'load'});
  await page.keyboard.press('Tab');
  const skip = page.locator(':focus');
  await expect(skip).toHaveText(/Skip to/);
  await capture(page,info,surface.name+'-skip-focus');
  await page.keyboard.press('Enter');
  const target = page.locator(surface.action).first();
  let reached=false;
  const focus=[];
  for (let i=0;i<40;i++) {
    if (await target.evaluate(e=>e===document.activeElement)) {reached=true;break;}
    await page.keyboard.press('Tab');
    focus.push(await page.locator(':focus').evaluate(e=>({tag:e.tagName,name:e.getAttribute('aria-label') ?? e.textContent?.trim().slice(0,100)})));
  }
  await json(info,surface.name+'-tab-order',focus);
  expect(reached,'Primary content action reachable through Tab').toBe(true);
  const style = await target.evaluate(e=>{
    const s=getComputedStyle(e);const r=e.getBoundingClientRect();
    return {outline:s.outline,boxShadow:s.boxShadow,visible:r.top>=0&&r.bottom<=innerHeight};
  });
  await json(info,surface.name+'-focus-style',style);
  expect.soft(style.visible,'Focus must be in viewport').toBe(true);
  expect.soft(style.outline.includes('none') && style.boxShadow==='none','Visible focus indicator').toBe(false);
  await capture(page,info,surface.name+'-keyboard-focus');
  // Record actual trusted activation without leaving the public local evidence boundary.
  await page.evaluate(() => document.addEventListener('click', event => {
    const link=event.target.closest?.('a');
    if (link) {document.documentElement.dataset.qaActivation=String(event.isTrusted);event.preventDefault();}
  }));
  await page.keyboard.press('Enter');
  await expect(page.locator('html')).toHaveAttribute('data-qa-activation','true');
  await target.hover();
  await capture(page,info,surface.name+'-pointer');
  await page.evaluate(()=>delete document.documentElement.dataset.qaActivation);
  if (info.project.use.hasTouch) await target.tap(); else await target.click();
  await expect(page.locator('html')).toHaveAttribute('data-qa-activation','true');
});
