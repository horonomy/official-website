import {test, expect} from '@playwright/test';
import {surfaces, open, capture, layout, scan} from './helpers.mjs';

for (const surface of surfaces) test(surface.name+' reflows narrow text and retains forced-color focus', async ({page}, info) => {
  await page.emulateMedia({reducedMotion:'reduce'});
  await open(page,surface,info);
  await page.setViewportSize({width:320,height:844});
  await capture(page,info,surface.name+'-reflow-320');
  await layout(page);
  await page.setViewportSize(info.project.use.viewport);
  // Change computed text sizes, not page zoom: this exercises text enlargement alone.
  await page.evaluate(() => {
    const elements=[...document.querySelectorAll('body *')];
    const sizes=elements.map(e=>getComputedStyle(e).fontSize);
    elements.forEach((e,i)=>{if(e instanceof HTMLElement)e.style.fontSize=parseFloat(sizes[i])*2+'px';});
  });
  await capture(page,info,surface.name+'-text-200');
  await layout(page);
  await page.reload({waitUntil:'load'});
  await page.emulateMedia({forcedColors:'active'});
  await page.keyboard.press('Tab');
  await expect.soft(page.locator(':focus')).toHaveText(/Skip to/);
  await capture(page,info,surface.name+'-forced-colors');
  await scan(page,info,surface.name+'-forced-colors');
});
