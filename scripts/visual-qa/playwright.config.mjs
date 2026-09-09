import {defineConfig} from '@playwright/test';
import {resolve} from 'node:path';

const browsers = (process.env.QA_BROWSERS ?? 'chromium').split(',');
if (browsers.some(name => !['chromium','firefox','webkit'].includes(name))) throw new Error('Invalid QA_BROWSERS');
const viewports = {desktop:{width:1440,height:1000}, tablet:{width:834,height:1112}, mobile:{width:390,height:844}};
export default defineConfig({
  testDir: '.', testMatch: '*.spec.mjs', timeout: 60000,
  fullyParallel: false, workers: 1, retries: 0, forbidOnly: true,
  updateSnapshots: 'none',
  snapshotPathTemplate: '{testDir}/baselines/{platform}/{projectName}/{arg}{ext}',
  outputDir: '../../design/validation-reports/.generated/results',
  reporter: [['list'], ['html', {outputFolder:'design/validation-reports/.generated/report',open:'never'}], ['json', {outputFile:'design/validation-reports/.generated/results.json'}]],
  use: {locale:'en-US', timezoneId:'UTC', colorScheme:'dark', deviceScaleFactor:1,
    serviceWorkers:'block', actionTimeout:10000, navigationTimeout:20000,
    screenshot:'only-on-failure', trace:'retain-on-failure'},
  projects: browsers.flatMap(browserName => Object.entries(viewports).map(([name, viewport]) => ({name:browserName+'-'+name,use:{browserName,viewport,hasTouch:name==='mobile'}}))),
  webServer: {command:'node scripts/visual-qa/server.mjs', cwd:resolve(import.meta.dirname,'../..'), url:'http://127.0.0.1:4174', reuseExistingServer:false, timeout:15000},
});
