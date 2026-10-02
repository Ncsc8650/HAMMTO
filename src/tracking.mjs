import {frequencyLeaders} from './leaders.mjs';
import {rng,wilson} from './engine.mjs';
export const trackedTargets={front3:'เลขหน้า 3 ตัว',last3:'เลขท้าย 3 ตัว',last2:'2 ตัวล่าง'};
export const trackVersion='draw-frequency-top5-v1';
export function actualNumbers(d,target){const v=d[target];return (Array.isArray(v)?v:v==null?[]:[v]).filter(n=>typeof n==='string'&&new RegExp('^\\d{'+(target==='last2'?2:3)+'}$').test(n));}
const clean=rows=>rows.filter(d=>!['conflict','demo'].includes(d.verification)).sort((a,b)=>a.drawDate.localeCompare(b.drawDate));
export function randomHitChance(k,u,m){let miss=1;for(let i=0;i<k;i++)miss*=Math.max(0,(u-m-i)/(u-i));return 1-miss;}
export function walkForward(rows,target,{minTrain=30,k=5,seed=20261002}={}){
 const data=clean(rows).filter(d=>actualNumbers(d,target).length),random=rng(seed),universe=target==='last2'?100:1000,results=[];
 for(let i=minTrain;i<data.length;i++){
 const train=data.slice(0,i).filter(d=>d.drawDate<data[i].drawDate),picks=frequencyLeaders(train,{target,k}).sets.map(r=>r.number);if(train.length<minTrain||picks.length!==k)continue;
 const uniform=new Set();while(uniform.size<k)uniform.add(String(Math.floor(random()*universe)).padStart(target==='last2'?2:3,'0'));
 const actual=[...new Set(actualNumbers(data[i],target))];results.push({date:data[i].drawDate,trainThrough:train.at(-1).drawDate,trainDraws:train.length,picks,randomPicks:[...uniform],actual,hit:picks.some(n=>actual.includes(n)),randomHit:[...uniform].some(n=>actual.includes(n)),randomExpected:randomHitChance(k,universe,actual.length)});
 }
 const n=results.length,hits=results.filter(r=>r.hit).length,randomHits=results.filter(r=>r.randomHit).length;
 return {target,version:trackVersion,type:'retrospective-walk-forward',minTrain,k,seed,n,hits,rate:n?hits/n:null,ci:wilson(hits,n),randomHits,randomRate:n?randomHits/n:null,expectedRandomRate:n?results.reduce((s,r)=>s+r.randomExpected,0)/n:null,rows:results};
}
export function bangkokDate(instant){return new Date(new Date(instant).getTime()+7*3600000).toISOString().slice(0,10);}
export function settleRecords(records,rows){return records.map(record=>{
 if(record.evaluation)return record;
 const eligible=clean(rows).find(d=>d.drawDate>record.recordedDate&&actualNumbers(d,record.target).length);
 if(!eligible)return record;
 const actual=actualNumbers(eligible,record.target),matched=record.picks.filter(n=>actual.includes(n));return {...record,evaluation:{drawDate:eligible.drawDate,actual,matched,hit:matched.length>0,rawHash:eligible.rawHash??null,sourceUrl:eligible.sourceUrl??null}};
 });}
