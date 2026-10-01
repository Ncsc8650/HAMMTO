import {rng} from './engine.mjs';
export const sixPrizeTypes={first:{label:'รางวัลที่ 1',amount:6000000,count:1},second:{label:'รางวัลที่ 2',amount:200000,count:5},third:{label:'รางวัลที่ 3',amount:80000,count:10},fourth:{label:'รางวัลที่ 4',amount:40000,count:50},fifth:{label:'รางวัลที่ 5',amount:20000,count:100},near1:{label:'ข้างเคียงรางวัลที่ 1',amount:100000,count:2}};
export const SIX_VERSION='six-digit-position-1';
// Returns a ranking score, not a calibrated probability of winning a prize.
export function sixDigitSets(draws,{prize='first',cutoff='9999-12-31',seed=42,k=5,mode='frequency'}={}){
 if(!sixPrizeTypes[prize])throw Error('Unknown prize category');if(!Number.isInteger(k)||k<1||k>20)throw Error('Invalid number of sets');if(!['frequency','random'].includes(mode))throw Error('Unknown method');
 const history=draws.filter(d=>d.drawDate<cutoff&&d.verification!=='conflict'&&d.verification!=='demo').sort((a,b)=>a.drawDate.localeCompare(b.drawDate));
 const used=history.filter(d=>Array.isArray(d.prizes?.[prize])&&d.prizes[prize].length&&d.prizes[prize].every(n=>typeof n==='string'&&/^\d{6}$/.test(n)));
 const numbers=used.flatMap(d=>d.prizes[prize]),random=rng(seed),positions=Array.from({length:6},()=>Array(10).fill(1));
 for(const x of numbers)for(let i=0;i<6;i++)positions[i][+x[i]]++;
 let sets=[];
 if(mode==='random'){const selected=new Set();while(selected.size<k)selected.add(String(Math.floor(random()*1e6)).padStart(6,'0'));sets=[...selected].map(number=>({number,score:null}));}
 else if(numbers.length){let beam=[{number:'',score:1}];for(let p=0;p<6;p++){const total=positions[p].reduce((a,b)=>a+b,0);beam=beam.flatMap(prefix=>positions[p].map((count,digit)=>({number:prefix.number+digit,score:prefix.score*count/total,tie:random()}))).sort((a,b)=>b.score-a.score||b.tie-a.tie).slice(0,k);}sets=beam.map(({number,score})=>({number,score}));}
 return{sets,prize,mode,seed,version:SIX_VERSION,status:'experimental',scoreType:'uncalibrated product of smoothed digit frequencies',draws:used.length,observations:numbers.length,cutoff:used.at(-1)?.drawDate??null,alpha:1,firstPrizeBaseline:sets.length/1e6};
}
