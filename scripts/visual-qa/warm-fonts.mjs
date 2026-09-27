/** Acquire the canonical font assets once, before any capture runs. */
import {chromium, firefox, webkit} from '@playwright/test';
import {canonicalFontRequest, fontReadiness} from './fonts.mjs';
import {recordFontResponses, serveCachedFont} from './font-cache.mjs';
import {surfaces} from './helpers.mjs';

/**
 * HORO-1498, third part. The per-run cache takes the whole suite from roughly 270
 * live third-party requests down to one per asset per engine, which is the large
 * part of the fix — but "one" is not "none", and whichever test happened to make
 * that first request still paid for it if it failed. Measured here on one engine,
 * running the same ten tests three times against the same commit: with an empty
 * cache the no-JavaScript fallback capture failed (`Space Grotesk` 3 of 12 faces
 * errored, `IBM Plex Mono` 2 of 10) and 4 assets were recorded; with those 4
 * assets already present the same ten tests passed twice, 10 of 10 each time.
 *
 * So the remaining defect was not the number of live requests but *who* makes
 * them. Acquiring the assets here moves the single live fetch out of the capture
 * and into a named setup step which may retry, and which fails the run outright,
 * up front, saying which family could not be had. A capture keeps `retries: 0`
 * and the readiness gate stays strict: nothing here makes a failing font pass.
 * The retry is on fetching an asset, not on asserting a rendering.
 *
 * Every engine is warmed at every viewport it will be captured at, so the cache
 * holds the union of the weights the site actually requests rather than whichever
 * weights one layout happens to need. Playwright sets no `userAgent` for these
 * projects, so the viewports of one engine share its cache entries and the extra
 * passes are hits rather than fetches.
 */
const engines = {chromium, firefox, webkit};
/** Enough that one bad moment upstream is not a failed run, few enough that a
 *  genuinely unavailable font is reported in seconds rather than minutes. */
const ATTEMPTS = 3;
const READY_TIMEOUT = 15000;

export default async function warmFontCache(config) {
  const targets = surfaces.filter(surface => (surface.fonts ?? []).length > 0);
  if (!targets.length) return;
  const byEngine = new Map();
  for (const project of config.projects) {
    if (!engines[project.use.browserName]) continue;
    byEngine.set(project.use.browserName, [...byEngine.get(project.use.browserName) ?? [], project]);
  }
  for (const [browserName, projects] of byEngine) {
    const browser = await engines[browserName].launch();
    try {
      for (const project of projects) for (const surface of targets) await warm(browser, project, surface);
    } finally {
      await browser.close();
    }
  }
}

async function warm(browser, project, surface) {
  const label = project.name + ' ' + surface.name;
  let outstanding = ['(never observed)'];
  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
    // The same context options the captures use, because a different context could
    // request different assets and leave the ones they need uncached.
    const context = await browser.newContext({...project.use});
    try {
      outstanding = await load(context, surface);
      if (!outstanding.length) return;
    } finally {
      await context.close();
    }
  }
  throw new Error(['Could not acquire the canonical font assets for ' + label + ' in ' + ATTEMPTS + ' attempts.',
    'Outstanding: ' + outstanding.join(', '),
    'The captures need these families to measure real layout, so the run stops here',
    'rather than reporting this as a rendering defect in a later capture.'].join('\n'));
}

/** Load the surface once and report what is still not loaded, rather than throwing:
 *  a failed attempt is information for the retry above, not an outcome. */
async function load(context, surface) {
  const local = new URL(surface.url).origin;
  const page = await context.newPage();
  const remote = url => new URL(url).origin !== local;
  recordFontResponses(page, response => remote(response.url()));
  // The captures' own router, so warming cannot reach anything a capture could not.
  await context.route('**/*', route => {
    const url = new URL(route.request().url());
    if (remote(url) && (route.request().method() !== 'GET' || !canonicalFontRequest(url))) return route.abort('blockedbyclient');
    if (remote(url)) return serveCachedFont(route);
    return route.continue();
  });
  try {
    await page.goto(surface.url, {waitUntil: 'load'});
  } catch (error) {
    return ['navigation failed — ' + error.message.split('\n')[0]];
  }
  const deadline = Date.now() + READY_TIMEOUT;
  let outstanding;
  do {
    const rendered = await page.evaluate(() => ({
      faces: [...document.fonts].map(face => ({family: face.family.replace(/["']/g, ''), status: face.status})),
    }));
    const readiness = fontReadiness(rendered, {fontFamilies: surface.fonts});
    outstanding = [...readiness.pending, ...readiness.failures];
    if (!outstanding.length) return [];
    await page.waitForTimeout(100);
  } while (Date.now() < deadline);
  return outstanding;
}
