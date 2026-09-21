(() => {
 'use strict';
 const $=s=>document.querySelector(s),dictionary=window.QUEST_I18N;
 const config=window.HUB_PAGE||{},key='hub:quest:language:'+(config.slug||'template-demo');
 // 1:1 catalog posters: animated WebP from the reference CDN (not questmasterx.cyou origin).
 const catalog=[
  {title:'29109800',poster:'https://imagex1.sx.cdn.live/images/pinporn/2023/03/22/29109800.webp?width=620',time:'54:54'},
  {title:'24048352',poster:'https://imagex1.sx.cdn.live/images/pinporn/2020/11/28/24048352.webp?width=620',time:'59:04'},
  {title:'26322428',poster:'https://imagex1.sx.cdn.live/images/pinporn/2021/12/01/26322428.webp?width=620',time:'35:35'},
  {title:'26379889',poster:'https://imagex1.sx.cdn.live/images/pinporn/2021/12/12/26379889.webp?width=620',time:'75:15'},
  {title:'28462238',poster:'https://imagex1.sx.cdn.live/images/pinporn/2022/11/27/28462238.webp?width=620',time:'54:17'},
  {title:'29762614',poster:'https://imagex1.sx.cdn.live/images/pinporn/2023/07/24/29762614.webp?width=620',time:'52:55'},
  {title:'23068299',poster:'https://imagex1.sx.cdn.live/images/pinporn/2020/05/23/23068299.webp?width=620',time:'97:53'},
  {title:'29246787',poster:'https://imagex1.sx.cdn.live/images/pinporn/2023/04/17/29246787.webp?width=620',time:'20:10'},
  {title:'28294480',poster:'https://imagex1.sx.cdn.live/images/pinporn/2022/10/27/28294480.webp?width=620',time:'80:33'},
  {title:'25820627',poster:'https://imagex1.sx.cdn.live/images/pinporn/2021/09/03/25820627.webp?width=620',time:'37:35'}
 ];
 const normalize=value=>{const code=String(value||'').toLowerCase().split(/[-_]/)[0];return Object.hasOwn(dictionary,code)?code:null;};
 const url=new URL(location.href);let saved;try{saved=localStorage.getItem(key);}catch{}
 let lang=url.searchParams.has('lang')?(normalize(url.searchParams.get('lang'))||'es'):(normalize(saved)||normalize(navigator.language)||'es');
 let count=8,query='',selected=-1,copyState='',copyAttempt=0,returnFocus=null;
 const dialog=$('#app-dialog'),menu=$('#site-menu');
 function translate(){
  const d=dictionary[lang];document.documentElement.lang=lang;document.documentElement.dir='ltr';$('#language').value=lang;
  document.querySelectorAll('[data-i18n]').forEach(el=>{el.textContent=d[el.dataset.i18n];});
  document.querySelectorAll('[data-i18n-aria]').forEach(el=>el.setAttribute('aria-label',d[el.dataset.i18nAria]));
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el=>el.placeholder=d[el.dataset.i18nPlaceholder]);
  $('#copy-status').textContent=copyState?d[copyState]:'';render();
 }
 function render(){
  const d=dictionary[lang],matches=catalog.map((item,index)=>({...item,index})).filter(item=>item.title.toLowerCase().includes(query.toLowerCase()));
  $('#video-grid').replaceChildren(...matches.slice(0,count).map(({title,poster,time,index})=>{
   const button=document.createElement('button');button.type='button';button.className='video-card';button.dataset.card=String(index);button.setAttribute('aria-label',d.details+': '+title);
   // Catalog poster URLs are fixed CDN addresses; project branding still uses shared brand slots.
   button.innerHTML=`<span class="thumbnail-wrapper"><img src="${poster}" alt="${title}" width="600" height="900" loading="${index<4?'eager':'lazy'}"><span class="video-overlay hd">HD</span>${index%3!==0?'<span class="video-overlay vip">VIP</span>':''}<span class="video-overlay time">${time}</span></span><span class="video-info"><span class="video-title">${title}</span><span class="video-tags"><span class="tag hot">${d.tagNew}</span><span class="tag">${d.tagDrama}</span></span><span class="video-meta"><span>${time}</span><span>HD</span></span></span>`;
   button.addEventListener('click',()=>open(index));return button;
  }));
  $('#empty').hidden=matches.length>0;$('#load-more').disabled=count>=matches.length;$('#load-more').textContent=count>=matches.length?d.end:d.more;
 }
 function closeMenu(){menu.hidden=true;$('#menu-toggle').setAttribute('aria-expanded','false');}
 function open(index=-1){selected=index;returnFocus=document.activeElement;closeMenu();$('#selected-title').hidden=selected<0;$('#selected-title').textContent=catalog[selected]?.title||'';copyState='';copyAttempt++;$('#copy-status').textContent='';if(!dialog.open)dialog.showModal();}
 function downloads(data){if(!data?.downloadUrl)return;document.querySelectorAll('a.download-link').forEach(link=>link.setAttribute('href',data.downloadUrl));}
 downloads(config);window.addEventListener('tv:settings',event=>downloads(event.detail));
 $('#menu-toggle').addEventListener('click',()=>{menu.hidden=!menu.hidden;$('#menu-toggle').setAttribute('aria-expanded',String(!menu.hidden));});
 $('#search-toggle').addEventListener('click',()=>{const panel=$('#search-panel');panel.hidden=!panel.hidden;$('#search-toggle').setAttribute('aria-expanded',String(!panel.hidden));closeMenu();if(!panel.hidden)$('#search').focus();});
 $('#search-panel').addEventListener('submit',event=>{event.preventDefault();query=$('#search').value.trim();count=8;render();});
 $('#search').addEventListener('input',event=>{query=event.target.value.trim();count=8;render();});
 $('#load-more').addEventListener('click',()=>{count+=8;render();});
 $('#language').addEventListener('change',event=>{lang=normalize(event.target.value)||'es';try{localStorage.setItem(key,lang);}catch{}const next=new URL(location.href);next.searchParams.set('lang',lang);history.replaceState(null,'',next);translate();});
 document.querySelectorAll('[data-open-app]').forEach(el=>el.addEventListener('click',()=>open()));
 $('#close-dialog').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
 dialog.addEventListener('close',()=>{copyAttempt++;returnFocus?.focus();});
 document.addEventListener('click',event=>{if(!menu.contains(event.target)&&!event.target.closest('#menu-toggle'))closeMenu();});
 document.addEventListener('keydown',event=>{if(event.key==='Escape')closeMenu();});
 $('#copy-link').addEventListener('click',async()=>{const attempt=++copyAttempt;try{await navigator.clipboard.writeText(location.href);if(attempt===copyAttempt)copyState='copied';}catch{if(attempt===copyAttempt)copyState='copyFailed';}if(attempt===copyAttempt)$('#copy-status').textContent=dictionary[lang][copyState];});
 translate();
})();
