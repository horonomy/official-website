import {test, expect} from '@playwright/test';

// Docusaurus owns the links and backdrop; this checks only the missing
// dismissal/focus adapter at every width where its mobile toggle is visible.
for (const width of [320, 390, 768, 996]) {
  for (const reducedMotion of width === 390 ? ['no-preference', 'reduce'] : ['no-preference']) {
    test(`mobile sidebar closes with Escape and Close at ${width}px (${reducedMotion})`, async ({page}, info) => {
      test.skip(!info.project.name.endsWith('-mobile'), 'One mobile input project exercises all sidebar widths');
      await page.setViewportSize({width, height: 844});
      await page.emulateMedia({reducedMotion});
      await page.goto('http://127.0.0.1:4174/', {waitUntil: 'load'});

      const toggle = page.getByRole('button', {name: 'Toggle navigation bar'});
      const sidebar = page.locator('.navbar-sidebar--show');
      await expect(toggle).toBeVisible();
      const reject = page.getByRole('button', {name: 'Reject', exact: true});
      if (await reject.isVisible()) await reject.click();

      await toggle.press('Enter');
      await expect(sidebar).toBeVisible();
      const close = page.getByRole('button', {name: 'Close navigation bar'});
      await expect(close).toBeVisible();
      if (width === 390 && reducedMotion === 'reduce') {
        await info.attach('mobile-sidebar-open', {body: await page.screenshot(), contentType: 'image/png'});
      }
      await close.focus();
      await page.keyboard.press('Escape');
      await expect(sidebar).toHaveCount(0);
      await expect(toggle).toBeFocused();
      if (width === 390 && reducedMotion === 'reduce') {
        await info.attach('mobile-sidebar-escape-focus-returned', {body: await page.screenshot(), contentType: 'image/png'});
      }

      await toggle.press('Enter');
      await expect(sidebar).toBeVisible();
      await close.click();
      await expect(sidebar).toHaveCount(0);
      await expect(toggle).toBeFocused();
    });
  }
}

test('mobile sidebar preserves publisher link navigation after interruption', async ({page}, info) => {
  test.skip(!info.project.name.endsWith('-mobile'), 'Mobile sidebar regression');
  await page.goto('http://127.0.0.1:4174/', {waitUntil: 'load'});
  const reject = page.getByRole('button', {name: 'Reject', exact: true});
  if (await reject.isVisible()) await reject.click();
  const toggle = page.getByRole('button', {name: 'Toggle navigation bar'});
  await toggle.click();
  await expect(page.locator('.navbar-sidebar--show')).toBeVisible();
  await page.locator('.navbar-sidebar').getByRole('link', {name: 'Blog'}).click();
  await expect(page).toHaveURL(/\/blog\/?$/);
  await expect(page.locator('.navbar-sidebar--show')).toHaveCount(0);
});
