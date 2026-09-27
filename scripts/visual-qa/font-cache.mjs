/** Fetch each canonical font asset once per run, then serve it from disk. */
import {mkdir, readFile, rename, writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

/**
 * HORO-1498, second half. The site loads its two families from Google Fonts at
 * runtime (`docusaurus.config.ts`), and the readiness gate above waits for those
 * faces to actually load — correctly, because a capture taken against fallback
 * metrics measures the wrong layout. But `open()` runs per test, per project, so
 * a full rendered run made the same ~270 live third-party requests, and a capture
 * suite is only as reliable as the least reliable thing it depends on: runs failed
 * with `Space Grotesk` faces in `error` on a different project each time — once
 * `firefox-mobile` with the other 89 passing, later `firefox-tablet` and
 * `webkit-desktop`. Nothing about the site had changed between them.
 *
 * Retrying the test would have hidden that; raising the timeout would not have
 * helped an already-errored face; and blocking the fonts outright would make every
 * capture measure fallback metrics, which is the defect this gate exists to
 * prevent. So the third-party dependency is reduced to one fetch per asset per run
 * rather than removed: the first request for an asset goes to the network exactly
 * as a visitor's would, its bytes are recorded here, and every later request for
 * the same asset is fulfilled from this cache. What the captures measure stays
 * byte-identical to what a visitor gets.
 *
 * The bytes are taken from the *browser's* own response rather than fetched
 * separately by this process, and that is deliberate. `route.fetch` is served by
 * the Playwright process and validates TLS against Node's trust store, so on a
 * workstation behind a TLS-inspecting proxy every such fetch fails with
 * `self-signed certificate in certificate chain` for a URL the browser itself
 * loads perfectly — measured here, 113 times in one run. Recording the browser's
 * response has no second trust store to disagree with, so the cache works on CI
 * and on a corporate laptop alike, and it cannot serve bytes the browser would not
 * itself have received.
 *
 * Scoped to a single run (`run.mjs` points `QA_FONT_CACHE_DIR` at a per-process
 * directory) so nothing here can carry a stale asset into a later run — and so a
 * run that never reaches the network fails rather than quietly passing against
 * yesterday's bytes.
 */
export function cacheRoot() {
  return process.env.QA_FONT_CACHE_DIR ?? join(tmpdir(), 'hn-visual-qa-fonts');
}

/** Keyed on the User-Agent as well as the URL: Google Fonts serves a different
 *  `css2` body per UA (format and unicode-range), and these projects span three
 *  engines plus a mobile UA, so a single-keyed cache would hand one engine
 *  another's `@font-face` rules. */
function entryPath(url, userAgent) {
  return join(cacheRoot(), createHash('sha256').update(userAgent + '\n' + url).digest('hex') + '.json');
}

export async function readEntry(url, userAgent) {
  try {
    const stored = JSON.parse(await readFile(entryPath(url, userAgent), 'utf8'));
    return {status: stored.status, headers: stored.headers, body: Buffer.from(stored.body, 'base64')};
  } catch {
    return null;
  }
}

export async function writeEntry(url, userAgent, {status, headers, body}) {
  await mkdir(cacheRoot(), {recursive: true});
  const path = entryPath(url, userAgent);
  // Write-then-rename: workers run concurrently and two of them can miss the same
  // asset at once, so a reader must never see a half-written entry — a truncated
  // woff2 would surface as an `error` face rather than as an obviously corrupt
  // file. Rename is atomic, so the last writer wins with a whole entry.
  const staging = path + '.' + process.pid + '.' + createHash('sha256').update(path).digest('hex').slice(0, 8) + '.partial';
  await writeFile(staging, JSON.stringify({status, headers, body: body.toString('base64')}));
  await rename(staging, path);
}

/** Only what a font response needs. Replaying upstream's `cache-control`, `date`
 *  or `alt-svc` would let a fulfilled response differ run to run for reasons
 *  unrelated to the bytes. */
function fontHeaders(headers) {
  const kept = {};
  for (const name of ['content-type', 'access-control-allow-origin']) {
    if (headers[name]) kept[name] = headers[name];
  }
  return kept;
}

/**
 * Fulfil `route` from the cache, or let the browser make the request.
 *
 * A miss is not an error and never fails the request: the browser fetches the
 * asset exactly as it did before this cache existed, and `recordFontResponses`
 * stores the result so the next request is a hit. If the asset genuinely cannot be
 * had, the face lands in `error` and `fontReadiness` names it — the cache neither
 * masks that nor causes it.
 */
export async function serveCachedFont(route) {
  const request = route.request();
  const cached = await readEntry(request.url(), (await request.allHeaders())['user-agent'] ?? '');
  return cached ? route.fulfill(cached) : route.continue();
}

/**
 * Record every canonical font response this page receives, so the next request for
 * the same asset is served from disk.
 *
 * Failures are swallowed on purpose. A response body is not always retrievable —
 * a redirect, or a request the page abandoned on navigation — and none of that is
 * worth failing a capture over: an unrecorded asset simply means the next request
 * for it is another live one, which is the behaviour this replaces.
 */
export function recordFontResponses(page, isFontResponse) {
  page.on('response', response => {
    void (async () => {
      try {
        if (!isFontResponse(response)) return;
        if (response.status() >= 400) return;   // a 5xx cached would fail every later test
        const request = response.request();
        if (request.method() !== 'GET') return;
        const userAgent = (await request.allHeaders())['user-agent'] ?? '';
        if (await readEntry(request.url(), userAgent)) return;
        await writeEntry(request.url(), userAgent, {
          status: response.status(), headers: fontHeaders(await response.headers()), body: await response.body(),
        });
      } catch {
        // Not recordable, so not recorded. The asset stays a live fetch.
      }
    })();
  });
}
