import {sixDigitSets,sixPrizeTypes} from './six-digit.mjs';
import {frequencyLeaders} from './leaders.mjs';
export function singleSelections(draws,history,seed=42){
 const rows=draws.filter(d=>!['conflict','demo'].includes(d.verification));
 const short=[['top2','2 ตัวบน'],['last2','2 ตัวล่าง'],['front3','เลขหน้า 3 ตัว'],['last3','เลขท้าย 3 ตัว']].map(([target,label])=>{const data=target==='top2'?rows.map(d=>({...d,last2:/^\d{6}$/.test(d.firstPrize??'')?d.firstPrize.slice(-2):null})):rows;const rank=frequencyLeaders(data,{target:target==='top2'?'last2':target,k:1});return {target,label,number:rank.sets[0]?.number??null,hits:rank.sets[0]?.hits??0,n:rank.total,rate:rank.sets[0]?.rate??null,tied:rank.sets[0]?.tied??0,method:'อันดับความถี่รายงวด · เมื่อเสมอเลือกเลขน้อยก่อน'};});
 const six=['first','second','third','fourth','fifth'].map(target=>{const p=sixDigitSets(history,{prize:target,k:1,seed});const number=p.sets[0]?.number??null,usable=history.filter(d=>!['conflict','demo'].includes(d.verification)&&d.prizes?.[target]?.length),hits=usable.filter(d=>d.prizes[target].includes(number)).length;return{target,label:target==='first'?'6 หลัก · รางวัลที่ 1':sixPrizeTypes[target].label,number,hits,n:usable.length,rate:usable.length?hits/usable.length:null,method:'อันดับคะแนนความถี่รายหลัก · ยังไม่รับรองโอกาสทำนาย'};});
 return [six[0],...short,...six.slice(1)];
}
