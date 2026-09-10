/** Only the font stylesheet already declared in docusaurus.config.ts may leave loopback. */
import {expect} from '@playwright/test';

export const fontStylesheet='https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap';
export const readinessMethod='required-render-v2';
export function canonicalFontRequest(url) {
  return url.href===fontStylesheet || (url.protocol==='https:' && url.hostname==='fonts.gstatic.com' && !url.port && !url.search && !url.hash && /^\/s\/(spacegrotesk|ibmplexmono)\/v\d+\/[\w-]+\.(woff2?|ttf)$/.test(url.pathname));
}
const observations=new WeakMap();

/** Observe actual requests; readiness never starts a second asset download. */
export function observeReadiness(page, {url,degraded=false}) {
  const state={origin:new URL(url).origin,degraded,requests:new Map()};
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
  return {document:document.readyState,fonts:document.fonts.status,images,backgrounds,styles};
}

function documentReadiness(rendered) {
  const pending=[],failures=[];
  if(rendered.document!=='complete')pending.push('document');
  if(rendered.fonts!=='loaded')pending.push('fonts');
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
  const documentState=documentReadiness(rendered),imageState=imageReadiness(rendered,state),observedState=observedReadiness(rendered,state);
  return {pending:[...documentState.pending,...imageState.pending,...observedState.pending],failures:[...documentState.failures,...stylesheetFailures(rendered,state),...imageState.failures,...observedState.failures]};
}

export async function settled(page, {noJavaScript=false}={}) {
  const state=observations.get(page);
  if(!state)throw new Error('Observe required resources before navigating');
  await page.waitForLoadState('load');
  let result;
  await expect.poll(async()=>{
    result=await requiredState(page,state);
    return result.failures.length>0||result.pending.length===0;
  },{timeout:20000,message:'Required document/font/render readiness'+(noJavaScript?' (no JavaScript)':'')}).toBe(true);
  expect(result.failures,'Required render resources failed').toEqual([]);
}
