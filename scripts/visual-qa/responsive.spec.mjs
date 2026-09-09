import {test, expect} from '@playwright/test';
import {surfaces, open, capture, layout, scan} from './helpers.mjs';

for (const surface of surfaces) test(surface.name+' renders readable responsive content', async ({page}, info) => {
  const errors = await open(page,surface,info);
  await capture(page,info,surface.name+'-normal');
  await layout(page);
  await expect.soft(page.locator(surface.action).first()).toBeVisible();
  await scan(page,info,surface.name+'-normal');
  expect.soft(errors,'Uncaught page exceptions').toEqual([]);
});
