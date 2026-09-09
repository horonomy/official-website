import {settled} from './fonts.mjs';
import {test, expect} from '@playwright/test';
import {surfaces, open, capture, json, traversalKey, unobscured} from './helpers.mjs';

for (const surface of surfaces) test(surface.name+' supports visible keyboard and pointer activation', async ({page}, info) => {
  await open(page,surface,info);
  await page.reload({waitUntil:'load'});
  await settled(page);
  await page.keyboard.press(traversalKey(info));
  const skip = page.locator(':focus');
  await expect(skip).toHaveText(/Skip to/);
  await capture(page,info,surface.name+'-skip-focus');
  await page.keyboard.press('Enter');
  const target = page.locator(surface.action).first();
  const unfocused=await target.evaluate(e=>({outline:getComputedStyle(e).outline,boxShadow:getComputedStyle(e).boxShadow}));
  const motion=surface.name==='website'?page.getByRole('button',{name:'Pause scene motion',exact:true}):null;
  let motionReached=false;
  let reached=false;
  const focus=[];
  for (let i=0;i<40;i++) {
    if (await target.evaluate(e=>e===document.activeElement)) {reached=true;break;}
    await page.keyboard.press(traversalKey(info));
    if(motion&&!motionReached&&await motion.evaluate(e=>e===document.activeElement)) {
      motionReached=true;
      await capture(page,info,'website-motion-control-focus');
      await unobscured(motion,info,'Focused scene motion control');
    }
    focus.push(await page.evaluate(()=>{const e=document.activeElement;return {tag:e?.tagName,name:e?.getAttribute('aria-label') ?? e?.textContent?.trim().slice(0,100)};}));
  }
  await json(info,surface.name+'-tab-order',focus);
  expect(reached,'Primary content action reachable through native keyboard traversal').toBe(true);
  if(motion) {
    expect.soft(motionReached,'Scene pause control is reachable through native keyboard traversal').toBe(true);
    await unobscured(motion,info,'Scene motion control after skip and content focus');
  }
  await unobscured(target,info,'Focused primary action');
  const style = await target.evaluate(e=>{
    const s=getComputedStyle(e);const r=e.getBoundingClientRect();
    return {outline:s.outline,outlineWidth:parseFloat(s.outlineWidth),outlineStyle:s.outlineStyle,outlineColor:s.outlineColor,boxShadow:s.boxShadow,visible:r.top>=0&&r.bottom<=innerHeight};
  });
  await json(info,surface.name+'-focus-style',style);
  expect.soft(style.visible,'Focus must be in viewport').toBe(true);
  const transparent=color=>color==='transparent'||/rgba\([^)]*,\s*0\)/.test(color);
  const outline=style.outline!==unfocused.outline&&style.outlineWidth>0&&!['none','hidden'].includes(style.outlineStyle)&&!transparent(style.outlineColor);
  const shadow=style.boxShadow!==unfocused.boxShadow&&style.boxShadow!=='none'&&!transparent(style.boxShadow)&&/[1-9]\d*(?:\.\d+)?px/.test(style.boxShadow);
  expect.soft(outline||shadow,'Nonzero, nontransparent focus indicator').toBe(true);
  await capture(page,info,surface.name+'-keyboard-focus');
  // Record actual trusted activation without leaving the public local evidence boundary.
  await page.evaluate(() => document.addEventListener('click', event => {
    const link=event.target.closest?.('a');
    if (link) {document.documentElement.dataset.qaActivation=String(event.isTrusted);event.preventDefault();}
  }));
  await page.keyboard.press('Enter');
  await expect(page.locator('html')).toHaveAttribute('data-qa-activation','true');
  if(motion) {
    await page.mouse.move(0,0);
    await page.evaluate(()=>scrollTo(0,68));
    await capture(page,info,'website-scrolled-navigation');
    for(const name of ['Blog','GitHub']) {
      const link=page.locator('.navbar').getByRole('link',{name,exact:true});
      if(await link.isVisible()) await unobscured(link,info,'Scrolled navbar '+name);
    }
    for(let i=0;i<40&&!await motion.evaluate(e=>e===document.activeElement);i++) await page.keyboard.press('Shift+'+traversalKey(info));
    await expect.soft(motion).toBeFocused();
    await capture(page,info,'website-scrolled-motion-focus');
    await unobscured(motion,info,'Scene motion control focused after manual scroll');
    for(let i=0;i<40&&!await target.evaluate(e=>e===document.activeElement);i++) await page.keyboard.press(traversalKey(info));
    await expect(target).toBeFocused();
  }
  await target.hover();
  await capture(page,info,surface.name+'-pointer');
  await page.evaluate(()=>delete document.documentElement.dataset.qaActivation);
  if (info.project.use.hasTouch) {
    const box=await target.boundingBox();
    expect.soft(box.width,'Primary touch target width').toBeGreaterThanOrEqual(44);
    expect.soft(box.height,'Primary touch target height').toBeGreaterThanOrEqual(44);
    await target.tap();
  } else await target.click();
  await expect(page.locator('html')).toHaveAttribute('data-qa-activation','true');
});
