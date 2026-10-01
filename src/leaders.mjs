export function frequencyLeaders(draws,{target='last2',k=5,recent=false}={}){
 const width=['last2'].includes(target)?2:['front3','last3'].includes(target)?3:6;
 const valid=new RegExp('^\\d{'+width+'}$');
 let rows=draws.filter(d=>!['conflict','demo'].includes(d.verification)).sort((a,b)=>a.drawDate.localeCompare(b.drawDate));
 if(recent)rows=rows.slice(-20);
 const counts=new Map();let total=0;
 for(const d of rows){const raw=d.prizes?.[target]??d[target];const values=(Array.isArray(raw)?raw:raw==null?[]:[raw]).filter(n=>typeof n==='string'&&valid.test(n));if(!values.length)continue;total++;for(const n of new Set(values)){const entry=counts.get(n)||{number:n,hits:0,dates:[]};entry.hits++;entry.dates.push(d.drawDate);counts.set(n,entry);}}
 const all=[...counts.values()].sort((a,b)=>b.hits-a.hits||a.number.localeCompare(b.number));
 return {total,observed:all.length,sets:all.slice(0,k).map(e=>({...e,rate:e.hits/total,tied:all.filter(v=>v.hits===e.hits).length})),from:rows[0]?.drawDate,to:rows.at(-1)?.drawDate};
}
