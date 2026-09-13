import {test, expect} from '@playwright/test';
import {open, surfaces, layout} from './helpers.mjs';

test('corporate discovery is singular, release-safe and content-first on mobile', async ({page}, info) => {
  await page.emulateMedia({reducedMotion:'reduce'});
  await open(page, surfaces[0], info);
  const products = page.getByRole('region', {name:'Products', exact:true});
  await expect(products).toHaveCount(1);
  await expect(products.getByRole('heading', {level:3})).toHaveCount(6);
  await expect(page.getByText('How the systems relate', {exact:true})).toHaveCount(1);
  await expect(products.getByRole('link', {name:'Explore the full Product Atlas'})).toHaveAttribute('href', 'https://horo.run/');
  await expect(page.locator('body')).not.toContainText('Eridanus');
  if (page.viewportSize().width <= 996) {
    const primary = await page.locator(surfaces[0].action).boundingBox();
    const map = await page.locator('svg[aria-label="Product constellations"]').boundingBox();
    expect(primary.y + primary.height).toBeLessThan(map.y);
  }
  await layout(page);
});

test('corporate documentation index links to existing publishers without inventing docs', async ({page}, info) => {
  await open(page, {...surfaces[0], url:'http://127.0.0.1:4174/docs/intro'}, info);
  const article = page.locator('article');
  await expect(article.getByRole('link', {name:/ documentation$/})).toHaveCount(5);
  await expect(article.getByText('No public documentation yet.', {exact:false})).toHaveCount(1);
  await expect(article).not.toContainText('Eridanus');
  await expect(article.getByRole('link', {name:'Product overview'})).toHaveAttribute('href', /^https:\/\//);
  await layout(page);
});

test('archive keeps dated native discovery with one visible heading', async ({page}, info) => {
  await open(page, {...surfaces[0], url:'http://127.0.0.1:4174/blog/archive'}, info);
  await expect(page.locator('.hero__subtitle')).toBeHidden();
  await expect(page.locator('main a[href^="/blog/"]').first()).toBeVisible();
  await layout(page);
});
