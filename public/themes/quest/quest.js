(() => {
 'use strict';
 const $=s=>document.querySelector(s),dictionary=window.QUEST_I18N;
 const config=window.HUB_PAGE||{},key='hub:quest:language:'+(config.slug||'template-demo');
 const titles=['The Reckoning Takes Flight','The Amber Trap','Now You Know Who I Am','Waterboy: Second Down','Zero to Alpha','The Thunder God','The Senator’s Son','The Night We Met','You Are My Destiny','The Duke’s Revenge'];
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
  const d=dictionary[lang],matches=titles.map((title,index)=>({title,index})).filter(item=>item.title.toLowerCase().includes(query.toLowerCase()));
  $('#video-grid').replaceChildren(...matches.slice(0,count).map(({title,index})=>{
   const button=document.createElement('button');button.type='button';button.className='video-card';button.dataset.card=String(index);button.setAttribute('aria-label',d.details+': '+title);
   // Only fixed local catalog data enters this markup; project values use the shared brand slots.
   button.innerHTML=`<span class="thumbnail-wrapper"><img src="posters/${String(index+1).padStart(2,'0')}.jpg" alt="${title}" width="600" height="900" loading="${index<4?'eager':'lazy'}"><span class="video-overlay hd">HD</span>${index%3!==0?'<span class="video-overlay vip">VIP</span>':''}<span class="video-overlay time">${d.sample}</span></span><span class="video-info"><span class="video-title">${title}</span><span class="video-tags"><span class="tag hot">${d.tagNew}</span><span class="tag">${d.tagDrama}</span></span><span class="video-meta"><span>${d.sample}</span><span>HD</span></span></span>`;
   button.addEventListener('click',()=>open(index));return button;
  }));
  $('#empty').hidden=matches.length>0;$('#load-more').disabled=count>=matches.length;$('#load-more').textContent=count>=matches.length?d.end:d.more;
 }
 function closeMenu(){menu.hidden=true;$('#menu-toggle').setAttribute('aria-expanded','false');}
 function open(index=-1){selected=index;returnFocus=document.activeElement;closeMenu();$('#selected-title').hidden=selected<0;$('#selected-title').textContent=titles[selected]||'';copyState='';copyAttempt++;$('#copy-status').textContent='';if(!dialog.open)dialog.showModal();}
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
