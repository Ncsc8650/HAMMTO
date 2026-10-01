import {predict} from './engine.mjs';
export function evidenceHistory(draws,{scope='all',referenceDate=''}={}){
 const validDate=/^\d{4}-\d{2}-\d{2}$/.test(referenceDate)&&!Number.isNaN(Date.parse(referenceDate));
 if(['month','weekday','day'].includes(scope)&&!validDate)return {rows:[],needsDate:true};
 let rows=draws.filter(d=>!['conflict','demo'].includes(d.verification)&&(!validDate||d.drawDate<referenceDate)).sort((a,b)=>a.drawDate.localeCompare(b.drawDate));
 if(scope==='recent20')rows=rows.slice(-20);
 if(scope==='month')rows=rows.filter(d=>d.drawDate.slice(5,7)===referenceDate.slice(5,7));
 if(scope==='day')rows=rows.filter(d=>d.drawDate.slice(8,10)===referenceDate.slice(8,10));
 if(scope==='weekday')rows=rows.filter(d=>new Date(d.drawDate+'T12:00:00Z').getUTCDay()===new Date(referenceDate+'T12:00:00Z').getUTCDay());
 return {rows,needsDate:false};
}
export function countEvidence(rows,number,target){
 const values=d=>target==='firstPrize'?(d.firstPrize==null?[]:[d.firstPrize]):Array.isArray(d[target])?d[target]:d[target]==null?[]:[d[target]];
 const usable=rows.filter(d=>values(d).length),matched=usable.filter(d=>values(d).includes(number));
 return{number,target,draws:usable.length,hitDraws:matched.length,occurrences:usable.reduce((s,d)=>s+values(d).filter(n=>n===number).length,0),observations:usable.reduce((s,d)=>s+values(d).length,0),rate:usable.length?matched.length/usable.length:null,lastSeen:matched.at(-1)?.drawDate??null,dates:matched.map(d=>d.drawDate)};
}
export function setEvidence(rows,number,lower2){return {whole:countEvidence(rows,number,'firstPrize'),front:countEvidence(rows,number.slice(0,3),'front3'),back:countEvidence(rows,number.slice(-3),'last3'),lower:lower2==null?null:countEvidence(rows,lower2,'last2')};}
export function lowerSets(draws,seed=42){if(!draws.some(d=>/^\d{2}$/.test(d.last2??'')))return [];return predict(draws,'last2',{model:'frequency',seed}).ranking.slice(0,5).map(r=>r.number);}
