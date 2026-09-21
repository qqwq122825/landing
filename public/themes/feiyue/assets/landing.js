(() => {
  'use strict';
  const config = window.APP_CONFIG;
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const text = (zh,en) => document.documentElement.lang.startsWith('zh') ? zh : en;
  let downloadUrl = config.apkUrl;
  const dl = node => { node.href=downloadUrl; node.classList.add('download-link'); node.rel='noopener noreferrer'; };
  $$('a[href*="?app="], #rs-download-fab').forEach(dl);
  window.addEventListener('tv:settings',event=>{downloadUrl=event.detail.downloadUrl;$$('.download-link').forEach(dl);});
  window.TV_SETTINGS_READY?.then(()=>{downloadUrl=window.APP_CONFIG.apkUrl;$$('.download-link').forEach(dl);});
  const dialog = document.createElement('dialog'); dialog.className='tv-dialog'; dialog.setAttribute('aria-labelledby','tv-dialog-title');
  const close = document.createElement('button'); close.className='tv-close'; close.type='button'; close.textContent='×'; close.setAttribute('aria-label','关闭 / Close');
  const heading = document.createElement('h2'); heading.id='tv-dialog-title';
  const content = document.createElement('div'); dialog.append(close,heading,content); document.body.append(dialog);
  close.addEventListener('click',()=>dialog.close()); dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
  function open(title){heading.textContent=title;content.replaceChildren();if(!dialog.open)dialog.showModal();}
  function download(title=config.appName){
    open(title); const p=document.createElement('p'); p.textContent=text('在 App 内观看完整剧集，继续发现更多精彩短剧。','Watch full episodes in the app and discover more short dramas.');
    const a=document.createElement('a');a.className='tv-primary';a.textContent=text('下载 App · 继续观看','Download App · Watch now');dl(a);content.append(p,a);
  }
  function interactive(node, fn){if(!node)return;node.addEventListener('click',e=>{e.preventDefault();fn(e);});if(!['A','BUTTON'].includes(node.tagName)){node.tabIndex=0;node.setAttribute('role','button');node.addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();fn(e);}});}}
  const books=$$('[class*="BookItem_bookItem"]');
  const titles=[...new Set(books.map(n=>n.querySelector('h3')?.textContent.trim()).filter(Boolean))];
  // Posters use real links: one click, one project download, no intermediate prompt.
  // Move existing children so language bindings and loaded images keep their nodes.
  function directDownload(node){
    if(!node)return;
    if(node.tagName!=='A'){
      const link=document.createElement('a');
      [...node.attributes].forEach(attr=>link.setAttribute(attr.name,attr.value));
      link.append(...node.childNodes);node.replaceWith(link);node=link;
    }
    dl(node);
  }
  books.forEach(book=>{
    directDownload(book.querySelector('[data-slider-poster]'));
    directDownload(book.querySelector('h3 a'));
  });
  // Run before the shared capture listeners: a swipe-generated click is not a download.
  const swipedRows=new WeakSet();
  document.addEventListener('click',e=>{
    const row=e.target.closest?.('.Slider_sliderContainer__2F8gq');
    if(row&&swipedRows.has(row)){swipedRows.delete(row);e.preventDefault();e.stopImmediatePropagation();}
  },true);
  $$('a[href="javascript:;"]').forEach(a=>{
    if(a.closest('footer'))return;
    interactive(a,()=>download(a.querySelector('h1,h2,h3')?.textContent.trim()||a.textContent.trim()||config.appName));
  });
  // Restore row pagination and touch swipes missing from the static export.
  $$('.Slider_sliderContainer__2F8gq').forEach(box=>{
    box.classList.add('tv-horizontal');const track=box.querySelector('.Slider_sliderList__o0xyY');if(!track)return;
    const prev=box.querySelector('[aria-label="Previous"]'),next=box.querySelector('[aria-label="Next"]');let offset=0;
    const move=delta=>{offset=Math.max(0,Math.min(offset+delta,Math.max(0,track.scrollWidth-box.clientWidth)));track.style.transform=`translate3d(${-offset}px,0,0)`;prev?.parentElement.classList.toggle('Slider_disable__GAXYV',offset<1);next?.parentElement.classList.toggle('Slider_disable__GAXYV',offset>=track.scrollWidth-box.clientWidth-1);if(prev)prev.disabled=offset<1;if(next)next.disabled=offset>=track.scrollWidth-box.clientWidth-1;};
    prev?.addEventListener('click',()=>move(-box.clientWidth*.85));next?.addEventListener('click',()=>move(box.clientWidth*.85));
    let start=null;box.addEventListener('touchstart',e=>{start=[e.touches[0].clientX,e.touches[0].clientY];swipedRows.delete(box);},{passive:true});
    box.addEventListener('touchend',e=>{if(!start)return;const dx=e.changedTouches[0].clientX-start[0],dy=e.changedTouches[0].clientY-start[1];if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)){move((dx<0?1:-1)*box.clientWidth*.8);swipedRows.add(box);}start=null;},{passive:true});
    window.addEventListener('resize',()=>move(0));move(0);
    const row=box.closest('.Slider_slider__g_dkb');
    interactive(row?.querySelector('[data-i18n="common.viewAll"]'),()=>{row.classList.toggle('tv-expanded');move(-offset);});
  });
  interactive($('[data-i18n="nav.home"]'),()=>window.scrollTo({top:0,behavior:'smooth'}));
  interactive($('[aria-label="ReelShort home"]'),()=>window.scrollTo({top:0,behavior:'smooth'}));
  interactive($('[data-i18n="nav.categories"]'),()=>{
    open(text('剧集分类','Categories'));const list=document.createElement('div');list.className='tv-results';
    $$('.home_floorTitle__cIyIp h2').forEach(h=>{const b=document.createElement('button');b.className='tv-result';b.textContent=h.textContent;b.addEventListener('click',()=>{dialog.close();h.scrollIntoView({behavior:'smooth',block:'center'});});list.append(b);});content.append(list);
  });
  interactive($('[data-i18n-aria="aria.search"]'),()=>{
    open(text('搜索短剧','Search dramas'));const input=document.createElement('input');input.className='tv-search';input.type='search';input.placeholder=text('输入剧名','Search by title');input.setAttribute('aria-label',input.placeholder);
    const results=document.createElement('div');results.className='tv-results';results.dataset.empty=text('没有找到匹配剧集','No matching dramas');
    const render=()=>{results.replaceChildren();titles.filter(t=>t.toLowerCase().includes(input.value.toLowerCase().trim())).slice(0,30).forEach(t=>{const b=document.createElement('button');b.className='tv-result';b.textContent=t;b.addEventListener('click',()=>download(t));results.append(b);});};input.addEventListener('input',render);content.append(input,results);render();input.focus();
  });
  interactive($('[aria-label="History"]'),()=>download(text('在 App 中查看观看记录','View your history in the app')));
  interactive($('[data-i18n="nav.brand"]'),()=>download());
  // Reference checkout/account/support endpoints are not shipped with the landing page.
  $$('a[href*="/cdn-cgi/l/email-protection"],footer a[href="javascript:;"]').forEach(a=>interactive(a,()=>download()));
})();
