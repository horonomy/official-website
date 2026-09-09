import test from 'node:test';
import assert from 'node:assert/strict';
import {canonicalFontRequest,fontStylesheet} from './fonts.mjs';

test('font requests cannot broaden the canonical remote boundary',()=>{
  for(const url of [fontStylesheet,'https://fonts.gstatic.com/s/spacegrotesk/v22/Abc-def.woff2','https://fonts.gstatic.com/s/ibmplexmono/v19/Abc.ttf'])assert.equal(canonicalFontRequest(new URL(url)),true);
  for(const url of [fontStylesheet+'&extra=payload','http://fonts.gstatic.com/s/spacegrotesk/v22/a.woff2','https://fonts.gstatic.com.evil.example/s/spacegrotesk/v22/a.woff2','https://fonts.gstatic.com/s/other/v22/a.woff2','https://fonts.gstatic.com/s/spacegrotesk/v22/a.js','https://fonts.gstatic.com/s/spacegrotesk/v22/a.woff2?payload=1'])assert.equal(canonicalFontRequest(new URL(url)),false);
});
