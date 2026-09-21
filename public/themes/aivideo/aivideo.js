(() => {
 'use strict';
 const $=s=>document.querySelector(s),dictionary=window.AIVIDEO_I18N,config=window.HUB_PAGE||{};
 const key='hub:aivideo:language:'+(config.slug||'template-demo');
 const normalize=value=>{const code=String(value||'').toLowerCase().split(/[-_]/)[0];return Object.hasOwn(dictionary,code)?code:null;};
 const url=new URL(location.href);let saved;try{saved=localStorage.getItem(key);}catch{}
 let lang=url.searchParams.has('lang')?(normalize(url.searchParams.get('lang'))||'ar'):(normalize(saved)||normalize(navigator.language)||'ar');
 const dialog=$('#download-modal'),video=$('#teaser-video'),toggle=$('#video-toggle');
 let returnFocus=null,promptTimer=null,videoFailed=false;
 function translate(){
  const d=dictionary[lang];document.documentElement.lang=lang;document.documentElement.dir=lang==='ar'?'rtl':'ltr';
  document.querySelectorAll('[data-i18n]').forEach(el=>el.textContent=d[el.dataset.i18n]);
  document.querySelectorAll('[data-i18n-aria]').forEach(el=>el.setAttribute('aria-label',d[el.dataset.i18nAria]));
  document.querySelectorAll('[data-i18n-alt]').forEach(el=>el.alt=d[el.dataset.i18nAlt]);
  document.querySelectorAll('[data-language]').forEach(el=>el.value=lang);
  document.querySelector('meta[name=description]').content=d.description;
  updateVideo();
 }
 function updateVideo(){toggle.textContent=dictionary[lang][video.paused?'play':'pause'];$('#video-status').hidden=!videoFailed;$('#video-status').textContent=videoFailed?dictionary[lang].videoError:'';}
 function open(result=false){
  clearTimeout(promptTimer);$('#download-offer').hidden=result;$('#download-result').hidden=!result;
  if(!dialog.open){returnFocus=document.activeElement;dialog.showModal();}
  if(result)$('#close-result').focus();
 }
 function close(){clearTimeout(promptTimer);dialog.close();}
 function downloads(data){if(data?.downloadUrl)document.querySelectorAll('a.download-link').forEach(link=>link.setAttribute('href',data.downloadUrl));}
 downloads(config);window.addEventListener('tv:settings',event=>downloads(event.detail));
 document.querySelectorAll('[data-language]').forEach(select=>select.addEventListener('change',event=>{
  lang=normalize(event.target.value)||'ar';try{localStorage.setItem(key,lang);}catch{}
  const next=new URL(location.href);next.searchParams.set('lang',lang);history.replaceState(null,'',next);translate();
 }));
 document.querySelectorAll('[data-open-app]').forEach(button=>button.addEventListener('click',()=>open()));
 // Buttons and page-surface clicks all use real links and the shared tracking path.
 document.querySelectorAll('a.download-link').forEach(link=>link.addEventListener('click',event=>{
  if(config.preview||window.TV_PREVIEW||event.defaultPrevented)return;
  open(true); // This is a link opening, not a claim that an APK finished downloading.
 }));
 document.addEventListener('click',event=>{
  if(config.preview||window.TV_PREVIEW||event.defaultPrevented||event.button!==0||event.ctrlKey||event.metaKey||event.altKey||event.shiftKey)return;
  // Keep interactive controls, dismissals, text selection and downloads out of the surface action.
  if(!event.target?.closest||event.target.closest('a,button,input,select,textarea,label,summary,video,dialog,[role="button"],[contenteditable],[data-no-download]')||window.getSelection()?.toString())return;
  event.preventDefault();$('#page-download').click();
 },true);
 $('#close-modal').addEventListener('click',close);$('#close-result').addEventListener('click',close);
 dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)close();});
 dialog.addEventListener('close',()=>returnFocus?.focus());
 video.addEventListener('playing',()=>{videoFailed=false;updateVideo();});video.addEventListener('pause',updateVideo);
 video.addEventListener('error',()=>{videoFailed=true;updateVideo();});
 toggle.addEventListener('click',()=>{if(video.paused)video.play().catch(updateVideo);else video.pause();});
 translate();
 if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches)video.play().catch(updateVideo);
 // Preserve the supplied one-time prompt on live pages; previews remain unobscured.
 if(!config.preview&&!window.TV_PREVIEW)promptTimer=setTimeout(()=>open(),1400);
})();
