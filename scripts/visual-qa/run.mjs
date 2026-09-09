/** Capture only freshly built local source, using the pnpm instance that invoked this command. */
import {execFileSync, spawnSync} from 'node:child_process';

const [mode,...args]=process.argv.slice(2);
if(!['rendered','performance'].includes(mode))throw new Error('Expected rendered or performance');
const pnpm=process.env.npm_execpath;
if(!pnpm)throw new Error('Run via pnpm check:visual or pnpm perf:visual');
const source=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const dirty=!!execFileSync('git',['status','--porcelain','--untracked-files=normal'],{encoding:'utf8'}).trim();
const env={...process.env,QA_SOURCE_COMMIT:source,QA_SOURCE_DIRTY:String(dirty)};
for(const script of ['build','build:atlas']) {
  const result=spawnSync(process.execPath,[pnpm,'run',script],{stdio:'inherit',env});
  if(result.status!==0)process.exit(result.status??1);
}
if(execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim()!==source)throw new Error('Source commit changed during build; rerun');
const command=mode==='rendered' ? [pnpm,'exec','playwright','test','--config','scripts/visual-qa/playwright.config.mjs',...args] : ['scripts/visual-qa/performance.mjs'];
const result=spawnSync(process.execPath,command,{stdio:'inherit',env});
process.exitCode=result.status??1;
