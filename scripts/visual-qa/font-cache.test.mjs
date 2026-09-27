/** HORO-1498. One live fetch per font asset per run, taken from the browser's own
 *  response, and a failure that stays a failure rather than being cached into every
 *  remaining test. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, rm} from 'node:fs/promises';
import {readdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {cacheRoot, readEntry, recordFontResponses, serveCachedFont} from './font-cache.mjs';

const STYLESHEET='https://fonts.googleapis.com/css2?family=Space+Grotesk';
const WOFF2='https://fonts.gstatic.com/s/spacegrotesk/v21/a.woff2';

/** A `Route`, reduced to what `serveCachedFont` touches. */
function routing({url=STYLESHEET,userAgent='Engine/1'}={}) {
  const calls={fulfilled:[],continued:0};
  return {calls,route:{
    request:()=>({url:()=>url,allHeaders:async()=>({'user-agent':userAgent})}),
    fulfill:async entry=>{calls.fulfilled.push(entry);},
    continue:async()=>{calls.continued++;},
  }};
}

/** A `Page` that only relays `response` events, plus a `Response` reduced the same
 *  way. The production listener is deliberately detached — a capture must not wait
 *  on bookkeeping — so a test cannot await `deliver`; it waits for the observable
 *  effect instead, with `recorded()` below. */
function recording(isFontResponse=()=>true) {
  const handlers=[];
  recordFontResponses({on:(event,handler)=>{if(event==='response')handlers.push(handler);}},isFontResponse);
  const deliver=({url=STYLESHEET,userAgent='Engine/1',status=200,method='GET',body='@font-face{}',headers={'content-type':'text/css'},bodyThrows=false}={})=>{
    const response={
      url:()=>url, status:()=>status, headers:async()=>headers,
      body:async()=>{if(bodyThrows)throw new Error('no body available');return Buffer.from(body);},
      request:()=>({url:()=>url,method:()=>method,allHeaders:async()=>({'user-agent':userAgent})}),
    };
    for(const handler of handlers)handler(response);
  };
  return {deliver};
}

/** Wait for an asset to be recorded, up to a generous ceiling. Writing an entry is
 *  real filesystem work, so there is no fixed number of turns that is both reliable
 *  and quick; polling the actual condition is deterministic either way. */
async function recorded(url,userAgent='Engine/1') {
  for(let attempt=0;attempt<400;attempt++) {
    const entry=await readEntry(url,userAgent);
    if(entry)return entry;
    await new Promise(resolve=>setTimeout(resolve,5));
  }
  throw new Error('never recorded: '+url);
}

/** Each test gets its own cache directory, as a run does. */
async function scratch(t) {
  const dir=await mkdtemp(join(tmpdir(),'fontcache-'));
  process.env.QA_FONT_CACHE_DIR=dir;
  t.after(async()=>{delete process.env.QA_FONT_CACHE_DIR;await rm(dir,{recursive:true,force:true});});
}

test('an asset the browser has fetched once is served from disk afterwards',async t=>{
  await scratch(t);
  const {deliver}=recording();

  // First request: nothing cached, so the browser makes it -- exactly the
  // behaviour this replaces, and the only live fetch for this asset.
  const first=routing();
  await serveCachedFont(first.route);
  assert.equal(first.calls.continued,1);
  assert.deepEqual(first.calls.fulfilled,[]);

  deliver({body:'REAL BYTES'});
  await recorded(STYLESHEET);

  const second=routing();
  await serveCachedFont(second.route);
  assert.equal(second.calls.continued,0,'a recorded asset must not be refetched');
  assert.equal(second.calls.fulfilled[0].body.toString(),'REAL BYTES');
  assert.equal(second.calls.fulfilled[0].status,200);
});

test('a different engine gets its own entry, not the first engine\'s rules',async t=>{
  // Google Fonts varies `css2` by User-Agent (woff2 vs ttf, unicode-range), and
  // this suite spans three engines plus a mobile UA. A URL-only key would hand
  // firefox the @font-face rules written for chromium, whose faces then never
  // load -- the exact symptom this ticket was filed for.
  await scratch(t);
  const {deliver}=recording();
  deliver({userAgent:'Chromium/1',body:'CHROMIUM CSS'});
  await recorded(STYLESHEET,'Chromium/1');

  const firefox=routing({userAgent:'Firefox/1'});
  await serveCachedFont(firefox.route);
  assert.equal(firefox.calls.continued,1,'a new User-Agent is a cache miss');
  assert.deepEqual(firefox.calls.fulfilled,[]);

  deliver({userAgent:'Firefox/1',body:'FIREFOX CSS'});
  await recorded(STYLESHEET,'Firefox/1');
  const again=routing({userAgent:'Firefox/1'});
  await serveCachedFont(again.route);
  assert.equal(again.calls.fulfilled[0].body.toString(),'FIREFOX CSS');
  assert.equal(readdirSync(cacheRoot()).length,2);
});

test('a family file warmed by one engine is served to the next; the stylesheet is not',async t=>{
  // The family files are content-addressed, so the same URL is the same bytes
  // whoever asks: measured against the real asset, a Chrome, a Firefox and a Safari
  // User-Agent each returned sha256 08949f72..., 14708 bytes and font/woff2. And
  // chromium's and firefox's stylesheets name an identical set of 13 such URLs, so
  // keying them per engine made firefox refetch all 13 live with chromium's
  // byte-identical copies already warm -- which failed for firefox-desktop alone.
  await scratch(t);
  const {deliver}=recording();
  deliver({userAgent:'Chromium/1',url:WOFF2,body:'WOFF2 BYTES',headers:{'content-type':'font/woff2'}});
  await recorded(WOFF2,'Chromium/1');

  const firefox=routing({url:WOFF2,userAgent:'Firefox/1'});
  await serveCachedFont(firefox.route);
  assert.equal(firefox.calls.continued,0,'a warmed family file must not be refetched for another engine');
  assert.equal(firefox.calls.fulfilled[0].body.toString(),'WOFF2 BYTES');
  assert.equal(firefox.calls.fulfilled[0].headers['content-type'],'font/woff2');
  assert.equal(readdirSync(cacheRoot()).length,1,'one entry for the asset, not one per engine');

  // The stylesheet keeps its per-engine entry regardless: webkit is served a
  // different css2 body, and sharing that would hand it chromium's @font-face
  // rules, whose faces then never load.
  deliver({userAgent:'Chromium/1',url:STYLESHEET,body:'CHROMIUM CSS'});
  await recorded(STYLESHEET,'Chromium/1');
  const sheet=routing({url:STYLESHEET,userAgent:'Webkit/1'});
  await serveCachedFont(sheet.route);
  assert.equal(sheet.calls.continued,1,'the stylesheet stays keyed per engine');
  assert.deepEqual(sheet.calls.fulfilled,[]);
});

test('nothing is recorded that the browser did not successfully receive',async t=>{
  await scratch(t);
  const {deliver}=recording();
  // A rate-limit or 5xx recorded here would fail every remaining test in the run
  // for one bad moment; a body that cannot be read is not a fixture at all.
  deliver({url:STYLESHEET+'&rate-limited',status:503,body:'rate limited'});
  deliver({url:STYLESHEET+'&unreadable',bodyThrows:true});
  deliver({url:STYLESHEET+'&preflight',method:'OPTIONS',body:'preflight'});
  // A good response delivered last, awaited: that the recorder got this far proves
  // it had ample opportunity to record the three above, so their absence is a
  // result rather than a race won by the assertion.
  deliver({url:WOFF2,body:'GOOD'});
  await recorded(WOFF2);

  assert.equal(readdirSync(cacheRoot()).length,1,'only the good response');
  for(const suffix of ['&rate-limited','&unreadable','&preflight'])
    assert.equal(await readEntry(STYLESHEET+suffix,'Engine/1'),null,suffix+' must not be cached');

  // So a later request for the rejected asset is still a live one, not a replayed
  // failure.
  const next=routing({url:STYLESHEET+'&rate-limited'});
  await serveCachedFont(next.route);
  assert.equal(next.calls.continued,1);
});

test('a loopback response is not recorded as a font asset',async t=>{
  // The recorder sees every response on the page, including the site's own HTML
  // and JS. Only what the router classified as a canonical remote font may be
  // cached, or a local page would later be served from a stale entry.
  await scratch(t);
  const local='http://127.0.0.1:4174/';
  const {deliver}=recording(response=>!response.url().startsWith(local));
  deliver({url:local+'index.html',body:'<!doctype html>'});
  deliver({url:STYLESHEET,body:'@font-face{}'});
  await recorded(STYLESHEET);

  assert.equal(readdirSync(cacheRoot()).length,1);
  assert.equal(await readEntry(local+'index.html','Engine/1'),null);
});

test('only headers that describe the bytes are replayed',async t=>{
  // A fulfilled response carrying upstream's date/cache-control would differ
  // between the browser's service of an asset and the cache's.
  await scratch(t);
  const {deliver}=recording();
  deliver({url:WOFF2,body:'X',headers:{
    'content-type':'font/woff2','access-control-allow-origin':'*',
    'cache-control':'public, max-age=31536000','date':'Mon, 01 Jan 2026 00:00:00 GMT','alt-svc':'h3=":443"',
  }});
  await recorded(WOFF2);

  const cached=routing({url:WOFF2});
  await serveCachedFont(cached.route);
  assert.deepEqual(cached.calls.fulfilled[0].headers,{'content-type':'font/woff2','access-control-allow-origin':'*'});
});
