import fs from 'node:fs';import crypto from 'node:crypto';
import {frequencyLeaders} from '../src/leaders.mjs';import {walkForward,trackedTargets,trackVersion,bangkokDate,settleRecords} from '../src/tracking.mjs';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8')),write=(p,v)=>fs.writeFileSync(p,JSON.stringify(v,null,2));
const draws=read('public/data/draws.json'),manifest=read('public/data/manifest.json'),path='public/data/tracking.json',now=new Date().toISOString(),today=bangkokDate(now);
let records=fs.existsSync(path)?read(path).records:[];records=settleRecords(records,draws);
// Only the publishing workflow creates dated records. Local builds never backdate picks.
if(process.env.GITHUB_ACTIONS==='true')for(const target of Object.keys(trackedTargets)){
 if(records.some(r=>r.target===target&&r.version===trackVersion&&!r.evaluation))continue;
 const history=draws.filter(d=>d.drawDate<today),rank=frequencyLeaders(history,{target,k:5});if(rank.sets.length!==5)continue;
 const snapshot={target,version:trackVersion,recordedAt:now,recordedDate:today,dataThrough:rank.to,datasetHash:manifest.datasetHash,picks:rank.sets.map(r=>r.number),historyDraws:rank.total,rule:'first available official draw strictly after recorded Bangkok date',runUrl:'https://github.com/'+process.env.GITHUB_REPOSITORY+'/actions/runs/'+process.env.GITHUB_RUN_ID};
 records.push({...snapshot,id:crypto.createHash('sha256').update(JSON.stringify(snapshot)).digest('hex'),evaluation:null});
}
write(path,{updatedAt:now,version:trackVersion,notice:'Public workflow records; not tamper-proof certification. Same-day draws excluded. Missing future draws may delay evaluation. Settled results retained.',records});
write('public/data/tracking-backtests.json',{generatedAt:now,datasetHash:manifest.datasetHash,notice:'Retrospective comparison, fixed top 5, expanding history, not calibration or proof of future advantage. Random expectation conditions on distinct actual winners, not assumptions about prize drawing rules.',results:Object.keys(trackedTargets).map(t=>walkForward(draws,t))});
console.log('Tracking:',records.length,'records; retrospective comparisons generated.');
