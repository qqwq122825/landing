(() => {
 'use strict';const config=window.HUB_PAGE;if(!config)return;
 window.dispatchEvent(new CustomEvent('tv:settings',{detail:config}));
 // All template downloads stay inside the current project's /dl route.
 document.querySelectorAll('a.download-link').forEach(a=>a.href=config.downloadUrl);
 if(config.preview){const blockDownload=e=>{if(e.target.closest?.('.download-link')){e.preventDefault();e.stopImmediatePropagation();}};document.addEventListener('click',blockDownload,true);document.addEventListener('auxclick',blockDownload,true);return;}
 const endpoint='/p/'+config.slug+'/api/event';let visibleAt=document.visibilityState==='visible'?performance.now():null,stored=0;
 const elapsed=()=>Math.min(86400000,Math.round(stored+(visibleAt===null?0:performance.now()-visibleAt)));
 const event=(type)=>{const payload=JSON.stringify({type,id:type==='view'?config.visitId:crypto.randomUUID(),visitId:config.visitId,issued:config.issued,token:config.token,elapsed:elapsed()});if(!navigator.sendBeacon?.(endpoint,new Blob([payload],{type:'text/plain'})))fetch(endpoint,{method:'POST',body:payload,credentials:'omit',keepalive:true}).catch(()=>{});};
 event('view');document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'){stored=elapsed();visibleAt=null;event('stay');}else visibleAt=performance.now();});
 window.addEventListener('pagehide',()=>event('stay'));setInterval(()=>{if(visibleAt!==null)event('stay');},15000);
 document.addEventListener('click',e=>{if(e.target.closest?.('.download-link'))event('download');},true);
 document.addEventListener('auxclick',e=>{if(e.button===1&&e.target.closest?.('.download-link'))event('download');},true);
})();
