/** Baselines are review inputs, never an automatic answer to a failing visual test. */
import {execFileSync} from 'node:child_process';
import {readFile} from 'node:fs/promises';

export function validateReview(review) {
  if(!/^HORO-\d+$/.test(review.ticket??''))throw new Error('Baseline review requires a HORO ticket');
  if(typeof review.reason!=='string'||review.reason.trim().length<12)throw new Error('Baseline review requires an explicit reason');
  if(!/^[0-9a-f]{40}$/.test(review.sourceCommit??''))throw new Error('Baseline review requires the captured source commit');
  if(!Array.isArray(review.files)||!review.files.length||review.files.some(f=>!/^((chromium|firefox|webkit)-(desktop|tablet|mobile)\/)?[a-z0-9/-]+\.png$/.test(f)||f.includes('..')))throw new Error('Baseline review requires explicit image paths');
}
if(process.argv[1]?.endsWith('baseline-review.mjs')) {
  const base=process.argv[2]??'origin/main';
  const files=execFileSync('git',['diff','--name-only',base+'...HEAD'],{encoding:'utf8'}).trim().split('\n');
  const changed=files.filter(f=>f.startsWith('scripts/visual-qa/baselines/')&&f.endsWith('.png'));
  if(changed.length){
    const reviewPath='scripts/visual-qa/baselines/review.json';
    if(!files.includes(reviewPath))throw new Error('Changed baselines require an updated review.json with ticket/reason/source');
    const review=JSON.parse(await readFile(reviewPath,'utf8'));validateReview(review);
    for(const file of changed)if(!review.files.includes(file.replace('scripts/visual-qa/baselines/','')))throw new Error('Baseline missing from review: '+file);
  }
  console.log('Baseline changes have explicit review metadata; human visual approval is still required.');
}
