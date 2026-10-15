const performances={"2024":[{venue:"The Highlight Room",location:"New York City, United States",country:"United States"},{venue:"Panorámic",location:"Barcelona, Spain",country:"Spain"},{venue:"MotoGP VIP Suites (Private Event)",location:"Barcelona, Spain",country:"Spain"},{venue:"De Tulp",location:"Amsterdam, Netherlands",country:"Netherlands"}],"2025":[{venue:"Soho Selectors – Soho House Barcelona",location:"Barcelona, Spain",country:"Spain"},{venue:"Candelaria",location:"Santiago, Chile",country:"Chile"},{venue:"Capote Bar",location:"Bogotá, Colombia",country:"Colombia"}],"2026":[{venue:"The Shy Guy",location:"Auckland, New Zealand",country:"New Zealand"},{venue:"Il Brutto",location:"Auckland, New Zealand",country:"New Zealand"},{venue:"Boat Parties",location:"Auckland, New Zealand",country:"New Zealand"},{venue:"Tanna's Inn",location:"Tokyo, Japan",country:"Japan"},{venue:"Barcelona Coffee Rave",location:"Barcelona, Spain",country:"Spain"},{venue:"Atlantic Club",location:"Barcelona, Spain",country:"Spain"},{venue:"Bus Hexperience",location:"Barcelona, Spain",country:"Spain"},{venue:"Boris Club",location:"Barcelona, Spain",country:"Spain"},{venue:"SLS Cósmico",location:"Barcelona, Spain",country:"Spain"},{venue:"Cantina 15",location:"San Salvador, El Salvador",country:"El Salvador"},{venue:"Chica Club",location:"Barcelona, Spain",country:"Spain"},{venue:"Negro Rojo",location:"Barcelona, Spain",country:"Spain"}]};
const countries=["Spain","United States","Netherlands","Chile","Colombia","New Zealand","Japan","El Salvador"],countryYear={Spain:"2026","United States":"2024",Netherlands:"2024",Chile:"2025",Colombia:"2025","New Zealand":"2026",Japan:"2026","El Salvador":"2026"};let year="2026",filter=null;const eventsEl=document.querySelector('#events');
function renderEvents(){eventsEl.innerHTML=performances[year].map((e,i)=>`<article class="event ${filter===e.country?'highlight':''}" data-country="${e.country}"><span class="event-index">${String(i+1).padStart(2,'0')}</span><div><h3>${e.venue}</h3><p>${e.location}</p></div></article>`).join('')};renderEvents();
document.querySelectorAll('.year-tabs button').forEach(b=>b.addEventListener('click',()=>{year=b.dataset.year;filter=null;document.querySelectorAll('.year-tabs button').forEach(x=>x.classList.toggle('active',x===b));document.querySelectorAll('[data-country-map]').forEach(x=>x.classList.remove('active'));renderEvents()}));
function selectCountry(country, control){
  filter=country;year=countryYear[country];
  document.querySelectorAll('[data-country-map]').forEach(x=>x.classList.toggle('active',x.dataset.countryMap===country));
  document.querySelectorAll('.year-tabs button').forEach(x=>x.classList.toggle('active',x.dataset.year===year));
  renderEvents();document.querySelector('#performances').scrollIntoView({behavior:'smooth'});
  setTimeout(()=>document.querySelector('.event.highlight')?.scrollIntoView({behavior:'smooth',block:'center'}),650)
}
document.querySelectorAll('[data-country-map]').forEach(el=>{
  el.addEventListener('click',()=>selectCountry(el.dataset.countryMap,el));
  el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();selectCountry(el.dataset.countryMap,el)}})
});
const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:.13});document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
const statObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(!e.isIntersecting)return;const el=e.target,target=+el.dataset.count,suffix=el.dataset.suffix||'';let start=0;const timer=setInterval(()=>{start++;el.textContent=start+suffix;if(start>=target)clearInterval(timer)},80);statObserver.unobserve(el)}),{threshold:.7});document.querySelectorAll('[data-count]').forEach(el=>statObserver.observe(el));
const lightbox=document.querySelector('#lightbox'),lightboxImg=lightbox.querySelector('img');document.querySelectorAll('.gallery-item').forEach(btn=>btn.addEventListener('click',()=>{lightboxImg.src=btn.dataset.full;lightboxImg.alt=btn.querySelector('img').alt;lightbox.showModal()}));lightbox.querySelector('button').addEventListener('click',()=>lightbox.close());lightbox.addEventListener('click',e=>{if(e.target===lightbox)lightbox.close()});addEventListener('keydown',e=>{if(e.key==='Escape'&&lightbox.open)lightbox.close()});

/* ---------- BOOKING MODAL ---------- */
const bookingDialog=document.querySelector('#booking'),bookingForm=document.querySelector('#bookingForm'),bookingStatus=document.querySelector('#bookingStatus');
/* Free email forwarding — FormSubmit.co (no account needed).
   First submission sends a one-time activation email to the address below; confirm it once and
   every later submission is forwarded straight to the inbox. Optionally replace the address with
   the hashed alias FormSubmit gives you after activation, so the mailbox is not exposed in the HTML. */
const FORM_ENDPOINT='https://formsubmit.co/ajax/team@notjust.music';

function openBooking(){bookingDialog.showModal();setTimeout(()=>bookingDialog.querySelector('#bk-name').focus(),80)}
document.querySelectorAll('[data-open-booking]').forEach(b=>b.addEventListener('click',openBooking));
bookingDialog.querySelector('.booking-close').addEventListener('click',()=>bookingDialog.close());
bookingDialog.addEventListener('click',e=>{if(e.target===bookingDialog)bookingDialog.close()});

bookingForm.addEventListener('submit',async e=>{
  e.preventDefault();
  if(!bookingForm.reportValidity())return;
  if(bookingForm._honey.value)return; /* bot trap */
  const submit=bookingForm.querySelector('button[type="submit"]');
  submit.disabled=true;bookingStatus.className='form-status sending';bookingStatus.textContent='Sending…';
  const data=Object.fromEntries(new FormData(bookingForm).entries());
  delete data._honey;
  /* GDPR: keep a record of what was consented to and when. */
  data.consent=bookingForm.consent.checked?'Yes':'No';
  data.consent_text=bookingForm.querySelector('.consent span').textContent.trim();
  data.consent_timestamp=new Date().toISOString();
  data._subject=`NOTJUST booking request — ${data.name}`;
  data._template='table';
  data._captcha='false';
  try{
    const res=await fetch(FORM_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(data)});
    if(!res.ok)throw new Error('HTTP '+res.status);
    /* FormSubmit can answer 200 with success:false — e.g. while the address is still unconfirmed. */
    const json=await res.json().catch(()=>({}));
    if(String(json.success)!=='true')throw new Error(json.message||'rejected');
    bookingForm.reset();
    bookingStatus.className='form-status ok';
    bookingStatus.textContent='Request sent. We will get back to you within 48 hours.';
  }catch(err){
    bookingStatus.className='form-status error';
    bookingStatus.innerHTML='Could not send right now. Please email <a href="mailto:team@notjust.music">team@notjust.music</a>.';
  }finally{submit.disabled=false}
});

/* ---------- STAGE VIDEO ---------- */
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const video=document.querySelector('#stageVideo'),soundToggle=document.querySelector('#soundToggle');
/* Load the source from script so a hidden page (maintenance mode) never downloads it,
   and phones get the lighter encode. */
if(video.getClientRects().length){
  video.muted=true;video.defaultMuted=true;video.playsInline=true;
  video.src=matchMedia('(max-width: 700px)').matches?video.dataset.srcMobile:video.dataset.srcDesktop;
  const tryPlay=()=>{if(video.paused)video.play().catch(()=>{})};
  tryPlay();
  video.addEventListener('canplay',tryPlay,{once:true});
  /* Some browsers block autoplay (iOS Low Power Mode, strict settings): start on the first interaction. */
  ['pointerdown','touchstart','keydown'].forEach(ev=>addEventListener(ev,tryPlay,{once:true,passive:true}));
}
soundToggle.addEventListener('click',()=>{
  const on=video.muted;
  video.muted=!on;
  if(on&&video.paused)video.play().catch(()=>{});
  soundToggle.setAttribute('aria-pressed',on);
  soundToggle.querySelector('.sound-label').textContent=on?'Sound on':'Sound off';
});

/* ---------- MOBILE MENU ---------- */
const menu=document.querySelector('#stageMenu'),menuToggle=document.querySelector('#menuToggle');
function setMenu(open){menu.classList.toggle('open',open);menuToggle.setAttribute('aria-expanded',open);menuToggle.textContent=open?'Close':'Menu'}
menuToggle.addEventListener('click',()=>setMenu(!menu.classList.contains('open')));
menu.querySelectorAll('[data-open-booking]').forEach(b=>b.addEventListener('click',()=>setMenu(false)));

/* ---------- DRAWER PANELS ---------- */
const drawer=document.querySelector('#drawer'),drawerScroll=drawer.querySelector('.drawer-scroll'),drawerLabel=drawer.querySelector('#drawerLabel'),panels=[...drawer.querySelectorAll('.panel')];
let closeTimer;
function panelFor(hash){const target=hash&&hash.length>1&&document.getElementById(decodeURIComponent(hash.slice(1)));return target?target.closest('.panel'):null}
function openPanel(hash){
  const panel=panelFor(hash);if(!panel)return;
  clearTimeout(closeTimer);setMenu(false);
  panels.forEach(p=>p.hidden=p!==panel);
  drawerLabel.textContent=panel.dataset.label;
  menu.querySelectorAll('a').forEach(a=>a.setAttribute('aria-current',panelFor(a.hash)===panel));
  if(!drawer.open)drawer.showModal();
  drawerScroll.scrollTop=0;
  const target=document.getElementById(decodeURIComponent(hash.slice(1)));
  if(target!==panel.firstElementChild)target.scrollIntoView();
  requestAnimationFrame(()=>requestAnimationFrame(()=>drawer.classList.add('is-open')));
  history.replaceState(null,'',hash);
}
function closePanel(){
  if(!drawer.open)return;
  drawer.classList.remove('is-open');
  menu.querySelectorAll('a').forEach(a=>a.removeAttribute('aria-current'));
  history.replaceState(null,'',location.pathname+location.search);
  closeTimer=setTimeout(()=>drawer.close(),reduced?0:550);
}
menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();openPanel(a.hash)}));
drawer.querySelector('.drawer-close').addEventListener('click',closePanel);
drawer.addEventListener('cancel',e=>{e.preventDefault();closePanel()});
drawer.addEventListener('click',e=>{if(e.target===drawer)closePanel()});
document.querySelector('.stage-mark').addEventListener('click',e=>{e.preventDefault();closePanel();setMenu(false)});
addEventListener('hashchange',()=>openPanel(location.hash));
if(location.hash)openPanel(location.hash);
