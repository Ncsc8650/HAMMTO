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
