const performances={"2024":[{venue:"The Highlight Room",location:"New York City, United States",country:"United States"},{venue:"Panorámic",location:"Barcelona, Spain",country:"Spain"},{venue:"MotoGP VIP Suites (Private Event)",location:"Barcelona, Spain",country:"Spain"},{venue:"De Tulp",location:"Amsterdam, Netherlands",country:"Netherlands"}],"2025":[{venue:"Soho Selectors – Soho House Barcelona",location:"Barcelona, Spain",country:"Spain"},{venue:"Candelaria",location:"Santiago, Chile",country:"Chile"},{venue:"Capote Bar",location:"Bogotá, Colombia",country:"Colombia"}],"2026":[{venue:"The Shy Guy",location:"Auckland, New Zealand",country:"New Zealand"},{venue:"Il Brutto",location:"Auckland, New Zealand",country:"New Zealand"},{venue:"Boat Parties",location:"Auckland, New Zealand",country:"New Zealand"},{venue:"Tanna's Inn",location:"Tokyo, Japan",country:"Japan"},{venue:"Barcelona Coffee Rave",location:"Barcelona, Spain",country:"Spain"},{venue:"Atlantic Club",location:"Barcelona, Spain",country:"Spain"},{venue:"Bus Hexperience",location:"Barcelona, Spain",country:"Spain"},{venue:"Boris Club",location:"Barcelona, Spain",country:"Spain"},{venue:"SLS Cósmico",location:"Barcelona, Spain",country:"Spain"},{venue:"Cantina 15",location:"San Salvador, El Salvador",country:"El Salvador"},{venue:"Chica Club",location:"Barcelona, Spain",country:"Spain"},{venue:"Negro Rojo",location:"Barcelona, Spain",country:"Spain"},{venue:"W Hotel",location:"Barcelona, Spain",country:"Spain"},{venue:"Coya",location:"Barcelona, Spain",country:"Spain"},{venue:"Sea Sea Club",location:"Barcelona, Spain",country:"Spain"}]};
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
  document.documentElement.classList.add('drawer-open');
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
  closeTimer=setTimeout(()=>{drawer.close();document.documentElement.classList.remove('drawer-open')},reduced?0:550);
}
menu.querySelectorAll('a:not([data-scroll])').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();openPanel(a.hash)}));
/* "Shows" scrolls down to the upcoming shows instead of opening a panel. */
menu.querySelector('[data-scroll]').addEventListener('click',e=>{e.preventDefault();setMenu(false);document.querySelector('#shows').scrollIntoView({behavior:reduced?'auto':'smooth'})});
drawer.querySelector('.drawer-close').addEventListener('click',closePanel);
drawer.addEventListener('cancel',e=>{e.preventDefault();closePanel()});
drawer.addEventListener('click',e=>{if(e.target===drawer)closePanel()});
document.querySelector('.stage-mark').addEventListener('click',e=>{e.preventDefault();closePanel();setMenu(false)});
addEventListener('hashchange',()=>openPanel(location.hash));
if(location.hash)openPanel(location.hash);

/* ---------- UPCOMING SHOWS ----------
   Add a show here: date (YYYY-MM-DD), title, city, image (4:5 flyer; without
   one, a branded poster is drawn from the title) and,
   optionally, end (last day of a multi-day show) and tickets (URL). A show
   disappears automatically the day after its last date; with no upcoming shows the whole section is hidden. */
const shows=[
  {date:'2026-10-30',title:'The Players Club · Halloween Edition',city:'Barcelona, Spain',image:'assets/shows/players-club-halloween-2026.jpg',tickets:'https://oneforoneapp.com/events/yYqXqy'},
  {date:'2026-11-07',title:'Sabrosura Tardeo · Sea Sea Club',city:'Barcelona, Spain',image:'assets/shows/sabrosura-sea-sea-club-2026.jpg'},
  {date:'2026-11-14',end:'2026-11-15',title:'Soul Market BCN · Port Olímpic',city:'Barcelona, Spain',image:'assets/shows/soul-market-port-olimpic-2026.jpg'},
  {date:'2026-11-21',title:'The BCN Coffee Rave Festival Edition · Sea Sea Club',city:'Barcelona, Spain',image:'assets/shows/bcn-coffee-rave-festival-2026.jpg',tickets:'https://luma.com/k4k8goh5'},
  {date:'2026-11-21',title:'The Players Club · Coya (W Hotel)',city:'Barcelona, Spain',image:'assets/shows/players-club-coya-2026.jpg'},
  {date:'2026-11-27',title:'The Players Club · Barcelona Pool House',city:'Barcelona, Spain'}
];
const showsSection=document.querySelector('#shows'),showsTrack=document.querySelector('#showsTrack'),stageCue=document.querySelector('.stage-cue');
function renderShows(){
  const today=new Date();today.setHours(0,0,0,0);
  const upcoming=shows.filter(s=>new Date((s.end||s.date)+'T00:00:00')>=today).sort((a,b)=>a.date.localeCompare(b.date));
  showsSection.hidden=stageCue.hidden=document.querySelector('.menu-shows').hidden=!upcoming.length;
  if(!upcoming.length)return;
  const day=d=>new Date(d+'T00:00:00'),part=(d,o)=>new Intl.DateTimeFormat('en-GB',o).format(day(d));
  /* "FRI · 30 OCT 2026", or "SAT 14 – SUN 15 NOV 2026" for a multi-day show in one month. */
  const when=s=>!s.end?`${part(s.date,{weekday:'short'})} · ${part(s.date,{day:'2-digit',month:'short',year:'numeric'})}`
    :`${part(s.date,{weekday:'short',day:'2-digit'})} – ${part(s.end,{weekday:'short',day:'2-digit',month:'short',year:'numeric'})}`.replace(/,/g,'');
  /* On phones the city is only added when the show is outside Barcelona (home base). */
  const name=s=>s.title.split(' · ')[0],city=s=>s.city.split(',')[0].trim(),
    venue=s=>[s.title.split(' · ').slice(1).join(' · '),city(s)!=='Barcelona'&&city(s)].filter(Boolean).join(' · ');
  /* Compact date for the narrow phone cards: "30 OCT", "14–15 NOV". */
  const whenShort=s=>!s.end?part(s.date,{day:'2-digit',month:'short'})
    :`${part(s.date,{day:'2-digit'})}–${part(s.end,{day:'2-digit',month:'short'})}`;
  /* Branded stand-in until the real flyer arrives: "Artist · Venue" becomes
     the headline "Artist" with the venue underneath. */
  const poster=s=>{const [name,...venue]=s.title.split(' · ');
    return `<div class="show-poster" aria-hidden="true"><span class="show-poster-date">${part(s.date,{day:'2-digit',month:'short'})}</span>`+
      `<strong>${name}</strong><span class="show-poster-venue">${venue.join(' · ')}<br>${s.city.split(',')[0]}</span></div>`;};
  const tile=(s,clone)=>{
    const tag=s.tickets?'a':'article',link=s.tickets?` href="${s.tickets}" target="_blank" rel="noopener"`:'';
    return `<${tag} class="show"${link}${clone?' aria-hidden="true" tabindex="-1"':''}><figure>${s.image?`<img src="${s.image}" alt="${clone?'':`${s.title} — ${s.city}`}" loading="lazy">`:poster(s)}</figure>`+
      `<p class="show-date"><span><span class="date-full">${when(s)}</span><span class="date-short">${whenShort(s)}</span></span>${s.tickets?'<span class="show-tix">Tickets ↗</span>':''}</p><h3>${s.title.replace(/ · ([^·]+)$/,' · <span class="nowrap">$1</span>')}</h3><p class="show-city">${s.city}</p>`+
      /* Phones show the name and the venue on separate lines instead of the h3. */
      `<p class="show-name" aria-hidden="true">${name(s)}</p><p class="show-venue" aria-hidden="true">${venue(s)}</p></${tag}>`;
  };
  const once=upcoming.map(s=>tile(s,false)).join('');
  showsTrack.className='shows-track';showsTrack.innerHTML=once;carousel.set(0);
  /* Only loop when the shows are wider than the screen; a short list stays still. */
  if(showsTrack.scrollWidth<=innerWidth)return;
  const gap=parseFloat(getComputedStyle(showsTrack).columnGap)||0;
  const setWidth=upcoming.length*(showsTrack.firstElementChild.getBoundingClientRect().width+gap);
  /* Three copies: the view starts on the middle one and jumps by one copy when it
     drifts too far either way, so both auto-play and manual scrolling loop seamlessly. */
  const clones=upcoming.map(s=>tile(s,true)).join('');
  showsTrack.innerHTML=clones+once+clones;
  showsTrack.classList.add('is-loop');
  carousel.set(setWidth);
}

/* Upcoming-shows carousel: drifts left on its own, but can be swiped, scrolled with a
   trackpad or dragged with the mouse. Any interaction pauses it; it resumes a few
   seconds after the last one, from wherever the visitor left it. */
const carousel=(()=>{
  const view=document.querySelector('.shows-viewport'),SPEED=45,IDLE=2500;
  let loop=0,pos=0,last=0,resumeAt=0,hover=false,drag=null,moved=false,mine=0;
  /* Browsers round scrollLeft, so remember where we put it ourselves ("mine") and
     only treat bigger differences as the visitor scrolling. */
  const put=x=>{view.scrollLeft=x;mine=view.scrollLeft};
  const wrap=()=>{if(!loop)return;const x=view.scrollLeft;if(x<loop*.5){put(x+loop);pos+=loop}else if(x>loop*1.5){put(x-loop);pos-=loop}};
  const hold=()=>{resumeAt=performance.now()+IDLE};
  function frame(t){
    const dt=Math.min(64,t-(last||t));last=t;
    if(loop&&!reduced&&!hover&&!drag&&t>resumeAt&&!showsSection.hidden){pos+=SPEED*dt/1000;put(pos);wrap()}
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  view.addEventListener('scroll',()=>{if(Math.abs(view.scrollLeft-mine)>2){pos=mine=view.scrollLeft;hold()}wrap()},{passive:true});
  ['wheel','touchstart','keydown'].forEach(ev=>view.addEventListener(ev,hold,{passive:true}));
  view.addEventListener('mouseenter',()=>hover=true);
  view.addEventListener('mouseleave',()=>{hover=false;hold()});
  /* Mouse drag (touch and trackpads scroll natively). */
  view.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.button)return;drag={x:e.clientX,left:view.scrollLeft};moved=false});
  addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x;if(Math.abs(dx)>4){moved=true;view.classList.add('is-dragging')}view.scrollLeft=drag.left-dx});
  addEventListener('pointerup',()=>{if(!drag)return;drag=null;view.classList.remove('is-dragging');hold()});
  view.addEventListener('click',e=>{if(moved){e.preventDefault();e.stopPropagation();moved=false}},true);
  view.addEventListener('dragstart',e=>e.preventDefault());
  return {set(width){loop=width;pos=width;put(width)}};
})();

renderShows();
let showsResize;addEventListener('resize',()=>{clearTimeout(showsResize);showsResize=setTimeout(renderShows,200)});
