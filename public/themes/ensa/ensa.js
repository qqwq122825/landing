(() => {
  'use strict';
  const viewer=document.getElementById('viewer'),overlay=document.getElementById('dlOverlay');
  let viewerTrigger=null,downloadTrigger=null;
  function closeViewer(){viewer.classList.remove('on');document.body.style.overflow='';viewerTrigger?.focus();}
  function openViewer(card){
    viewerTrigger=card;document.getElementById('vImg').src=card.dataset.src;document.getElementById('vImg').alt=card.dataset.name;
    const details=[card.dataset.job,[card.dataset.height,card.dataset.weight].filter(Boolean).join(' · '),card.dataset.location].filter(Boolean);
    document.getElementById('vInfo').innerHTML='<div class="v-name" id="viewer-name"></div>'+details.map((v,i)=>'<div class="'+(i===0?'v-job':i===1?'v-stats':'v-loc')+'"></div>').join('');
    document.getElementById('viewer-name').textContent=card.dataset.name+', '+card.dataset.age;
    details.forEach((v,i)=>document.getElementById('vInfo').children[i+1].textContent=v);
    viewer.classList.add('on');document.body.style.overflow='hidden';viewer.querySelector('.viewer-close').focus();
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
})();
