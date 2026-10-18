const months=['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
export function parseN3(html){
 const heading=html.match(/<h5 class="text-center">([^<]+)<\/h5>/)?.[1],date=heading?.match(/(\d+)\s+(\S+)\s+(\d{4})/);if(!date||!months.includes(date[2]))throw Error('Missing N3 draw date');
 const drawDate=`${Number(date[3])-543}-${String(months.indexOf(date[2])+1).padStart(2,'0')}-${date[1].padStart(2,'0')}`;
 const get=label=>html.match(new RegExp(label+':<\\/strong>\\s*([\\s\\S]*?)<\\/h4>'))?.[1].replace(/<[^>]+>/g,' ').trim();
 const straight=get('รางวัล 3 ตัวตรง'),two=get('รางวัล 2 ตัวตรง'),special=get('รางวัลพิเศษ'),swap=(get('รางวัล 3 ตัวสลับ')??'').match(/\d{3}/g)??[];
 if(!/^\d{3}$/.test(straight??'')||!/^\d{2}$/.test(two??'')||swap.some(n=>n===straight||[...n].sort().join('')!==[...straight].sort().join('')))throw Error('Invalid N3 numbers');
 return {drawDate,straight,swap,two,special:/^\d{12}$/.test(special??'')?special:null};
}
export function n3Ranking(rows,k=5){const counts=new Map();for(const r of rows)counts.set(r.straight,(counts.get(r.straight)||0)+1);const entries=[...counts].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]));return entries.slice(0,k).map(([number,hits])=>({number,hits,n:rows.length,rate:hits/rows.length,tied:entries.filter(e=>e[1]===hits).length}));}
