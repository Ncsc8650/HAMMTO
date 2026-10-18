import './style.css';
import {externalBrowserPolicy} from './external-browser.mjs';
const policy=externalBrowserPolicy(navigator.userAgent,location.href);
if(!policy.blocked){await import('./app.mjs');}
else{
 const root=document.querySelector('#app');
 root.innerHTML='<main class="external-browser-gate"><span class="home-kicker">HAMMTO</span><h1>เปิดในเบราว์เซอร์ของเครื่อง</h1><p>เว็บไซต์นี้ไม่เปิดใช้งานภายใน LINE กรุณาเปิดด้วย Safari, Chrome หรือเบราว์เซอร์เริ่มต้นของคุณ</p><p role="status" id="external-status">กำลังขอให้ LINE เปิดเบราว์เซอร์ภายนอก…</p><a id="open-external" class="external-open">เปิดในเบราว์เซอร์ของเครื่อง</a><button id="copy-external">คัดลอกลิงก์</button><p>ถ้ายังอยู่หน้านี้ ให้แตะเมนู ⋯ หรือปุ่มแชร์ของ LINE แล้วเลือก “เปิดในเบราว์เซอร์” หรือคัดลอกลิงก์ไปวางใน Safari / Chrome</p><label>ลิงก์สำหรับเปิดภายนอก<input id="external-url" readonly></label><p class="muted">การสลับแอปขึ้นอยู่กับ LINE และระบบของมือถือ บางเครื่องต้องกดยืนยันเอง</p></main>';
 root.querySelector('#open-external').href=policy.externalUrl;root.querySelector('#external-url').value=policy.externalUrl;
 root.querySelector('#copy-external').onclick=async()=>{try{await navigator.clipboard.writeText(policy.externalUrl);root.querySelector('#external-status').textContent='คัดลอกแล้ว เปิดเบราว์เซอร์ของเครื่องแล้ววางลิงก์ได้เลย';}catch{root.querySelector('#external-url').select();root.querySelector('#external-status').textContent='กดค้างที่ลิงก์ด้านล่างแล้วเลือกคัดลอก';}};
 if(policy.redirect)location.replace(policy.externalUrl);
 else root.querySelector('#external-status').textContent='หากระบบไม่ได้เปิดภายนอกอัตโนมัติ กรุณากดปุ่มหรือใช้เมนู LINE ด้านบน';
}
