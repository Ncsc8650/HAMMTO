# HAMMTO — ห้องทดลองสถิติสลาก

เว็บภาษาไทยบน **GitHub Pages เท่านั้น**: https://ncsc8650.github.io/HAMMTO/

ฐานข้อมูล Google Sheets: https://docs.google.com/spreadsheets/d/1F_g_xgzqC0t-KEEFoCj1oqD7B4cr1EczSn-8irs-yUw/edit

## ใช้งาน

เลือกประเภทรางวัลและ cutoff (ไม่รวมวันที่นั้น) ดูข้อมูลจริง / สำรวจความถี่และช่องว่าง / ทดลองจัดอันดับ / ทดสอบย้อนหลังและดาวน์โหลด manifest พร้อมทุกงวด รวมงวดแพ้ ไม่มีระบบซื้อหรือรับเดิมพัน

## พัฒนาและตรวจสอบ

Node.js 22+ และ pnpm 10+

```sh
pnpm install
pnpm dev
pnpm test
pnpm build
node scripts/ingest.mjs
node scripts/reproduce.mjs last2
node scripts/export-database.mjs
```

เว็บไซต์ production ใช้ base `/HAMMTO/`. ไม่มี backend ที่ต้องเช่าโฮสต์ และไม่มี secret ในเบราว์เซอร์

## ข้อมูลจริงและการอัปเดต

ใช้ API ที่เผยแพร่ใน GLO Data Catalog:
- POST https://www.glo.or.th/api/lottery/getLatestLottery
- POST https://www.glo.or.th/api/checking/getLotteryResult พร้อม `{date,month,year}` ค.ศ.
- เอกสาร/สิทธิ: https://gdcatalog.glo.or.th/th/dataset/dataset_c4-9_01 — ระบุ Creative Commons Non-Commercial (Any); เว็บนี้จัดทำเพื่อการศึกษา ไม่อ้างหน่วยงานรับรอง

GitHub Actions รันทุกวัน 11:23 UTC / 18:23 กรุงเทพฯ (เวลาเริ่มอาจล่าช้าตามคิว GitHub) ดึงงวดล่าสุดและทยอยย้อนหลังครั้งละ 12 วันที่ตรวจสอบ เว้น 2.5 วินาที หยุดหลังข้อผิดพลาดติดกัน 3 ครั้ง กด Run workflow เพื่อรันเองได้ เก็บ snapshot เดิมเมื่อแหล่งข้อมูลล่ม

Backfill ตรวจวันที่ผู้สมัคร 1/2/16/17 และ 30 ธันวาคม ตั้งแต่ปี 2016 ไม่ใช่ปฏิทินกำหนดออกรางวัลทางการ จึง **ยังไม่รับรองความครบถ้วน** และอาจขาดวันเลื่อนพิเศษ ต้องนำเข้าข้อมูล/ตารางวันจริงเพิ่มเติมโดยเจ้าของรีโป ไม่มีการเติมเลขปลอมในงวดขาด

MyHora เป็นแหล่งอ้างอิงรูปแบบสถิติ หน้า stats ไม่ถูกใช้แทนข้อมูลรายงวด การดึงตรงถูก access challenge จึงไม่ข้ามระบบและยังไม่ cross-verify ผลมีสถานะ `single_source` แม้มาจาก GLO ทางการ ไม่ใช้ `verified` จนตรวจเทียบจริง

Raw response แบบไม่แก้ไขอยู่ `public/data/raw/<SHA256>.json`; draws, imports, conflicts, manifest และ database.json เก็บใน Git และเผยแพร่พร้อมเว็บ การแก้ผลเดิมสร้าง conflict และแยกออกจากการวิเคราะห์ ไม่แก้ทับเงียบ

Google Sheets เก็บ snapshot เริ่มต้น 14 ตาราง รวม frequency 4,200 แถว / รายหลัก 160 แถว / รูปแบบ 1,203 แถว เป็นตารางข้อความ (รักษา 03/007/000123) และแท็บ `live_draws` ดึง CSV ที่เผยแพร่บน GitHub ผ่าน IMPORTDATA พร้อม padding ตัวเลขตาม schema. Google อาจต้องอนุญาตการดึงข้อมูลภายนอกครั้งแรกและ refresh ไม่ทันที ฐานข้อมูลอ้างอิงที่ทำซ้ำได้คือ JSON พร้อม hash ใน Git; การแก้ Sheets ไม่เขียนกลับเว็บอัตโนมัติ

## สถิติและการทดลอง

- ประเภทผลเดี่ยว: last2, top2, top3, first3OfFirst; แยกชัดจาก front3/last3 หลายรางวัล
- รายหลัก / รูปแบบ / heatmap / completed gaps พร้อม censoring / entropy / Chi-square statistic (ไม่อ้าง asymptotic p เมื่อข้อมูลบาง)
- 12 แบบจำลองและ baseline: uniform, smoothed frequency, recent20, exponential decay, independent digits, digit Markov, sum-category adjusted for group size, equal-weight ensemble, fixed set และ random 3 seeds
- ทะเบียนครบ 80 รายการตามสเปก พร้อม implemented/planned/disabled และข้อจำกัด ไม่อ้างว่า 80 รายการเป็นสูตรทำนายที่เปิดใช้แล้ว
- Walk-forward ใช้ drawDate < cutoff เท่านั้น ฝึกอย่างน้อย 30 งวดและ 60% แรก validation ถึง 80%, holdout ส่วนท้าย ไม่มีการจูนพารามิเตอร์
- Hit@1/5/10/20, Wilson 95%, baseline, percentage-point difference, lift, Brier, log loss และ one-sided binomial + Holm family 48 tests
- JSON manifest และ CSV ทุกงวด; `reproduce.mjs` บันทึก dataset hash, git commit, Node version, seed, parameters, run id และ archive ต่อ run

ค่าจากโมเดลไม่ใช่โอกาสจริงที่ได้รับรอง calibration. Holdout ย้อนหลังเป็น exploratory และเปลี่ยนตาม snapshot ไม่ใช่ชุดอนาคตที่ freeze ก่อนออกผล การรันซ้ำ/เปลี่ยนช่วงถือเป็นการทดลองเพิ่ม ไม่ยืนยันความแม่น และไม่ปรับ p ครอบคลุมทุกการลองของผู้ใช้

## ข้อจำกัดที่เปิดเผย

ยังไม่มี live prediction ที่ประทับเวลาจากเซิร์ฟเวอร์ก่อนออกรางวัล, calibrated probability, optimized weights, null selection simulation, ablation, official completeness calendar หรือจันทรคติที่ตรวจสอบแล้ว หลายรางวัลให้ดูสถิติพรรณนา แต่ปิด ranking/backtest จนยืนยันกติกาและใช้ draw-cluster uncertainty

หน้า import ตรวจ JSON/CSV และส่งออกรายงาน accepted/quarantine ในเบราว์เซอร์เท่านั้น ผู้เข้าชมไม่มีสิทธิแก้ฐานข้อมูลสาธารณะ ผู้ดูแลเผยแพร่การเปลี่ยนแปลงผ่าน GitHub ที่มีสิทธิในรีโป ไม่มีระบบ resolve conflict อัตโนมัติ

## การตรวจสอบ

`node --test tests/*.test.mjs` ครอบคลุมศูนย์นำหน้า, derived target, null/conflict, duplicate date, frequency denominators, repeated prizes, normalization, deterministic Top K, future leakage, Wilson/Holm references, analytic multi-prize baseline, group size, empty data, CSV injection และครบทุกงวดแพ้

อ่านสเปกต้นฉบับใน `CODEX_LOTTERY_ANALYTICS_SPEC.md` และสถานะใน `PROGRESS.md`
