import {test, expect} from '@playwright/test';
import {surfaces, open, capture, stableMotion, compare} from './helpers.mjs';

for (const surface of surfaces) test(surface.name+' preserves a static reduced-motion scene on load and change', async ({page}, info) => {
  await page.emulateMedia({reducedMotion:'reduce'});
  await open(page,surface,info);
  await capture(page,info,surface.name+'-reduced');
  await stableMotion(page,info,surface.name+'-reduced-load');
  await compare(page,info,surface.name+'-reduced');
  await page.emulateMedia({reducedMotion:'no-preference'});
  if (surface.name==='website') {
    const scene=page.locator('#observatory');
    await expect.soft(scene).toHaveAttribute('data-hn-motion','running');
    const pause=page.getByRole('button',{name:'Pause scene motion',exact:true});
    await expect(pause).toBeVisible();
    await pause.click();
    await expect.soft(scene).toHaveAttribute('data-hn-motion','static');
    await capture(page,info,'website-paused');
    await page.reload({waitUntil:'load'});
    await expect.soft(scene).toHaveAttribute('data-hn-motion','static');
    await page.getByRole('button',{name:'Resume scene motion',exact:true}).click();
    await expect.soft(scene).toHaveAttribute('data-hn-motion','running');
  }
  await page.emulateMedia({reducedMotion:'reduce'});
  await capture(page,info,surface.name+'-runtime-reduced');
  await stableMotion(page,info,surface.name+'-reduced-change');
});
