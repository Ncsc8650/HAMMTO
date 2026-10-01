# คำสั่งสำหรับ Codex: เว็บวิเคราะห์สถิติสลากที่ตรวจสอบได้

เวอร์ชัน 1.0 — วันที่จัดทำ 1 ตุลาคม 2569

## 1. ภารกิจ

สร้างเว็บภาษาไทยสำหรับตรวจสอบผลสลากย้อนหลัง วิเคราะห์หลายวิธี ทดลองจัดอันดับเลข และทดสอบผลอย่างโปร่งใส ให้ใช้งานได้ทั้งมือถือและคอมพิวเตอร์ มีโหมดข้อมูลจริงและโหมดสาธิตที่แยกกันชัดเจน

เอกสารนี้เป็นข้อเสนอการออกแบบโดย AI ไม่ใช่สูตรทำนายจาก MyHora หรือสำนักงานสลากกินแบ่งรัฐบาล แหล่งอ้างอิงท้ายเอกสารรองรับเรื่องข้อมูลและวิธีสถิติ ไม่ได้ยืนยันว่าสูตรใดทำนายหวยได้

เป้าหมายความน่าเชื่อถือคือความถูกต้องของข้อมูล ความโปร่งใส และการทำซ้ำ ไม่ใช่ตกแต่งให้ดูแม่น ไม่มีหลักฐานในเอกสารนี้ว่าทำนายเหนือการสุ่มได้

ทำงานจนได้ระบบที่รันได้ พร้อม README คำสั่งติดตั้ง ผลตรวจสอบ และข้อจำกัดจริง หากแหล่งข้อมูลเข้าถึงไม่ได้ให้สร้างตัวนำเข้า CSV/JSON และโหมดสาธิต ห้ามแต่งผลจริงหรือผล backtest

## 2. กติกาที่ห้ามละเมิด

- ห้ามใช้คำว่า “แม่นแน่นอน”, “การันตี”, “เลขต้องออก” หรือเปอร์เซ็นต์ความแม่นที่ไม่มีผลทดลองรองรับ
- คะแนนจัดอันดับ 82/100 ไม่เท่ากับโอกาสออก 82% ห้ามใช้ป้าย “ความน่าจะเป็น” กับคะแนน normalized
- ภายใต้สมมติฐานแต่ละงวดอิสระและสม่ำเสมอ เลขสองหลักทุกเลขมีโอกาส 1/100 ต่อหนึ่งผล เลขสามหลักมีโอกาส 1/1000 ต่อหนึ่งผล เลขขาดนานไม่ได้เพิ่มโอกาสงวดถัดไป
- ห้ามคัดเฉพาะสูตรที่ชนะหรือช่วงที่ผลงานดีมาแสดง ต้องเก็บสูตรที่แพ้และประวัติการทดลองทั้งหมด
- ห้ามใช้ข้อมูลหลังเวลาที่จำลองการคาดการณ์ แม้ใน normalization, smoothing, feature selection หรือการเลือกน้ำหนัก
- แยกสถานะ descriptive / experimental / validated ภายใต้เกณฑ์ที่ประกาศ ไม่มีสูตรใดเริ่มเป็น validated
- จำนวนวิธีมากไม่ได้เพิ่มหลักฐานอัตโนมัติ วิธีที่สัมพันธ์กันต้องไม่ถูกนับเป็นเสียงสนับสนุนอิสระ
- ไม่สร้างระบบซื้อหวย รับเดิมพัน หรือเร่งให้ผู้ใช้เพิ่มเงินเมื่อแพ้

## 3. แหล่งข้อมูลและการนำเข้า

ใช้ข้อมูลผลรางวัลจากสำนักงานสลากกินแบ่งรัฐบาลเป็นแหล่งหลัก ตรวจสอบกับ MyHora เป็นแหล่งรองเมื่อวันที่และประเภทรางวัลตรงกัน ตรวจสอบ API รูปแบบไฟล์ เงื่อนไขใช้ข้อมูล และสิทธิการนำมาแสดงก่อนใช้งานจริง ห้ามสมมติ endpoint หรือสิทธิใช้งาน

หน้า MyHora เป็นสถิติสรุป ไม่ควรใช้ตารางนับความถี่แทนข้อมูลรายงวดในการ backtest และห้าม hardcode จำนวน 240 งวดหรือช่วง 10 ปี ต้องคำนวณจากข้อมูลที่นำเข้าจริง

เก็บแหล่งข้อมูล URL เวลาที่ดึง เวลาประกาศผลถ้าทราบ checksum ไฟล์ต้นฉบับ parser version และสถานะตรวจสอบ ห้ามใช้เวลาที่ดึงย้อนหลังเป็นหลักฐานว่าเคยมีข้อมูลนั้นก่อนงวดออก

ขั้นตอนนำเข้า:

1. เก็บ raw response/ไฟล์ต้นฉบับแบบไม่แก้ไข
2. parse เข้าพื้นที่ staging พร้อม validation report
3. ตรวจความยาวเลข วันที่ซ้ำ วันที่ผิด และประเภทรางวัล
4. เปรียบเทียบแหล่งหลัก/รอง รายงาน conflict ต่อฟิลด์
5. บันทึกเฉพาะชุดที่ผ่าน หรือแยก quarantined ให้เห็น
6. เผยแพร่ data snapshot ที่มี hash และเวอร์ชัน

เมื่อสองแหล่งขัดกัน ห้ามแก้เงียบ ห้ามเลือกตามเสียงข้างมากโดยไม่มีเหตุผล เก็บค่าทั้งสองและหลักฐานการตัดสินใจ งวดขาดใช้ null พร้อมเหตุผล ห้ามเติมเลขศูนย์แทนผลหาย

## 4. โครงสร้างข้อมูล

เก็บเลขเป็น string เพื่อรักษาศูนย์นำหน้า เช่น "03", "007", "000123"

```typescript
type Draw = {
  id: string;
  drawDate: string; // YYYY-MM-DD Gregorian, วันที่ตาม Asia/Bangkok
  firstPrize: string | null; // 6 หลัก
  last2: string | null; // รางวัลเลขท้ายสองตัวจริง
  front3: string[] | null;
  last3: string[] | null;
  regimeId: string; // กติการางวัลที่ใช้ในช่วงนี้
  sourceUrl: string;
  retrievedAt: string;
  publishedAt: string | null;
  verification: "verified" | "single_source" | "conflict" | "demo";
  rawHash: string;
  datasetVersion: string;
};
```

- top2 = firstPrize.slice(-2) และ top3 = firstPrize.slice(-3) เป็นค่าอนุพันธ์ ไม่ใช่รางวัลแยก
- first3OfFirst = firstPrize.slice(0,3) แยกจาก front3 อย่างชัดเจน
- front3 และ last3 ต้องรองรับจำนวนรางวัลตามกติกาแต่ละยุค ไม่บังคับว่าทุกปีมีจำนวนเท่ากัน
- ห้ามลบผลซ้ำใน array โดยอัตโนมัติ ถ้ากติกาอนุญาตให้เกิดซ้ำ
- derived calendar ได้แก่ weekday, month, dayOfMonth; ใช้วันจริง ไม่บังคับมีแต่วันที่ 1/16
- จันทรคติและนักษัตรต้องมีแหล่งและวิธีแปลงที่ตรวจสอบได้ หากไม่มีให้ปิดคุณลักษณะ ไม่เดาข้อมูล

ตารางระบบเพิ่มเติม: sources, imports, conflicts, dataset_snapshots, formula_registry, experiments, predictions, evaluations, audit_logs

## 5. นิยามกลางก่อนสร้าง 80 วิธี

ให้ y_t เป็นผลของ target ณ งวด t, x เป็นเลขผู้สมัคร, U เป็นจำนวนเลขที่เป็นไปได้ 100 หรือ 1000 และ H_t เป็นเฉพาะข้อมูลก่อนงวด t

- c_W(x): จำนวนครั้งที่ x ปรากฏใน W งวดก่อนหน้า
- n_W: จำนวน observation ที่ใช้จริง ต้องแยก “งวด” กับ “ผลรางวัล” กรณีมีหลายรางวัล
- p_W(x) = (c_W(x)+alpha)/(n_W+alpha*U) สำหรับ target แบบหนึ่งผลต่อ observation
- alpha > 0 เป็นพารามิเตอร์ที่บันทึกและเลือกด้วยข้อมูลฝึกเท่านั้น
- g(x): จำนวนงวดหลังครั้งล่าสุด; ถ้าไม่เคยพบให้รายงาน “อย่างน้อย N งวด” ไม่อ้างว่าเป็นระยะขาดจริงทั้งหมด
- score ใช้จัดอันดับ; probability ต้องไม่ติดลบและรวมเป็น 1 สำหรับ target ผลเดี่ยว พร้อมประเมิน calibration
- W เริ่มต้น 5,10,20,30,50,100 และทั้งหมด เป็นข้อเสนอ AI ไม่ใช่ค่าที่พิสูจน์ว่าเหมาะที่สุด

ทุกวิธีต้องมี id, ชื่อไทย, target, input, นิยามสูตร, พารามิเตอร์, จำนวนตัวอย่าง, ข้อสมมติ, สถานะ, ข้อจำกัด, version และผลทดสอบ ทุก feature เชิงพรรณนาไม่ต้องถูกฝืนให้เป็นสูตรจัดอันดับ

## 6. ทะเบียน 80 วิธีและตัวชี้วัด

ตารางนี้เป็นแนวทาง AI เสนอเอง: D = พรรณนา, E = จัดอันดับทดลอง, Q = ตรวจคุณภาพ ต้องระบุชนิดในหน้าเว็บ กลุ่ม Q ห้ามนำไปลงคะแนนเลขโดยตรง

| ID | วิธี | นิยาม/สิ่งที่คำนวณ | ชนิด |
|---|---|---|---|
| 01 | ความถี่ทั้งชุด | c_all(x)/n_all | D/E |
| 02 | ความถี่ 5 งวด | c_5(x)/n_5 | D/E |
| 03 | ความถี่ 10 งวด | c_10(x)/n_10 | D/E |
| 04 | ความถี่ 20 งวด | c_20(x)/n_20 | D/E |
| 05 | ความถี่ 30 งวด | c_30(x)/n_30 | D/E |
| 06 | ความถี่ 50 งวด | c_50(x)/n_50 | D/E |
| 07 | ความถี่ 100 งวด | c_100(x)/n_100 | D/E |
| 08 | ความถี่ถ่วงเวลา | ผลรวม exp(-lambda*อายุงวด) ของเลข x หารน้ำหนักทั้งหมด | E |
| 09 | ความถี่ปรับเรียบ | Dirichlet smoothing ตาม p_W | E |
| 10 | ความถี่หลักร้อย | นับ 0–9 เฉพาะหลักร้อย | D/E |
| 11 | ความถี่หลักสิบ | นับ 0–9 เฉพาะหลักสิบ | D/E |
| 12 | ความถี่หลักหน่วย | นับ 0–9 เฉพาะหลักหน่วย | D/E |
| 13 | ความถี่ทุกหลัก | นับ occurrences หารจำนวนตำแหน่งทั้งหมด; ไม่ใช้ N งวดเป็น denominator | D |
| 14 | คู่ร้อย–สิบ | นับ ordered pair เฉพาะสองตำแหน่ง | D/E |
| 15 | คู่สิบ–หน่วย | นับ ordered pair เฉพาะสองตำแหน่ง | D/E |
| 16 | แบบจำลองแยกรายหลัก | คูณ probability แต่ละหลักภายใต้สมมติฐานอิสระระหว่างหลัก | E |
| 17 | เลขกลับ | reverse(x); แสดงแยกเลขเดิม/กลับและผลรวมที่ไม่ซ้ำ | D/E |
| 18 | เลขเบิ้ลสองหลัก | ตัวเลขทั้งสองเท่ากัน | D |
| 19 | เลขตอง | ทั้งสามหลักเท่ากัน | D |
| 20 | เลขหาม | สำหรับสามหลัก a=b ที่ตำแหน่งแรก/ท้าย และกลางต่าง | D |
| 21 | สามหลักซ้ำสองตำแหน่ง | มีเลขต่างกันสองชนิดและชนิดหนึ่งซ้ำสองครั้ง | D |
| 22 | สามหลักไม่ซ้ำ | มี digit distinct สามตัว | D |
| 23 | เรียงขึ้นติดกัน | b=a+1,c=b+1 ไม่มี wrap 9→0 | D |
| 24 | เรียงลงติดกัน | b=a-1,c=b-1 ไม่มี wrap 0→9 | D |
| 25 | คู่ติดกัน | มีคู่ตำแหน่งใดที่ผลต่างสัมบูรณ์เท่ากับ 1 | D |
| 26 | ผลรวมสองหลัก | a+b | D/E |
| 27 | ผลรวมสามหลัก | a+b+c | D/E |
| 28 | Digital root | รวมซ้ำจนเหลือหลักเดียว; 000 ให้ 0 | D |
| 29 | ผลต่างสองหลัก | abs(a-b) | D/E |
| 30 | ช่วงกว้างตัวเลข | max(digits)-min(digits) | D |
| 31 | ผลคูณตัวเลข | product(digits), รวมกรณีมี 0 | D |
| 32 | ผลรวม mod 3 | sum(digits)%3 | D |
| 33 | ผลรวม mod 9 | sum(digits)%9; ต่างจาก digital root | D |
| 34 | แบบคู่คี่ | เวกเตอร์ parity ตามตำแหน่ง | D/E |
| 35 | แบบสูงต่ำ | 0–4 ต่ำ,5–9 สูง ตามตำแหน่ง | D/E |
| 36 | จำนวนเลขคู่ | count(digit%2==0) | D |
| 37 | จำนวนเลขสูง | count(digit>=5) | D |
| 38 | มีเลขศูนย์ | indicator(any digit==0) | D |
| 39 | กลุ่มสลับตำแหน่ง | เรียง digits เป็น key; รวม permutation ที่ไม่ซ้ำ | D/E |
| 40 | จำนวนชนิด digit | size(set(digits)) | D |
| 41 | ขาดปัจจุบัน | g(x); never-seen เป็น censored | D/E |
| 42 | ช่องว่างเฉลี่ย | mean ระยะระหว่าง occurrences ที่สังเกตครบ | D |
| 43 | ช่องว่างมัธยฐาน | median ระยะระหว่าง occurrences | D |
| 44 | ส่วนเบี่ยงเบนช่องว่าง | std ระยะ; ไม่คำนวณถ้าตัวอย่างไม่พอ | D |
| 45 | ช่องว่างสูงสุด | max ของ completed intervals | D |
| 46 | Overdue ratio | current gap/mean completed gap; NA เมื่อฐานไม่พอ | E |
| 47 | Gap percentile | ตำแหน่ง current gap เทียบ completed gaps พร้อมคำเตือน censoring | D |
| 48 | ไม่ปรากฏใน W | indicator(c_W(x)==0) ไม่ตีความว่าใกล้ออก | D/E |
| 49 | ซ้ำผลเดิม | indicator(x==y_previous) | D/E |
| 50 | เลขร่วมงวดก่อน | ขนาด intersection ของชุด digits; ไม่ใช่ multiset | D/E |
| 51 | ระยะเชิงตัวเลข | abs(int(x)-int(y_previous)); ไม่มี wrap | D |
| 52 | ใกล้รายหลัก | ผลรวม abs(digit_x-digit_previous) | D/E |
| 53 | Momentum | p_10(x)-p_50(x) | E |
| 54 | Acceleration | momentum ล่าสุดลบ momentum ที่ cutoff ก่อนหน้า | E |
| 55 | กลับจากผลก่อน | indicator(x==reverse(y_previous)) | D/E |
| 56 | หน่วย Markov | P(unit_t=b given unit_previous=a), smooth แถว | E |
| 57 | สิบ Markov | P(tens_t=b given tens_previous=a), smooth แถว | E |
| 58 | ร้อย Markov | P(hundreds_t=b given hundreds_previous=a) | E |
| 59 | คู่คี่เปลี่ยนผ่าน | transition ของ parity pattern งวดก่อน→ถัดไป | E |
| 60 | สูงต่ำเปลี่ยนผ่าน | transition ของ high/low pattern | E |
| 61 | ผลรวมเปลี่ยนผ่าน | bin ผลรวมกำหนดจาก train เท่านั้น แล้วนับ transition | E |
| 62 | เลขเต็มเปลี่ยนผ่าน | U×U sparse matrix; ปิด default เมื่อข้อมูลบาง | E |
| 63 | บนก่อน→ล่างถัดไป | cross-target lag 1 เท่านั้นสำหรับจัดอันดับ | E |
| 64 | บน–ล่างงวดเดียว | สำรวจความสัมพันธ์หลังมีผลครบ ห้ามใช้เป็น input ทำนายงวดนั้น | D |
| 65 | วันในสัปดาห์ | conditional frequency ตามวันจริงของ target draw | D/E |
| 66 | เดือนสากล | conditional frequency ตามเดือน | D/E |
| 67 | วันของเดือน | conditional frequency ตามวันจริง ไม่บังคับ 1/16 | D/E |
| 68 | ข้างขึ้น–แรม | conditional frequency เมื่อมีข้อมูลปฏิทินตรวจสอบแล้ว | D/E |
| 69 | วันจันทรคติ | conditional frequency; ระบุ intercalation/แหล่งแปลง | D/E |
| 70 | ปีนักษัตร | conditional frequency พร้อม convention วันเปลี่ยนปี | D/E |
| 71 | ความครบถ้วน | จำนวนงวดที่พบ/จำนวนตามกำหนดที่ตรวจสอบได้ ไม่เดาว่าทุกปี 24 งวด | Q |
| 72 | ความตรงกันของแหล่ง | verified fields/compared fields พร้อมรายการ conflict | Q |
| 73 | ความถี่คาดหมาย | E=n/U สำหรับผลเดี่ยวสม่ำเสมอ หรือฐานหมวดที่นับ combinatorial | Q |
| 74 | Chi-square | sum((O-E)^2/E), ตรวจเงื่อนไข expected count ก่อนใช้ | Q |
| 75 | Binomial test | ทดสอบเลขหรือหมวดที่กำหนดล่วงหน้าภายใต้ p0 | Q |
| 76 | ช่วงความเชื่อมั่น | Wilson 95% สำหรับ hit rate ผลเดี่ยว เมื่อสมมติฐานเหมาะสม | Q |
| 77 | Entropy | -sum(p*log(p)); รายงาน log base และ normalized /log(U) | Q |
| 78 | Serial dependence | ตรวจ autocorrelation ของ digit/indicator พร้อม lag และ null simulation | Q |
| 79 | Multiple testing | adjusted p ด้วย Holm หรือ BH ตาม family ที่ประกาศ | Q |
| 80 | Null simulation | สร้างข้อมูลสุ่มและรันกระบวนการเลือกสูตรทั้งหมด เปรียบเทียบผลรวม | Q |

วิธี 26–40 ถ้าจัดอันดับตามหมวด ต้องปรับขนาดหมวด: ภายใต้ uniform หมวดผลรวมไม่ได้มีโอกาสเท่ากัน เช่น sum=9 ของเลขสองหลักมีสมาชิก 10 เลข ส่วน sum=0 มี 1 เลข ให้ p(x)=p(group(x))/จำนวนเลขในหมวด ไม่แจกคะแนนให้หมวดใหญ่เพียงเพราะออกบ่อย

## 7. คุณภาพสถิติและการตีความ

- Chi-square 100 หมวดกับ 240 ผลมี expected 2.4 ต่อหมวด ต่ำเกินเกณฑ์ทั่วไป 5: ไม่อ้าง p-value จาก asymptotic test โดยไม่ตรวจ ให้ใช้ Monte Carlo null หรือหมวดที่กำหนดล่วงหน้าและเหมาะสม [S3]
- ทุก test แสดง null hypothesis, sample size, effect size, raw p, adjusted p, family และวิธีปรับ ห้าม p<0.05 เพียงตัวเดียวกลายเป็น “เลขเด่นแน่นอน” [S5]
- การไม่ปฏิเสธ null ไม่ใช่พิสูจน์การสุ่ม และการปฏิเสธ null ไม่ใช่พิสูจน์ว่าทำนายอนาคตได้
- เกณฑ์ sample-size ขั้นต่ำเป็น configuration ที่ AI เสนอ ต้องอธิบายเหตุผล ไม่ใช้ threshold เดียวสร้างตรารับรองทุกวิธี
- กลุ่มข้อมูลบางใช้ smoothing/shrinkage สู่ uniform รายงาน NA เมื่อไม่มีข้อมูล ห้ามแสดง 0% confidence จากข้อมูลหาย
- completed gaps มี selection/censoring; แสดงขอบช่วงข้อมูลและไม่ใช้ percentile เป็น probability
- ปฏิทิน จันทรคติ และนักษัตรเป็นตัวแปรสำรวจ ไม่มีหลักฐานเชิงเหตุผลในเอกสารนี้ว่าทำให้เลขออกเปลี่ยน

## 8. Backtest ที่ไม่เห็นอนาคต

ใช้ chronological walk-forward [S4] ไม่สุ่มสลับ train/test:

1. แยกช่วงพัฒนา ช่วงเลือกพารามิเตอร์ และ final holdout ตามวัน บันทึกก่อนทดลอง
2. เริ่มจาก cutoff ที่มีข้อมูลฝึกเพียงพอ คำนวณทุก feature จาก H_t
3. เลือกสูตร พารามิเตอร์ และน้ำหนักจาก validation ที่อยู่ก่อน t เท่านั้น
4. บันทึก prediction ก่อนอ่านผล y_t
5. evaluate แล้วขยับไปงวดถัดไป
6. final holdout ใช้ประเมินครั้งสุดท้าย ห้ามกลับไปจูนหลังเห็นผล; หากจูนต้องตั้งชุดอนาคตใหม่
7. live prediction ต้องเก็บ server timestamp ก่อนผลประกาศ พร้อม immutable version เพื่อแยกจาก backtest ที่จำลองย้อนหลัง

```text
for t in evaluation_dates:
    history = dataset.filter(drawDate < t)
    settings = select_using_past_validation_only(history)
    model = fit(history, settings)
    prediction = rank(model, target_date=t)
    persist(prediction, cutoff=t, dataset_hash, model_version, seed)
    evaluate(prediction, actual_at_t)
```

กำหนด tie-break ล่วงหน้า เช่น seed ที่บันทึกไว้ ห้ามใช้ผลจริงแก้ลำดับคะแนนเสมอกัน Top K ต้องมี K เลขไม่ซ้ำ ทั้งสูตรและ baseline ใช้ข้อมูล/งวดประเมินเหมือนกัน

## 9. Baseline และ metric

ผลเดี่ยวสองหลักเลือก K เลขไม่ซ้ำ มี uniform hit baseline K/100; สามหลัก K/1000 ภายใต้สมมติฐานสุ่มสม่ำเสมอ

สำหรับ m รางวัลสามหลักและเหตุการณ์ “ถูกอย่างน้อยหนึ่งรางวัล”: หากอิสระและคืนตัวเลข baseline = 1-(1-K/U)^m; หากสุ่มไม่คืน baseline = 1-C(U-K,m)/C(U,m) ต้องยืนยันกติกาก่อนใช้ ห้ามใช้ K/1000 กับเหตุการณ์หลายผลโดยตรง และวิเคราะห์ cluster ระดับงวด

baseline อย่างน้อย: uniform, random Top K หลาย seed, historical frequency แบบง่าย และ fixed predeclared set

แสดง:

- Hit@1/5/10/20 = จำนวนงวดถูก/จำนวนงวดประเมิน พร้อม K และนิยาม “ถูก”
- baseline, ส่วนต่างเปอร์เซ็นต์พอยต์, lift, uncertainty และจำนวนครั้งถูกจริง
- Brier score = sum_j(p_j-I(y=j))^2 ต่อผลเดี่ยว; log loss = -log(p_y)
- calibration ใช้พยากรณ์นอกชุดฝึกจริง หากข้อมูลน้อยให้ปิดกราฟหรือระบุไม่พอ
- cumulative hits, rolling performance, ตารางทุกงวด รวมงวดแพ้
- multiple-prize metrics แยก draw-hit กับ prize-level-hit ห้ามสลับ denominators

Wilson สำหรับ h ครั้งจาก n งวด: p=h/n,z=1.96,
center=(p+z²/(2n))/(1+z²/n),
half=z*sqrt(p(1-p)/n+z²/(4n²))/(1+z²/n).
ช่วงเป็น center±half [S6] ถ้าผลมี dependence ให้ใช้การจำลอง/วิธี block ที่มีเหตุผลและรายงานสมมติฐาน

การประกาศ “ดีกว่า baseline” ต้องอาศัยผลนอกชุดฝึก ความไม่แน่นอน และการควบคุมการเลือกหลายสูตรตามแผน ไม่ใช้แค่ lift>1

## 10. Ensemble และคะแนน

เริ่มทดลองจาก uniform และ simple smoothed frequency ก่อน เปิดวิธีอื่นตามผลทดสอบ ห้ามกำหนดน้ำหนักตามความรู้สึกแล้วเรียกว่า optimal

- descriptive feature ไม่เป็น voting model โดยอัตโนมัติ
- โมเดล probability ที่ valid รวมด้วย p_mix(x)=sum(w_j*p_j(x)), w_j>=0,sum(w_j)=1
- เริ่ม equal-weight เฉพาะกลุ่มที่กำหนดไว้ล่วงหน้า เป็นค่าเริ่มต้นทดลองของ AI
- weight optimization ใช้ inner chronological validation, จำกัดความซับซ้อนและจำนวนการลอง
- รวมสูตรที่ซ้ำ/สัมพันธ์สูงเป็นกลุ่ม ลดการนับซ้ำระหว่าง window ที่ซ้อนกัน
- ถ้าใช้ score-only ให้แสดงอันดับ/คะแนนเท่านั้น ห้าม softmax แล้วอ้างว่าคาลิเบรตแล้ว
- ค่า default ที่ไม่มีหลักฐานเหนือ baseline ต้องแสดงสถานะ “ยังไม่พบหลักฐานว่าดีกว่าการสุ่ม”
- รายงาน ablation: ตัดแต่ละหมวดแล้ว metric เปลี่ยนอย่างไร ใช้เพื่อเข้าใจ ไม่เลือก holdout ซ้ำ
- freeze version หลังออก prediction ห้ามปรับน้ำหนักย้อนหลังแล้วแทน prediction เดิม

## 11. หน้าที่ต้องสร้าง

1. ภาพรวม: target selector, dataset cutoff, จำนวนงวดจริง, สถานะข้อมูล, baseline และข้อความจำกัดคะแนน
2. ข้อมูลย้อนหลัง: ค้นวัน/เลข แสดง raw source และค่าที่ derived, ส่งออก CSV
3. สถิติ: heatmap 10×10, bar รายหลัก, รูปแบบ, gaps พร้อม denominator ทุกกราฟ
4. ห้องทดลอง: เลือกวิธี/ช่วง/พารามิเตอร์ อธิบายสูตรก่อน Run มีป้าย experimental
5. จัดอันดับ: Top K, score/probability type, เหตุผลจากค่าจริง, cutoff, model version
6. ผล backtest: ทุกสูตรและทุกงวด baseline, CI, holdout ช่วงวันที่ และรายการสูตรที่แพ้
7. การตรวจสอบ: data completeness, conflicts, sources, imports, snapshot hash, changelog
8. วิธีวิทยา: ความหมาย metric, สมมติฐาน, gambler's fallacy, reference links
9. หลังบ้าน: import preview, quarantine, resolve conflicts, run/reproduce experiment

หน้าเว็บภาษาไทย ตัวเลขอ่านง่าย สีที่ไม่สร้างความหมาย “รับรองแม่น” มี legend รองรับ screen reader และมือถือ หากไม่มีข้อมูลจริงให้มีแถบ “ข้อมูลสาธิต” ทุกหน้ารวม export ห้ามปะปนผลสาธิตกับ live

การ์ดเลขต้องบอก: เลข target คะแนนชนิดใด จำนวนตัวอย่าง cutoff แหล่งข้อมูล และข้อความ “คะแนนนี้ไม่ใช่โอกาสออก” เมื่อเป็น score-only เหตุผลใช้ template จากผลคำนวณ ห้าม LLM แต่งคำอธิบายความสัมพันธ์ขึ้นเอง

## 12. สถาปัตยกรรมที่เสนอโดย AI

หากมี repo อยู่แล้วตรวจ stack และแนวทางเดิมก่อน หากเริ่มใหม่เสนอ frontend TypeScript/React, backend Python/FastAPI, SQLite สำหรับ local และ PostgreSQL เมื่อมีผู้ใช้หลายคน แยกเครื่องยนต์คำนวณจาก UI

จัดส่วน ingestion, validation, features, models, backtest, metrics, api, ui, tests; ใช้ background job สำหรับงานหนัก cache ตาม dataset hash+cutoff+formula version+parameters ไม่ตามชื่อสูตรอย่างเดียว

API ที่เสนอ:

```text
GET /api/datasets/status
GET /api/draws
GET /api/formulas
POST /api/imports/preview
POST /api/imports/commit
POST /api/experiments
GET /api/experiments/{id}
GET /api/experiments/{id}/predictions
GET /api/rankings?target=last2&cutoff=YYYY-MM-DD
GET /api/audit
```

กำหนด schema validation, pagination, error states, request limits งาน import/แก้ข้อมูลต้องใช้สิทธิ admin ไม่เก็บ secret ใน browser/log/repo ไม่เปิด URL fetch อิสระจากผู้ใช้โดยไม่มี allowlist ป้องกัน CSV formula injection ใน export และเก็บ timezone Asia/Bangkok

## 13. ผลทดลองที่ต้องส่งออกและทำซ้ำได้

แต่ละ run มี run_id, target, event_definition, dataset_version/hash, source URLs, training dates, validation dates, test dates, cutoff policy, formula/version, parameter search space, trial_count, weights, seed, git commit, dependency versions, metrics และ predictions ทุกงวด

export CSV รายงวดและ JSON manifest พารามิเตอร์ พร้อมคำสั่ง reproduce ห้ามส่งออกเฉพาะกราฟหรือผลรวมจนตรวจเลขจริงไม่ได้ เก็บการแก้ผลหลังประกาศเป็นเวอร์ชันใหม่และติดป้าย revised dataset

## 14. แผนทำงานที่ Codex ต้องปฏิบัติ

ระยะ 1: ตรวจ repo/ข้อกำหนด → data schema → CSV/JSON importer → validation → historical data page

ระยะ 2: frequency/position/pattern → registry ครบ 80 รายการพร้อมสถานะ implemented/planned/disabled → คำนวณจริงในกลุ่มหลัก → heatmap

ระยะ 3: walk-forward → baseline → uncertainty → export/reproduce → leakage tests

ระยะ 4: gap/transition/calendar เมื่อข้อมูลพอ → smoothing → multiple tests → experimental ensemble

ระยะ 5: UI mobile/accessibility → admin/audit → ตรวจ end-to-end → README และรายงานข้อจำกัด

อย่าแสดง planned เป็นใช้งานได้ ไม่ต้องฝืนสร้าง 80 โมเดลทำนาย: บางรายการเป็นตัวชี้วัดและตรวจคุณภาพ หากทำงานยาวให้เก็บ progress ใน repo และดำเนินต่อจนผ่าน acceptance ที่ทำได้ ระบุ blocker จริงโดยไม่แต่งความสำเร็จ

## 15. Acceptance tests ที่มีสาระ

- "03", "007" และ "000123" นำเข้าและส่งออกแล้วคงศูนย์นำหน้า
- จำนวน frequency ผลเดี่ยวรวมเท่ากับจำนวนผลใช้จริง; รายหลักรวม N และทุกหลักรวม digits*N
- top2/top3/first3OfFirst derive ถูกต้องและไม่ถูกสับสนกับรางวัลจริง
- null ไม่กลายเป็น 00; conflict ไม่กลายเป็น verified
- เปลี่ยน/เพิ่มผลหลัง cutoff แล้ว prediction ที่ cutoff เดิมต้องไม่เปลี่ยน
- normalization/smoothing/parameter selection ไม่มีข้อมูลจาก test
- ทุก probability vector ผลเดี่ยวรวม 1, ไม่มี NaN, ไม่มีค่าติดลบ
- Top K มี K เลขไม่ซ้ำ tie-break ทำซ้ำได้เมื่อ seed เดิม
- baseline ผลเดี่ยวและหลายรางวัลตรงกับ analytic calculation ตามสมมติฐาน
- uniform synthetic data ไม่ถูกประดับป้ายว่าค้นพบสูตรแม่นจากการเลือก trial ที่ชนะ
- หมวดผลรวม/เบิ้ลใช้ combinatorial baseline ถูกต้อง ไม่สมมติทุกหมวดเท่ากัน
- CI และ adjusted p ตรวจเทียบ library/reference implementation
- NA/ข้อมูลน้อย/ไม่มีช่องว่างครบ/วันจันทรคติหายแสดงอย่างถูกต้อง
- cache แยก dataset version และ cutoff ไม่แสดงผลเก่าในชื่อข้อมูลใหม่
- backtest log และ live timestamp แยกกัน ไม่มีการอ้าง backtest เป็น prediction ที่ลงก่อนออกจริง
- mobile charts อ่านได้ ไม่ตัดเลข และ source link เปิดได้
- admin route ไม่เปิดให้ผู้ใช้ทั่วไปแก้ข้อมูล

เกณฑ์ส่งมอบ: ระบบรันได้จริง README ครบ ไม่มี mock metrics ในหน้าข้อมูลจริง มีข้อจำกัดและสถานะทุกวิธี แสดงแหล่งข้อมูลและวันล่าสุด รายงาน test ที่รันจริงและรายการที่ยังไม่ผ่าน

## 16. ข้อความที่อนุญาตให้ใช้บนเว็บ

“วิเคราะห์ข้อมูลย้อนหลังเพื่อการศึกษา ผลแต่ละงวดอาจเป็นอิสระจากงวดก่อน คะแนนจัดอันดับไม่ใช่การรับประกันผล”

“ยังไม่มีข้อมูลเพียงพอที่จะสรุปว่าสูตรนี้ดีกว่า baseline”

“ผลทดสอบนี้ใช้ข้อมูลนอกช่วงฝึก ตั้งแต่ … ถึง … เลือก … เลขต่องวด ถูก … จาก … งวด”

ห้าม “AI รับรอง”, “สถิติพิสูจน์เลขนี้ต้องมา”, “เลขไม่ออกนานจึงมีโอกาสมากขึ้น” และห้ามใช้โลโก้หน่วยงานให้เข้าใจว่าหน่วยงานรับรองเว็บไซต์

## 17. แหล่งอ้างอิงและขอบเขต

ตรวจเข้าถึงหน้าอ้างอิงเมื่อ 1 ตุลาคม 2569 ก่อนพัฒนาต้องตรวจรายละเอียดข้อมูล/API/กติกาที่ใช้จริงอีกครั้ง เอกสารออนไลน์ด้านล่างไม่มีการแต่งชื่อผู้เขียนบุคคล ผู้จัดทำระบุเป็นหน่วยงาน/โครงการ

| รหัส | ชื่อเอกสาร/หน้า | ผู้จัดทำ | URL | รองรับ |
|---|---|---|---|---|
| S1 | ข้อมูลผลการออกรางวัลสลากกินแบ่งรัฐบาล | สำนักงานสลากกินแบ่งรัฐบาล | https://gdcatalog.glo.or.th/th/dataset/dataset_c4-9_01 | แหล่งข้อมูลทางการ; ไม่ใช่สูตรทำนาย |
| S2 | สถิติหวยออกย้อนหลัง 10 ปี | MyHora.com | https://myhora.com/lottery/stats.aspx?mx=09&vx=10 | รูปแบบสถิติย้อนหลัง/รายหลัก/ประเภทรางวัล |
| S3 | NIST/SEMATECH e-Handbook of Statistical Methods: Chi-Square Goodness-of-Fit Test | NIST/SEMATECH | https://www.itl.nist.gov/div898/handbook/eda/section3/eda35f.htm | goodness-of-fit และเงื่อนไขจำนวนคาดหมาย |
| S4 | TimeSeriesSplit documentation | scikit-learn developers | https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.TimeSeriesSplit.html | แบ่งข้อมูลตามลำดับเวลา ป้องกันฝึกบนอนาคต |
| S5 | statsmodels.stats.multitest.multipletests | statsmodels developers | https://www.statsmodels.org/stable/generated/statsmodels.stats.multitest.multipletests.html | การปรับ p-value หลายการทดสอบ |
| S6 | NIST/SEMATECH e-Handbook: Confidence intervals for proportion | NIST/SEMATECH | https://www.itl.nist.gov/div898/handbook/prc/section2/prc241.htm | Wilson และความไม่แน่นอนของสัดส่วน |

สูตรความน่าจะเป็นฐานในเอกสารเป็นการคำนวณทางคณิตศาสตร์ตามสมมติฐานที่ระบุ ส่วนรายการ 80 วิธี สถาปัตยกรรม ลำดับงาน และเกณฑ์ผลิตภัณฑ์เป็นข้อเสนอ AI ไม่ใช่ข้อกำหนดหรือการรับรองจากแหล่งอ้างอิง

## 18. คำสั่งเริ่มต้นสำหรับ Codex

อ่านเอกสารนี้ทั้งหมด ตรวจสภาพ repository และ AGENTS.md ที่เกี่ยวข้อง แล้วสร้างระบบตามข้อกำหนด เริ่มจากเส้นทางข้อมูลที่ตรวจสอบได้และ backtest ที่ไม่รั่วไหล ก่อนเพิ่มจำนวนวิธี ใช้ข้อมูลจริงเมื่อเข้าถึงและตรวจสอบได้ มิฉะนั้นใช้โหมด demo ที่ติดป้ายและตัวนำเข้าไฟล์ ห้ามรายงานความแม่นโดยไม่ทดลองจริง

ก่อนจบแสดงคำสั่งเปิดระบบ สิ่งที่ทำเสร็จ ผลทดสอบที่รัน แหล่งข้อมูลจริงที่ใช้ และข้อจำกัดคงเหลือ โดยไม่อ้างว่าความน่าเชื่อถือของซอฟต์แวร์เท่ากับความสามารถทำนายผลสลาก
