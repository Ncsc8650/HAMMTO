import fs from 'node:fs';
import crypto from 'node:crypto';
const dir='public/data'; fs.mkdirSync(`${dir}/raw`,{recursive:true});
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const read=(p,f)=>fs.existsSync(p)?JSON.parse(fs.readFileSync(p,'utf8')):f;
const old=read(`${dir}/draws.json`,[]), imports=read(`${dir}/imports.json`,[]), conflicts=read(`${dir}/conflicts.json`,[]);
const map=new Map(old.map(d=>[d.drawDate,d]));
const latestUrl='https://www.glo.or.th/api/lottery/getLatestLottery', historyUrl='https://www.glo.or.th/api/checking/getLotteryResult';
async function fetchDraw(url,body){
 const at=new Date().toISOString();
 try {const res=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(20000)});const raw=await res.text(), rawHash=hash(raw);fs.writeFileSync(`${dir}/raw/${rawHash}.json`,raw);
 const log={url,body,retrievedAt:at,rawHash,httpStatus:res.status,parserVersion:'glo-1'};imports.push(log);
 if(!res.ok)throw Error(`HTTP ${res.status}`);const j=JSON.parse(raw), r=j.response?.result??j.response;
 if(!r?.date||!r?.data?.first?.number?.length){log.status='no_result';return;}
 const nums=k=>r.data[k]?.number?.map(n=>n.value)??null;
 const d={id:r.date,drawDate:r.date,firstPrize:nums('first')?.[0]??null,last2:nums('last2')?.[0]??null,front3:nums('last3f'),last3:nums('last3b'),regimeId:r.date>='2015-09-01'?'L6-front3-2015':'L6-legacy',sourceUrl:url,retrievedAt:at,publishedAt:null,verification:'single_source',rawHash,datasetVersion:'glo-1',pdfUrl:r.pdf_url??null};
 if(!/^\d{4}-\d{2}-\d{2}$/.test(d.drawDate)||d.drawDate>at.slice(0,10)||!/^\d{6}$/.test(d.firstPrize)||!/^\d{2}$/.test(d.last2)||[...(d.front3??[]),...(d.last3??[])].some(n=>!/^\d{3}$/.test(n))){log.status='quarantined';log.reason='Invalid result schema';return;}
 const prev=map.get(d.drawDate), keys=['firstPrize','last2','front3','last3'];
 if(prev&&keys.some(k=>JSON.stringify(prev[k])!==JSON.stringify(d[k]))){conflicts.push({drawDate:d.drawDate,previous:prev,incoming:d,resolved:false});map.set(d.drawDate,{...prev,verification:'conflict'});log.status='conflict';}else if(!prev){map.set(d.drawDate,d);log.status='accepted';}else log.status='unchanged';
 console.log(d.drawDate,log.status);
 }catch(e){imports.push({url,body,retrievedAt:at,status:'error',reason:e.message});console.error(e.message);}
}
await fetchDraw(latestUrl,{});
const today=new Date().toISOString().slice(0,10), candidates=[];
for(let y=Number(today.slice(0,4));y>=2016;y--)for(let m=12;m>=1;m--)for(const day of [30,17,16,2,1]){if(day===30&&m!==12)continue;const date=`${y}-${String(m).padStart(2,'0')}-${String(day).padStart(2,'0')}`;if(date<=today)candidates.push(date);}
const attempted=new Set(imports.filter(i=>['accepted','unchanged','no_result','quarantined','conflict'].includes(i.status)&&i.body?.year).map(i=>`${i.body.year}-${i.body.month}-${i.body.date}`));
const limit=Number(process.env.BACKFILL_LIMIT??12);let count=0;let failures=0;
for(const d of candidates){if(map.has(d)||attempted.has(d))continue;if(count++>=limit)break;const [year,month,date]=d.split('-');await fetchDraw(historyUrl,{year,month,date}); failures=imports.at(-1)?.status==='error'?failures+1:0; if(failures>=3){console.error('Circuit breaker: three failures; retry on next run');break;} await new Promise(r=>setTimeout(r,Number(process.env.FETCH_DELAY_MS??2000))); }
const draws=[...map.values()].sort((a,b)=>a.drawDate.localeCompare(b.drawDate));
const datasetHash=hash(JSON.stringify(draws));
for(const [name,value]of Object.entries({draws,imports,conflicts,manifest:{datasetHash,version:'glo-1',generatedAt:new Date().toISOString(),count:draws.length,firstDate:draws[0]?.drawDate,lastDate:draws.at(-1)?.drawDate,source:'GLO official API',verification:'single_source',completeness:'unknown: candidate-date backfill is not an official draw schedule',backfillRemaining:candidates.filter(d=>!map.has(d)&&!attempted.has(d)).length,license:'GLO catalog: Creative Commons Non-Commercial (Any)',myhora:'Direct requests blocked by access challenge; not bypassed'}}))fs.writeFileSync(`${dir}/${name}.json`,JSON.stringify(value,null,2));
console.log(`Saved ${draws.length} draws ${datasetHash}`);
