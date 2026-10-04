import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import ts from 'typescript';
import {renderAnalyticsHead} from '../atlas/analytics.mjs';

function load(relative, context, dependencies = {}) {
  const source = fs.readFileSync(new URL(relative, import.meta.url), 'utf8');
  const code = ts.transpileModule(source, {compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
  const exports = {};
  vm.runInNewContext(code, {...context, exports, require: name => dependencies[name], URL});
  return exports;
}

test('public events omit request secrets, CTA query/hash, emails and repository paths', () => {
  const canary = 'HORO1700_SYNTHETIC';
  const window = {location:{hostname:'horonom.com',pathname:'/',search:`?prompt=${canary}`,hash:`#${canary}`},dataLayer:[]};
  const document = {title:'Horonom',querySelector:()=>({href:`https://horonom.com/blog?repo=${canary}#${canary}`})};
  const context = {window,document};
  const helpers = load('../src/analytics/publicPage.ts', context);
  const {trackHoronomyEvent} = load('../src/analytics/trackEvent.ts', context, {'./publicPage':helpers});
  for (const link_url of [`https://github.com/owner/${canary}?token=${canary}`, `mailto:${canary}@example.invalid`]) {
    trackHoronomyEvent('horonomy_github_click', {cta_location:'nav',link_url,link_domain:'github.com',target_product:'github'});
  }
  assert.equal(JSON.stringify(window.dataLayer).includes(canary), false);
  assert.equal(window.dataLayer[0].page_location, 'https://horonom.com/blog');
  assert.equal(window.dataLayer[0].link_url, 'https://github.com');
  assert.equal(window.dataLayer[1].link_url, '');
});

test('public canonical identity fails closed when absent or foreign', () => {
  for (const candidate of [null, {href:'https://foreign.example/private'}]) {
    const {publicPageUrl}=load('../src/analytics/publicPage.ts', {document:{querySelector:()=>candidate}});
    assert.equal(publicPageUrl(), 'https://horonom.com/');
  }
});

test('initial corporate config and Atlas automatic hits override raw location/referrer', () => {
  const calls=[];const gtag=(...args)=>calls.push(args);
  const {gtagConfigScript}=load('../src/analytics/consentInit.ts', {});
  vm.runInNewContext(gtagConfigScript,{gtag,Date});
  assert.deepEqual(JSON.parse(JSON.stringify(calls[1][1])), {page_location:'https://horonom.com/',page_referrer:''});
  assert.equal(calls[2][2].send_page_view, false);
  calls.length=0;
  const script=renderAnalyticsHead().match(/<script>([\s\S]*?)<\/script>/i)[1];
  const dataLayer=[];
  vm.runInNewContext(script,{window:{dataLayer},dataLayer,localStorage:{getItem:()=>null},Date});
  const config=dataLayer.find(c=>c[0]==='config')[2];
  assert.equal(config.page_location,'https://horo.run/');
  assert.equal(config.page_referrer,'');
});
