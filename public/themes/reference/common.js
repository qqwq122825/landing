(() => {
 'use strict';
 const data=window.HUB_REFERENCE,config=window.HUB_PAGE;if(!data||!config)return;
 const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
 const dialog=$('#hub-ref-dialog');
 const key='hub:'+data.id+':language:'+config.slug;
 const languages=[...new Set([data.defaultLanguage,...Object.keys(data.nativeTranslations||{}),'zh',...(data.id==='fizzio'?['hi']:[])])];
 const label={en:'English',zh:'简体中文（部分）',es:'Español',fr:'Français',hi:'हिन्दी（部分）'};
 let stored='';try{stored=localStorage.getItem(key)||'';}catch{}
 const requested=new URL(location.href).searchParams.get('lang');
 let language=languages.includes(requested)?requested:languages.includes(stored)?stored:languages.includes(navigator.language?.split('-')[0])?navigator.language.split('-')[0]:data.defaultLanguage;
 const picker=document.createElement('select');picker.className='hub-ref-language';picker.setAttribute('aria-label','Language');
 languages.forEach(code=>{const o=document.createElement('option');o.value=code;o.textContent=label[code]||code;picker.append(o);});document.body.append(picker);
 function applyLanguage(code,persist=false){
  language=languages.includes(code)?code:data.defaultLanguage;
  document.documentElement.lang=language;document.documentElement.dir='ltr';picker.value=language;
  $$('[data-ref-text]').forEach(el=>{
   const t=data.translations[el.dataset.refText];if(!t)return;
   const text=language==='zh'?t.zh:t.original;
   if(el.hasAttribute('data-ref-brand-text')&&text.includes(data.brand)){
    const parts=text.split(data.brand);el.replaceChildren();parts.forEach((part,i)=>{if(i){const name=document.createElement('span');name.dataset.hubName='';name.textContent=config.appName;el.append(name);}el.append(document.createTextNode(part));});
   }else el.textContent=text;
  });
  const copy={en:['Open the app download link to continue.','Download'],zh:['点击下载按钮打开当前项目配置的下载地址。','下载应用'],es:['Abre el enlace de descarga de la aplicación para continuar.','Descargar'],fr:['Ouvrez le lien de téléchargement pour continuer.','Télécharger'],hi:['जारी रखने के लिए ऐप डाउनलोड लिंक खोलें।','डाउनलोड']}[language]||['Open the app download link to continue.','Download'];
  $('[data-ref-dialog-description]').textContent=copy[0];
  $('[data-ref-modal-download]').textContent=copy[1];
  if(data.id==='fizzio'){
   const toggle=$('#langToggle');if(toggle)toggle.textContent=language==='hi'?'EN':'हिं';
  }
  if(data.nativeTranslations){
   const t=data.nativeTranslations[language]||data.nativeTranslations.en;
   for(const [id,k] of Object.entries({badge:'badge',headline:'headline',subline:'subline',ctaBtn:'cta',ghostBtn:'ghost',sideIntro:'sideIntro',stat1Label:'stat1Label',stat2Label:'stat2Label',stat3Label:'stat3Label',sideCtaBtn:'sideCta'})){
    const el=$('#'+id);if(el&&t[k])el.textContent=t[k].replaceAll('NEW-F',config.appName);
   }
   const list=$('#featureList');if(list){list.replaceChildren(...t.features.map(text=>{const el=document.createElement('div');el.className='feature';el.textContent=text;return el;}));}
   const menu=$('#langSwitch');if(menu){menu.replaceChildren(...Object.keys(data.nativeTranslations).map(code=>{const b=document.createElement('button');b.type='button';b.className='lang-btn'+(language===code?' active':'');b.textContent=label[code]||code;b.addEventListener('click',()=>applyLanguage(code,true));return b;}));}
   $$('.profile-desc').forEach(el=>el.textContent=language==='es'?'Conoce personas que comparten tus intereses.':language==='fr'?'Rencontrez des personnes qui partagent vos intérêts.':'Meet people who share your interests.');
  }
  if(persist){try{localStorage.setItem(key,language);}catch{} const url=new URL(location.href);url.searchParams.set('lang',language);history.replaceState(null,'',url);}
  // The common brand observer remains the only owner of project branding.
 }
 picker.addEventListener('change',()=>applyLanguage(picker.value,true));applyLanguage(language);
 $$('.download-link').forEach(a=>a.href=config.downloadUrl);
 function showInfo(text){if(text)$('[data-ref-dialog-description]').textContent=text;if(!dialog.open)dialog.showModal();}
 dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
 document.addEventListener('click',e=>{
  const el=e.target.closest('[data-ref-action]');if(!el)return;
  const action=el.dataset.refAction;
  if(action==='close'){e.preventDefault();dialog.close();return;}
  if(action==='language'){e.preventDefault();applyLanguage(language==='hi'?'en':'hi',true);return;}
  if(action==='faq'){e.preventDefault();const item=el.closest('.faq-item')||el.parentElement;item.classList.toggle('active');item.classList.toggle('open');el.setAttribute('aria-expanded',String(item.classList.contains('open')));return;}
  if(action==='menu'){e.preventDefault();el.classList.toggle('active');$$('.nav-links,#mobileMenu,#main-nav,.mobile-menu').forEach(n=>{n.classList.toggle('active');n.classList.toggle('is-open');});return;}
  if(action==='theme'){e.preventDefault();document.body.classList.toggle('dark');return;}
  if(action.startsWith('scroll-')){e.preventDefault();const row=el.closest('section,.section,.row-section,.content-section')?.querySelector('.row,.movie-row,.carousel__track,.cards,.poster-row');row?.scrollBy({left:(action==='scroll-prev'?-1:1)*Math.max(280,row.clientWidth*.75),behavior:'smooth'});return;}
  if(action==='info'){e.preventDefault();showInfo();}
 });
 $$('.faq-question').forEach(el=>el.dataset.refAction='faq');
 $$('#mobileMenuBtn,#nav-toggle,.menu-toggle').forEach(el=>el.dataset.refAction='menu');
 // Cards that merely open a detail view are not reported as downloads.
 $$('.movie-card:not(a),.poster-card:not(a),.profile-card,.girl-card,.chat-item,.btn-like,.btn-star,.btn-pass').forEach(el=>{
  el.setAttribute('tabindex','0');el.setAttribute('role','button');
  const open=e=>{if(e?.target.closest('.download-link'))return;showInfo();};el.addEventListener('click',open);el.addEventListener('keydown',e=>{if(e.target.closest('.download-link'))return;if(e.key==='Enter'||e.key===' '){e.preventDefault();open(e);}});
 });
 // Catalog search is entirely local; no source search/account API is contacted.
 const search=$('#search-input');if(search){
  $('#search-form')?.addEventListener('submit',e=>{e.preventDefault();const q=search.value.trim().toLocaleLowerCase();$$('.poster-card').forEach(c=>c.hidden=q&&!c.textContent.toLocaleLowerCase().includes(q));});
  $('#mobile-search-toggle')?.addEventListener('click',()=>{$('#search')?.classList.add('is-open');search.focus();});
  $('#search-close')?.addEventListener('click',()=>$('#search')?.classList.remove('is-open'));
 }
 // Keep the captured first slide stable and expose actual carousel controls.
 const slides=$$('.hero-slide'),dots=$$('.hero-dot');let slide=0;
 const move=n=>{if(!slides.length)return;slide=(n+slides.length)%slides.length;slides.forEach((el,i)=>{el.classList.toggle('is-active',i===slide);el.classList.toggle('active',i===slide);el.setAttribute('aria-hidden',String(i!==slide));});dots.forEach((el,i)=>el.classList.toggle('is-active',i===slide));};
 if(slides.length){move(0);$('.hero-arrow--prev')?.addEventListener('click',()=>move(slide-1));$('.hero-arrow--next')?.addEventListener('click',()=>move(slide+1));dots.forEach((el,i)=>el.addEventListener('click',()=>move(i)));}
 $$('.carousel__btn').forEach(el=>el.addEventListener('click',()=>{const row=el.closest('.carousel')?.querySelector('.carousel__track');row?.scrollBy({left:(el.classList.contains('carousel__btn--prev')?-1:1)*320,behavior:'smooth'});}));
 const screenRail=$('#screenshotCarousel');$$('#carouselDots .carousel-dot').forEach((dot,i)=>{
  dot.setAttribute('role','button');dot.setAttribute('tabindex','0');dot.setAttribute('aria-label','Screenshot '+(i+1));
  const select=()=>{const item=screenRail?.children[i];if(item)screenRail.scrollTo({left:item.offsetLeft-screenRail.offsetLeft,behavior:'smooth'});$$('#carouselDots .carousel-dot').forEach((d,n)=>d.classList.toggle('active',n===i));};dot.addEventListener('click',select);dot.addEventListener('keydown',e=>{if(e.key==='Enter')select();});
 });
 const ultraSlides=$$('#main-carousel .carousel-slide'),ultraDots=$$('#carouselIndicators .indicator-dot');
 ultraDots.forEach((dot,i)=>{dot.setAttribute('role','button');dot.tabIndex=0;dot.setAttribute('aria-label','Slide '+(i+1));const select=()=>{ultraSlides.forEach((s,n)=>s.classList.toggle('active',n===i));ultraDots.forEach((d,n)=>d.classList.toggle('active',n===i));};dot.addEventListener('click',select);dot.addEventListener('keydown',e=>{if(e.key==='Enter')select();});});
 $('#ghostBtn')?.addEventListener('click',()=>$('#featureList')?.scrollIntoView({behavior:'smooth'}));
 // Repair fragment navigation: <base> must not send a local section link into /themes/.
 $$('a[href^="#"]:not(.download-link)').forEach(a=>{const hash=a.getAttribute('href');a.addEventListener('click',e=>{e.preventDefault();if(hash.length>1){try{$(hash)?.scrollIntoView({behavior:'smooth'});}catch{}}});});
 // CSS animation screenshots may capture their initial hidden state; reveal retained content.
 $$('.reveal,.animate-on-scroll').forEach(el=>el.classList.add('visible','active','is-visible'));
})();
