import {settled} from './fonts.mjs';
import {test, expect} from '@playwright/test';
import {surfaces, open, capture, layout, scan, traversalKey} from './helpers.mjs';

for (const surface of surfaces) test(surface.name+' reflows narrow text and retains forced-color focus', async ({page}, info) => {
  await page.emulateMedia({reducedMotion:'reduce'});
  await open(page,surface,info);
  await page.setViewportSize({width:320,height:844});
  await capture(page,info,surface.name+'-reflow-320');
  await layout(page,'320px reflow');
  await page.setViewportSize(info.project.use.viewport);
  // Change computed text sizes, not page zoom: this exercises text enlargement alone.
  await page.evaluate(() => {
    const elements=[...document.querySelectorAll('body *')];
    const sizes=elements.map(e=>getComputedStyle(e).fontSize);
    elements.forEach((e,i)=>{if(e instanceof HTMLElement)e.style.fontSize=parseFloat(sizes[i])*2+'px';});
  });
  await capture(page,info,surface.name+'-text-200');
  await layout(page,'200% text');
  await page.reload({waitUntil:'load'});
  await settled(page);
  await scan(page,info,surface.name+'-readability');
  // Axe reads author colors in forced-colors mode, unlike the actual system-color paint.
  // Retain the real forced-color image for contrast review instead of reporting a false ratio.
  await page.emulateMedia({forcedColors:'active'});
  await page.keyboard.press(traversalKey(info));
  await expect.soft(page.locator(':focus')).toHaveText(/Skip to/);
  await capture(page,info,surface.name+'-forced-colors');
  expect.soft(await page.evaluate(()=>matchMedia('(forced-colors: active)').matches)).toBe(true);
});
