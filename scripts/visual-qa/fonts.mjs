/** Only the font stylesheet already declared in docusaurus.config.ts may leave loopback. */
export const fontStylesheet='https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap';
export function canonicalFontRequest(url) {
  return url.href===fontStylesheet || (url.protocol==='https:' && url.hostname==='fonts.gstatic.com' && !url.port && !url.search && !url.hash && /^\/s\/(spacegrotesk|ibmplexmono)\/v\d+\/[\w-]+\.(woff2?|ttf)$/.test(url.pathname));
}
export async function settled(page, {noJavaScript=false}={}) {
  await page.waitForLoadState('networkidle');
  // Firefox does not resolve page-world promises with JavaScript disabled.
  // CSS/network completion and the browser's own screenshot path still work.
  if(!noJavaScript) await page.evaluate(()=>document.fonts.ready);
}
