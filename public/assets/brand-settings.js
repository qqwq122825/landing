(() => {
  'use strict';
  let pixelStarted=false;
  let branding={},brandingQueued=false;
  const originals=new WeakMap();
  const wordmarks=new WeakMap();
  const logoSelector='[data-hub-logo]',nameSelector='[data-hub-name]',brandSelector='[data-hub-logo],[data-hub-name],[data-hub-wordmark]';
  const imageAttrs=['src','srcset','sizes','alt','data-src','data-srcset','data-sizes','data-original','data-lazy-src'];
  function remember(el,attrs,styles=[]) {
    if(!originals.has(el))originals.set(el,{attrs:Object.fromEntries(attrs.map(key=>[key,el.getAttribute(key)])),styles:Object.fromEntries(styles.map(key=>[key,el.style[key]]))});
    return originals.get(el);
  }
  function attr(el,key,value) {
    if(value===null){if(el.hasAttribute(key))el.removeAttribute(key);}
    else if(el.getAttribute(key)!==value)el.setAttribute(key,value);
  }
  function restore(el) {
    const original=originals.get(el);if(!original)return;
    Object.entries(original.attrs).forEach(([key,value])=>attr(el,key,value));
    Object.entries(original.styles).forEach(([key,value])=>{if(el.style[key]!==value)el.style[key]=value;});
    originals.delete(el);
  }
  function paintBranding() {
    const {appName,logoData}=branding;
    // Image-based brand lettering is a name slot, not a poster or a generic icon.
    document.querySelectorAll('[data-hub-wordmark]').forEach(el=>{
      if(!wordmarks.has(el))wordmarks.set(el,{html:el.innerHTML,active:false});
      const state=wordmarks.get(el),name=branding.appNameOverride;
      if(name){if(!state.active||el.textContent!==name)el.textContent=name;state.active=true;}
      else if(state.active){el.innerHTML=state.html;state.active=false;}
    });
    if(appName)document.querySelectorAll(nameSelector).forEach(el=>{if(el.textContent!==appName)el.textContent=appName;});
    document.querySelectorAll(logoSelector).forEach(el=>{
      if(el.tagName==='IMG'){
        const sources=el.closest('picture')?.querySelectorAll('source')||[];
        if(logoData){
          remember(el,imageAttrs,['objectFit']);
          sources.forEach(source=>remember(source,['srcset','sizes','data-srcset','data-sizes']));
          // Remove responsive/lazy sources so they cannot restore the template image.
          imageAttrs.filter(key=>!['src','alt'].includes(key)).forEach(key=>attr(el,key,null));
          sources.forEach(source=>['srcset','sizes','data-srcset','data-sizes'].forEach(key=>attr(source,key,null)));
          attr(el,'src',logoData);attr(el,'alt',appName||'应用图标');
          if(el.style.objectFit!=='contain')el.style.objectFit='contain';
        }else{restore(el);sources.forEach(restore);}
      }else if(el.tagName==='LINK'){
        if(logoData){remember(el,['href','type','sizes']);attr(el,'href',logoData);attr(el,'type',/^data:([^;,]+)/.exec(logoData)?.[1]||null);attr(el,'sizes',null);}else restore(el);
      }else if(el.getAttribute('data-hub-logo')==='background'){
        if(logoData){
          remember(el,[],['backgroundImage']);
          const value=`url("${logoData}")`;
          if(el.style.backgroundImage!==value)el.style.backgroundImage=value;
        }else restore(el);
      }
    });
  }
  function isBrandNode(node) {
    return node?.nodeType===1&&(node.matches(brandSelector)||node.querySelector(brandSelector));
  }
  // Language switches, lazy loading and newly inserted dialogs reuse the current brand.
  if(typeof MutationObserver!=='undefined')new MutationObserver(records=>{
    const changed=records.some(record=>record.type==='attributes'
      ?record.target.matches(brandSelector)||(record.target.tagName==='SOURCE'&&record.target.closest('picture')?.querySelector(logoSelector))
      :(record.target.nodeType===1?record.target:record.target.parentElement)?.closest(`${nameSelector},[data-hub-wordmark]`)
        ||record.target.closest?.('picture')?.querySelector(logoSelector)
        ||Array.from(record.addedNodes||[]).some(isBrandNode));
    if(!changed||brandingQueued)return;
    brandingQueued=true;queueMicrotask(()=>{brandingQueued=false;paintBranding();});
  }).observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['data-hub-logo','data-hub-name','data-hub-wordmark','src','srcset','sizes','data-src','data-srcset','data-sizes','data-original','data-lazy-src','alt','href','type','style']});
  // Browser preference signals do not gate tracking; retain the explicit site-level pause.
  const trackingAllowed=()=>window.HUB_TRACKING_CONSENT!==false;
  function startPixel(data) {
    if(pixelStarted || !/^\d{5,30}$/.test(data.pixelId||'') || data.preview || window.TV_PREVIEW || window.TV_REDIRECTING || !trackingAllowed())return;
    pixelStarted=true;
    // The project ID opts this landing page in; no disconnected consent flag is required.
    // Keep the standard Meta queue so clicks before the SDK finishes loading are retained.
    if(!window.fbq){
      const fbq=window.fbq=function(){fbq.callMethod?fbq.callMethod.apply(fbq,arguments):fbq.queue.push(arguments);};
      if(!window._fbq)window._fbq=fbq;
      fbq.push=fbq;fbq.loaded=true;fbq.version='2.0';fbq.queue=[];
      const script=document.createElement('script');script.async=true;script.src='https://connect.facebook.net/en_US/fbevents.js';document.head.append(script);
    }
    const fbq=window.fbq;
    fbq('init',data.pixelId);
    fbq('track','PageView');
    const download=event=>{
      if(!trackingAllowed() || window.TV_PREVIEW || window.TV_REDIRECTING)return;
      const link=event.target?.closest?.('.download-link');
      if(!link || link.disabled || link.getAttribute('aria-disabled')==='true')return;
      fbq('trackCustom','DownloadClick');
    };
    // Capture also covers JS download redirects and dynamically inserted download buttons.
    document.addEventListener('click',event=>{if(event.button===0)download(event);},true);
    document.addEventListener('auxclick',event=>{if(event.button===1)download(event);},true);
  }
  function apply(data) {
    if(!data || typeof data!=='object')return;
    branding={...branding,...data};
    if(branding.appName)document.title=branding.appName;
    paintBranding();
    startPixel(data);
  }
  window.addEventListener('tv:settings',e=>apply(e.detail));
  window.TV_SETTINGS_READY?.then(data=>{if(data)apply(data);});
})();
