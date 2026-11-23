(() => {
  'use strict';
  const viewer=document.getElementById('viewer'),overlay=document.getElementById('dlOverlay');
  const dictionary=window.ENSA_I18N||{},supported=Object.keys(dictionary),fallback='es';
  const selector=document.getElementById('ensa-language');
  const storageKey='hub:ensa:language:'+((window.HUB_PAGE&&window.HUB_PAGE.slug)||location.pathname);
  let viewerTrigger=null,downloadTrigger=null,currentLanguage=fallback;
  const normalize=value=>{const code=String(value||'').toLowerCase().split(/[-_]/)[0];return supported.includes(code)?code:'';};
  const safeGet=()=>{try{return localStorage.getItem(storageKey)||'';}catch{return '';}};
  const safeSet=value=>{try{localStorage.setItem(storageKey,value);}catch{}}
  function initialLanguage(){
    const params=new URLSearchParams(location.search),raw=params.get('lang');
    if(raw!==null)return normalize(raw)||fallback;
    const saved=normalize(safeGet());if(saved)return saved;
    for(const value of (navigator.languages||[navigator.language])){const code=normalize(value);if(code)return code;}
    return fallback;
  }
  function translate(key){return (dictionary[currentLanguage]&&dictionary[currentLanguage][key])||(dictionary[fallback]&&dictionary[fallback][key])||key;}
  function refreshViewer(){
    if(!viewerTrigger||!viewer.classList.contains('on'))return;
    const job=viewerTrigger.dataset.jobKey?translate(viewerTrigger.dataset.jobKey):'';
    const details=[job,[viewerTrigger.dataset.height,viewerTrigger.dataset.weight].filter(Boolean).join(' · '),viewerTrigger.dataset.location].filter(Boolean);
    document.getElementById('vInfo').innerHTML='<div class="v-name" id="viewer-name"></div>'+details.map((v,i)=>'<div class="'+(i===0?'v-job':i===1?'v-stats':'v-loc')+'"></div>').join('');
    document.getElementById('viewer-name').textContent=viewerTrigger.dataset.name+', '+viewerTrigger.dataset.age;
    details.forEach((v,i)=>document.getElementById('vInfo').children[i+1].textContent=v);
  }
  function applyLanguage(language,{persist=false,updateUrl=false}={}){
    currentLanguage=normalize(language)||fallback;document.documentElement.lang=currentLanguage;document.documentElement.dir='ltr';
    document.querySelectorAll('[data-i18n]').forEach(node=>{node.textContent=translate(node.dataset.i18n);});
    document.querySelectorAll('[data-i18n-aria-label]').forEach(node=>{node.setAttribute('aria-label',translate(node.dataset.i18nAriaLabel));});
    if(selector){selector.value=currentLanguage;selector.setAttribute('aria-label',translate('language'));}
    refreshViewer();
    if(persist)safeSet(currentLanguage);
    if(updateUrl){const url=new URL(location.href);url.searchParams.set('lang',currentLanguage);history.replaceState(history.state,'',url);}
    window.dispatchEvent(new CustomEvent('ensa:language',{detail:{language:currentLanguage}}));
  }
  applyLanguage(initialLanguage());
  selector?.addEventListener('change',()=>applyLanguage(selector.value,{persist:true,updateUrl:true}));
  function closeViewer(){viewer.classList.remove('on');document.body.style.overflow='';viewerTrigger?.focus();}
  function openViewer(card){
    viewerTrigger=card;document.getElementById('vImg').src=card.dataset.src;document.getElementById('vImg').alt=card.dataset.name;
    viewer.classList.add('on');refreshViewer();document.body.style.overflow='hidden';viewer.querySelector('.viewer-close').focus();
  }
  document.querySelectorAll('.card[data-name]').forEach(card=>{
    card.addEventListener('click',event=>{if(!event.target.closest('.download-link'))openViewer(card);});
    card.addEventListener('keydown',event=>{if((event.key==='Enter'||event.key===' ')&&!event.target.closest('.download-link')){event.preventDefault();openViewer(card);}});
  });
  viewer.querySelector('.viewer-close').addEventListener('click',closeViewer);
  viewer.addEventListener('click',event=>{if(event.target===viewer)closeViewer();});
  function closeDownload(){overlay.classList.remove('on');document.body.style.overflow='';downloadTrigger?.focus();}
  function showDownload(){if(overlay.classList.contains('on'))return;downloadTrigger=document.activeElement;overlay.classList.add('on');document.body.style.overflow='hidden';overlay.querySelector('.dl-close').focus();}
  overlay.querySelector('.dl-close').addEventListener('click',closeDownload);
  overlay.addEventListener('click',event=>{if(event.target===overlay)closeDownload();});
  document.addEventListener('keydown',event=>{if(event.key!=='Escape')return;if(overlay.classList.contains('on'))closeDownload();else if(viewer.classList.contains('on'))closeViewer();});
  const video=document.getElementById('myVideo');video?.addEventListener('ended',showDownload);
  window.setTimeout(showDownload,8000);
  window.ENSA_LANGUAGE={get current(){return currentLanguage;},apply:applyLanguage,storageKey};
})();
