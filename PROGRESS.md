# สถานะส่งมอบ

- [x] ตรวจสเปกและ repo (เริ่มต้นมี README เท่านั้น)
- [x] เข้าถึง GLO API ตามเอกสารจริง เก็บ raw/hash/import logs
- [x] ทยอยย้อนหลังและป้องกัน conflict; ไม่สมมติความครบถ้วน
- [x] เว็บภาษาไทย responsive, รายงวด, export, heatmap, patterns, gaps
- [x] ห้องทดลอง 12 models/baselines และทะเบียน 80 วิธีแสดงสถานะจริง
- [x] Walk-forward, holdout, uncertainty, multiple testing, all-draw export
- [x] 10 automated acceptance tests ผ่าน และ production build ผ่าน
- [x] Google Sheets metadata เข้าถึงได้และตรวจแท็บเดิมว่าง
- [x] เขียน Google Sheets 14 ตารางข้อมูล + live_draws + คำอธิบาย; readback ศูนย์นำหน้าและ IMPORTDATA ผ่าน
- [x] GitHub Pages HTTP 200 / Actions success; ทดสอบ desktop และ 390px mobile: ไม่มี page overflow, heatmap 100 cells, ranking และ backtest ใช้งานได้

ข้อจำกัด: MyHora blocked, ไม่ยืนยัน schedule completeness, บางวิธี planned/disabled, ไม่มี prospective prediction / calibrated probability / public write-back admin. ข้อมูลจริง single_source ไม่ใช่ demo; ไม่มี mock metrics.

อัปเดตหน้าแรก: เลขทดลอง 6 หลัก 5 ชุด แยกหมวดรางวัลที่ 1–5/ข้างเคียง ลดเมนูหลักเหลือ 3 รายการ พร้อมคัดลอก/บันทึก ไม่มีการอ้างรับประกัน 100%. เพิ่ม 4 tests ตรวจจำนวนชุด ศูนย์นำหน้า แยกประเภท ข้อมูลหลัง cutoff และ deterministic random รวมผ่าน 14 tests.

อัปเดตสถิติรายชุดและรายการสนใจ: เพิ่ม evidence module และ 3 tests รวม 17 tests ผ่าน ตรวจ browser จริงว่าบันทึกแล้ว reload ยังอยู่ ตัวกรองเดือนพร้อมวันที่แสดง 7 งวด (เทียบ 2026-10-16) และต้องเลือกวันก่อนใช้ตัวกรองปฏิทิน; ทดสอบคัดลอกและจอ 390px ไม่มี overflow. เปอร์เซ็นต์เป็นความถี่ในอดีต ไม่อ้างความมั่นใจในการทำนาย.
