(() => {
 'use strict';
 const video=document.getElementById('v'), progress=document.getElementById('prog');
 const batches=Array.from(document.querySelectorAll('.batch')), segments=[];
 const dictionary=window.PURPLEAI_I18N,selector=document.getElementById('purpleai-language');
 const normalize=value=>typeof value==='string'&&/^hi(?:[-_]|$)/i.test(value)?'hi':typeof value==='string'&&/^en(?:[-_]|$)/i.test(value)?'en':null;
 const key='hub:purpleai:language:'+(window.HUB_PAGE?.slug||location.pathname),url=new URL(location.href);
 let saved;try{saved=localStorage.getItem(key);}catch{}
 let language=url.searchParams.has('lang')?normalize(url.searchParams.get('lang'))||'en':normalize(saved)||[...(navigator.languages||[]),navigator.language].map(normalize).find(Boolean)||'en';
 const text=(key,n)=>dictionary[language][key].replace('{n}',String(n));
 function soundText(){const sound=document.getElementById('sound');sound.setAttribute('aria-label',text(video.muted?'unmute':'mute'));sound.textContent=text(video.muted?'soundOff':'soundOn');}
 function translate(){
  document.documentElement.lang=language;document.documentElement.dir='ltr';selector.value=language;
  document.querySelectorAll('[data-i18n]').forEach(node=>{node.textContent=text(node.dataset.i18n);});
  document.querySelectorAll('[data-episodes]').forEach(node=>{node.textContent=text('episodes',node.dataset.episodes);});
  progress.setAttribute('aria-label',text('groups'));segments.forEach((button,index)=>button.setAttribute('aria-label',text('group',index+1)));soundText();
 }
 selector.addEventListener('change',()=>{language=normalize(selector.value)||'en';try{localStorage.setItem(key,language);}catch{}const next=new URL(location.href);next.searchParams.set('lang',language);history.replaceState(null,'',next);translate();});
 let current=1;
 function show(group){
  current=group;
  batches.forEach(batch=>batch.classList.toggle('on',Number(batch.dataset.batch)===group));
  segments.forEach((segment,index)=>{segment.classList.toggle('on',index<group);segment.setAttribute('aria-pressed',String(index+1===group));});
 }
 for(let i=0;i<batches.length;i++){
  const button=document.createElement('button');button.type='button';button.setAttribute('aria-label',text('group',i+1));
  button.addEventListener('click',()=>{video.autoplay=false;video.pause();show(i+1);if(Number.isFinite(video.duration)&&video.duration>0)video.currentTime=video.duration*(i+0.05)/batches.length;});
  progress.append(button);segments.push(button);
 }
 show(1);translate();
 video.addEventListener('timeupdate',()=>{
  if(video.paused||video.seeking||!Number.isFinite(video.duration)||video.duration<=0)return;
  const group=Math.min(batches.length,Math.floor(video.currentTime/video.duration*batches.length)+1);
  if(group!==current)show(group);
 });
 const sound=document.getElementById('sound');
 function toggleSound(){video.muted=!video.muted;sound.setAttribute('aria-pressed',String(!video.muted));soundText();video.play().catch(()=>{});}
 sound.addEventListener('click',toggleSound);
 video.addEventListener('click',toggleSound);
 document.querySelectorAll('.mcard').forEach(card=>card.addEventListener('click',()=>{
  document.querySelectorAll('.mcard').forEach(node=>node.classList.remove('playing'));card.classList.add('playing');
 }));
})();
