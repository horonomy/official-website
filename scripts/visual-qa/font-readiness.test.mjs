/** HORO-1498. The readiness gate must wait for the named faces, not for the
 *  aggregate FontFaceSet status, which is 'loaded' whenever no load is in
 *  progress -- including before layout has requested any webfont at all. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {chromium} from '@playwright/test';
import {fontReadiness,observeReadiness,requiredFontFamilies,settled} from './fonts.mjs';
import {readinessFixture} from './readiness.fixture.mjs';

const loaded={document:'complete',fonts:'loaded'};

test('the aggregate set status does not satisfy readiness for a named face',()=>{
  // The exact defect: aggregate green, face unloaded. Gating on rendered.fonts
  // alone accepts this state; that is what released captures against
  // fallback-font metrics. Readiness must report it as still pending.
  const vacuous={...loaded,faces:[{family:'Space Grotesk',status:'unloaded'},{family:'IBM Plex Mono',status:'unloaded'}]};
  assert.equal(vacuous.fonts,'loaded');
  assert.deepEqual(fontReadiness(vacuous,{fontFamilies:requiredFontFamilies}),
    {pending:['font Space Grotesk','font IBM Plex Mono'],failures:[]});
});

test('readiness is satisfied only once each named face has actually loaded',()=>{
  const half={...loaded,faces:[{family:'Space Grotesk',status:'loaded'},{family:'IBM Plex Mono',status:'loading'}]};
  assert.deepEqual(fontReadiness(half,{fontFamilies:requiredFontFamilies}),
    {pending:['font IBM Plex Mono'],failures:[]});
  const all={...loaded,faces:requiredFontFamilies.map(family=>({family,status:'loaded'}))};
  assert.deepEqual(fontReadiness(all,{fontFamilies:requiredFontFamilies}),{pending:[],failures:[]});
});

test('one loaded weight satisfies a family declared at several weights',()=>{
  // The canonical stylesheet declares Space Grotesk at four weights. Only the
  // weights the page actually renders are fetched, so requiring every face to
  // load would never be satisfied.
  const mixed={...loaded,faces:[
    {family:'Space Grotesk',status:'unloaded'},
    {family:'Space Grotesk',status:'loaded'},
    {family:'Space Grotesk',status:'unloaded'},
  ]};
  assert.deepEqual(fontReadiness(mixed,{fontFamilies:['Space Grotesk']}),{pending:[],failures:[]});
});

test('a face that has errored is a failure, not something to keep waiting for',()=>{
  const broken={...loaded,faces:[{family:'Space Grotesk',status:'error'}]};
  assert.deepEqual(fontReadiness(broken,{fontFamilies:['Space Grotesk']}),
    {pending:[],failures:['Required font unavailable: Space Grotesk (1 of 1 declared faces failed to load, none loaded)']});
});

test('a partly errored family is a failure, not a 20-second wait',()=>{
  // Measured on CI, firefox-mobile: of the 12 declared Space Grotesk faces the
  // 4 this page requested all errored and the other 8 were never requested, so
  // no face was loaded and none ever could be. Requiring *every* face to be
  // 'error' left this waiting on the 8 until the readiness poll gave up --
  // twenty seconds to report a font that had already definitively failed.
  const partly={...loaded,faces:[
    ...Array(8).fill({family:'Space Grotesk',status:'unloaded'}),
    ...Array(4).fill({family:'Space Grotesk',status:'error'}),
  ]};
  assert.deepEqual(fontReadiness(partly,{fontFamilies:['Space Grotesk']}),
    {pending:[],failures:['Required font unavailable: Space Grotesk (4 of 12 declared faces failed to load, none loaded)']});
});

test('an errored weight alongside one still loading is still pending',()=>{
  // The other side of that boundary: one weight 404ing must not condemn a
  // family whose other weight is still in flight and may yet succeed.
  const racing={...loaded,faces:[
    {family:'Space Grotesk',status:'error'},
    {family:'Space Grotesk',status:'loading'},
  ]};
  assert.deepEqual(fontReadiness(racing,{fontFamilies:['Space Grotesk']}),
    {pending:['font Space Grotesk'],failures:[]});
});

test('an errored weight alongside a loaded one is ready',()=>{
  const usable={...loaded,faces:[
    {family:'Space Grotesk',status:'error'},
    {family:'Space Grotesk',status:'loaded'},
  ]};
  assert.deepEqual(fontReadiness(usable,{fontFamilies:['Space Grotesk']}),{pending:[],failures:[]});
});

test('a surface that declares no families is unaffected',()=>{
  // atlas, and every degraded run, where fonts are deliberately blocked.
  const none={...loaded,faces:[{family:'Space Grotesk',status:'unloaded'}]};
  for(const state of [{fontFamilies:[]},{}])assert.deepEqual(fontReadiness(none,state),{pending:[],failures:[]});
});

test('quoted family names from the engine are matched, not compared literally',()=>{
  // Engines report face.family with the quoting from the @font-face rule.
  const quoted={...loaded,faces:[{family:'Space Grotesk',status:'loaded'}]};
  assert.deepEqual(fontReadiness(quoted,{fontFamilies:['Space Grotesk']}),{pending:[],failures:[]});
});

// One real engine, to prove the wiring rather than only the predicate: that a
// browser genuinely produces the vacuous state, and that settled() refuses it.
// The window is a CSS Font Loading property rather than an engine quirk, so the
// cases above carry the coverage and this does not repeat across all three.
test('a real browser produces the vacuous state and settled() refuses it',async()=>{
  const fixture=await readinessFixture();
  let browser;
  try{
    browser=await chromium.launch();
    const context=await browser.newContext(),page=await context.newPage();
    observeReadiness(page,{url:fixture.origin,fontFamilies:['Required']});
    // Serve the delayed image immediately: the declared face must be the only
    // thing readiness is still waiting for, or the assertion proves nothing.
    fixture.releaseImage();
    await page.goto(fixture.origin+'/unused-font',{waitUntil:'load'});
    const rendered=await page.evaluate(()=>({
      document:document.readyState,
      fonts:document.fonts.status,
      faces:[...document.fonts].map(face=>({family:face.family.replace(/["']/g,''),status:face.status})),
    }));
    // The vacuity, measured rather than asserted from the spec text.
    assert.equal(rendered.fonts,'loaded','the aggregate set status reads as loaded');
    assert.deepEqual(rendered.faces,[{family:'Required',status:'unloaded'}],'while the declared face has not loaded');
    assert.deepEqual(fontReadiness(rendered,{fontFamilies:['Required']}).pending,['font Required']);
    // And it says what it was waiting for. `expect.poll`'s own message is fixed
    // before polling starts, so a bare rejection leaves a capture failure on CI
    // indistinguishable between an unloaded face, a stalled asset request and a
    // document that never completed -- the diagnosis has to be in the message.
    await assert.rejects(()=>settled(page),error=>{
      assert.match(error.message,/Required document\/font\/render readiness/);
      assert.match(error.message,/Still pending: font Required/);
      assert.match(error.message,/Declared faces: Required=unloaded/);
      assert.match(error.message,/document=complete fonts=loaded/);
      return true;
    });
    await context.close();
  }finally{try{await browser?.close();}finally{await fixture.close();}}
});
