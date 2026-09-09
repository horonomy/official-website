import {test, expect} from '@playwright/test';
import {surfaces, open, capture, layout, scan} from './helpers.mjs';

for (const surface of surfaces) test(surface.name+' retains content without JavaScript or decorative assets', async ({browser}, info) => {
  for (const mode of ['no-javascript','failed-assets']) {
    const context=await browser.newContext({...info.project.use,javaScriptEnabled:mode!=='no-javascript',reducedMotion:'reduce'});
    try {
      const page=await context.newPage();
      await open(page,surface,info,{degraded:mode==='failed-assets'});
      if (mode==='failed-assets') await page.addStyleTag({content:'* {backdrop-filter:none !important;-webkit-backdrop-filter:none !important;}'});
      await capture(page,info,surface.name+'-'+mode);
      await layout(page);
      await expect.soft(page.locator(surface.action).first()).toBeVisible();
      // Axe requires script execution; no-JS evidence checks native DOM and real pixels.
      if (mode==='failed-assets') await scan(page,info,surface.name+'-'+mode);
    } finally {await context.close();}
  }
});
