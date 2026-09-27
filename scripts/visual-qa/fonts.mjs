/** Only the font stylesheet already declared in docusaurus.config.ts may leave loopback. */
import {expect} from '@playwright/test';

export const fontStylesheet='https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap';
export const readinessMethod='required-render-v2';
/** The families the canonical stylesheet above exists to deliver. Readiness waits
 *  for these faces by name; a surface that does not use them declares none. */
export const requiredFontFamilies=['Space Grotesk','IBM Plex Mono'];
export function canonicalFontRequest(url) {
  return url.href===fontStylesheet || (url.protocol==='https:' && url.hostname==='fonts.gstatic.com' && !url.port && !url.search && !url.hash && /^\/s\/(spacegrotesk|ibmplexmono)\/v\d+\/[\w-]+\.(woff2?|ttf)$/.test(url.pathname));
}
const observations=new WeakMap();

/** Observe actual requests; readiness never starts a second asset download. */
export function observeReadiness(page, {url,degraded=false,fontFamilies=[]}) {
  const state={origin:new URL(url).origin,degraded,fontFamilies:degraded?[]:fontFamilies,requests:new Map()};
  observations.set(page,state);
  page.on('request',request=>{
    if(request.isNavigationRequest()&&request.frame()===page.mainFrame())state.requests.clear();
    const target=new URL(request.url()),type=request.resourceType();
    if(target.origin!==state.origin&&!canonicalFontRequest(target))return;
    if(!['document','stylesheet','script','image','font'].includes(type))return;
    if(degraded&&(['image','font'].includes(type)||canonicalFontRequest(target)))return;
    state.requests.set(request,{url:target.href,type,pending:true,error:null});
  });
  page.on('response',response=>{
    const entry=state.requests.get(response.request());
    if(entry&&response.status()>=400)entry.error='HTTP '+response.status();
  });
  page.on('requestfinished',request=>{
    const entry=state.requests.get(request);if(entry)entry.pending=false;
  });
  page.on('requestfailed',request=>{
    const entry=state.requests.get(request);
    if(entry){entry.pending=false;entry.error=request.failure()?.errorText??'Request failed';}
  });
}

function renderedResources() {
  // Plain values also work in Firefox with JavaScript disabled. No page-world
  // promises, synthetic image requests or cross-origin stylesheet rule access.
  const visible=element=>{
    const r=element.getBoundingClientRect(),style=getComputedStyle(element);
    return r.width>0&&r.height>0&&r.bottom>0&&r.right>0&&r.top<innerHeight&&r.left<innerWidth&&style.visibility!=='hidden';
  };
  const images=[...document.images].filter(visible).map(img=>({url:img.currentSrc||img.src,complete:img.complete,width:img.naturalWidth}));
  const backgrounds=[];
  for(const element of document.querySelectorAll('body *'))if(visible(element)){
    for(const pseudo of [null,'::before','::after'])backgrounds.push(getComputedStyle(element,pseudo).backgroundImage);
  }
  const styles=[...document.querySelectorAll('link[rel="stylesheet"]')].filter(link=>!link.disabled&&matchMedia(link.media||'all').matches).map(link=>({url:link.href,loaded:!!link.sheet}));
  const faces=[...document.fonts].map(face=>({family:face.family.replace(/["']/g,''),status:face.status}));
  return {document:document.readyState,fonts:document.fonts.status,faces,images,backgrounds,styles};
}

function documentReadiness(rendered) {
  const pending=[],failures=[];
  if(rendered.document!=='complete')pending.push('document');
  if(rendered.fonts!=='loaded')pending.push('fonts');
  return {pending,failures};
}

/**
 * HORO-1498. `document.fonts.status` is NOT "every declared face has loaded" —
 * per CSS Font Loading it is 'loaded' whenever no load is *in progress*. That
 * includes the window after navigation and before layout has requested any
 * webfont, where the set reports 'loaded' while every face is still 'unloaded'.
 * Gating on the aggregate alone therefore passes vacuously and releases the
 * capture against fallback-font metrics, which is load-dependent and so shows up
 * as a different spec failing on a different engine each run: a per-face
 * assertion fails outright, two reload captures straddle the font swap and drift
 * pixel-wise, and layout measures overflow against the wrong metrics.
 *
 * So wait for the named faces themselves. A face that has genuinely errored is a
 * failure rather than something to keep waiting for.
 *
 * The four states are ordered, and the order is the whole predicate: the
 * canonical stylesheet declares each family at several weights, of which a page
 * requests only the ones it renders, so a family is routinely a mix. `loaded`
 * wins outright. Failing that, a face still `loading` means there is something
 * left to wait for. Failing *that*, an `error` is terminal — the remaining
 * `unloaded` faces are weights this page never asked for and nothing will ever
 * request them, so waiting on them is waiting for nothing. Only an all-
 * `unloaded` family is genuinely still pending: that is the vacuous window
 * above, before layout has requested anything.
 */
export function fontReadiness(rendered, state) {
  const pending=[],failures=[];
  for(const family of state.fontFamilies??[]) {
    const faces=(rendered.faces??[]).filter(face=>face.family===family);
    if(faces.some(face=>face.status==='loaded'))continue;
    if(faces.some(face=>face.status==='loading')){pending.push('font '+family);continue;}
    const errored=faces.filter(face=>face.status==='error').length;
    if(errored)failures.push('Required font unavailable: '+family+' ('+errored+' of '+faces.length+' declared faces failed to load, none loaded)');
    else pending.push('font '+family);
  }
  return {pending,failures};
}

function stylesheetFailures(rendered, state) {
  return rendered.styles.filter(sheet=>!sheet.loaded&&!(state.degraded&&canonicalFontRequest(new URL(sheet.url)))).map(sheet=>'Stylesheet unavailable: '+sheet.url);
}

function imageReadiness(rendered, state) {
  const pending=[],failures=[];
  if(!state.degraded)for(const img of rendered.images){
    if(!img.complete)pending.push(img.url);
    else if(!img.width)failures.push('Image unavailable: '+img.url);
  }
  return {pending,failures};
}

function observedReadiness(rendered, state) {
  const pending=[],failures=[];
  for(const entry of state.requests.values()){
    // Lazy/offscreen decoration cannot hold a viewport capture. Match observed
    // background URLs against browser-computed styles; do not parse/fetch CSS.
    if(entry.type==='image'&&!rendered.images.some(img=>img.url===entry.url)&&!rendered.backgrounds.some(value=>value.includes(entry.url)))continue;
    if(entry.error)failures.push(entry.url+': '+entry.error);
    else if(entry.pending)pending.push(entry.url);
  }
  return {pending,failures};
}

async function requiredState(page, state) {
  const rendered=await page.evaluate(renderedResources);
  const documentState=documentReadiness(rendered),fontState=fontReadiness(rendered,state),imageState=imageReadiness(rendered,state),observedState=observedReadiness(rendered,state);
  return {pending:[...documentState.pending,...fontState.pending,...imageState.pending,...observedState.pending],failures:[...documentState.failures,...fontState.failures,...stylesheetFailures(rendered,state),...imageState.failures,...observedState.failures],
    // The visible set, computed once here, is also what paint readiness below
    // waits on: re-deriving "visible" in a second page function would leave two
    // predicates to keep in step.
    images:rendered.images.map(image=>image.url),
    // Carried for the give-up message below: which item is outstanding is the
    // whole diagnosis, and a capture runs on a machine nobody is watching.
    observed:[...state.requests.values()].filter(entry=>entry.pending||entry.error).map(entry=>entry.type+' '+entry.url+(entry.error?' — '+entry.error:' — in flight')),
    faces:(rendered.faces??[]).map(face=>face.family+'='+face.status),document:rendered.document,fonts:rendered.fonts};
}

/** Long enough that a large raster on a loaded CI runner is not called a defect,
 *  short enough to be a diagnosis rather than a hung job. */
const DECODE_TIMEOUT=15000;

/**
 * HORO-1498, the reported symptom. `img.complete` is "the bytes have arrived",
 * not "the raster is ready to paint", and every scene image on the observatory
 * declares `decoding="async"` (`SceneLayers.tsx`, `ObserverSpider.tsx`), which
 * explicitly permits the engine to present a frame *before* an image has been
 * decoded. `loading="eager"` governs only the fetch, so `load` does not imply
 * painted either. A capture taken the moment the resource gate is satisfied can
 * therefore land on a frame whose layers are still undecoded.
 *
 * That is the reload drift this ticket was filed for. Measured on the failing
 * run: of two captures of the same reduced-motion scene, the second was
 * byte-identical to the baseline and the first was a different, 137 KB smaller
 * image; the difference was confined to y744-1000, 16.3% of the viewport, and
 * per-element it was `img.ground` 96.96% and `img.keeper` 80.46% while
 * `img.background` was 5.76%. One reload caught the ground and keeper layers
 * unpainted and the other hit a warm decode. Nothing about the page differed —
 * only when the shutter opened relative to the decode.
 *
 * `decode()` is the platform's own answer: it resolves once the image can be
 * painted without inducing a decode delay on the next paint. So this waits on
 * the condition itself rather than on elapsed time — a sleep long enough to hide
 * this on one machine is not a guarantee on any other.
 *
 * Exported and parameterised so a test can prove the wait is real without
 * holding a suite open for the full timeout.
 */
export async function undecodedImages(page, urls, timeout=DECODE_TIMEOUT) {
  return page.evaluate(async ({urls, timeout}) => {
    const name=image=>image.currentSrc||image.src;
    const wanted=new Set(urls);
    const targets=[...document.images].filter(image=>wanted.has(name(image)));
    const outcomes=await Promise.all(targets.map(image=>{
      // Never silently skipped: an engine without decode() would make this gate
      // vacuous, and a vacuous gate is how the drift survived in the first place.
      if(typeof image.decode!=='function')return name(image)+': this engine has no HTMLImageElement.decode(), so paint readiness cannot be proven';
      return Promise.race([
        image.decode().then(()=>null,error=>name(image)+': decode rejected — '+(error?.name??'unknown error')),
        new Promise(resolve=>setTimeout(()=>resolve(name(image)+': still not decodable after '+timeout+'ms'),timeout)),
      ]);
    }));
    return outcomes.filter(Boolean);
  }, {urls, timeout});
}

export async function settled(page, {noJavaScript=false}={}) {
  const state=observations.get(page);
  if(!state)throw new Error('Observe required resources before navigating');
  await page.waitForLoadState('load');
  let result;
  const label='Required document/font/render readiness'+(noJavaScript?' (no JavaScript)':'');
  try {
    await expect.poll(async()=>{
      result=await requiredState(page,state);
      return result.failures.length>0||result.pending.length===0;
    },{timeout:20000,message:label}).toBe(true);
  } catch(error) {
    // `expect.poll`'s message is fixed before polling starts, so it can only
    // ever report that readiness timed out — never what readiness was still
    // waiting for. Attaching the last observed state is the difference between
    // a diagnosable CI failure and a rerun.
    throw new Error([label+' timed out.',
      'Still pending: '+(result?.pending.join(', ')||'(none — readiness raced its own poll)'),
      'document='+result?.document+' fonts='+result?.fonts,
      'Declared faces: '+(result?.faces.join(', ')||'(none)'),
      'Requests in flight or failed: '+(result?.observed.join(', ')||'(none)')].join('\n'),{cause:error});
  }
  expect(result.failures,'Required render resources failed').toEqual([]);
  // Resources arriving is not the same event as the scene being paintable, so
  // this runs after the gate above rather than inside it: the URLs to wait on are
  // the visible set that gate just judged complete.
  //
  // Skipped without JavaScript, where a page-world promise never settles because
  // nothing in the page runs. That surface keeps the bytes-arrived guarantee
  // only, which is sound for it: it has no script, so no animation, no lazy
  // decode trigger and no state to race.
  //
  // Skipped when degraded for the same reason `imageReadiness` is: that surface
  // exists to prove the page survives images being unavailable, so an image which
  // cannot be decoded is the premise of the test rather than a failure of it.
  if(!noJavaScript&&!state.degraded) {
    const undecoded=await undecodedImages(page,result.images);
    expect(undecoded,'Visible images must be paintable before a capture').toEqual([]);
  }
}
