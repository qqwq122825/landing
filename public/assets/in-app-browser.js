(() => {
  'use strict';

  const userAgent=navigator.userAgent||'';
  const isFacebookBrowser=/(?:FBAN|FBAV|FB_IAB|FBIOS|FB4A|Facebook|Instagram|Messenger)/i.test(userAgent)
    && !/facebookexternalhit/i.test(userAgent);
  if(!isFacebookBrowser)return;

  const isAndroid=/Android/i.test(userAgent);
  const language=(navigator.language||'en').toLowerCase();
  const copy={
    zh:{title:'请使用系统浏览器打开',description:'Facebook 内置浏览器可能会拦截安装包下载。请在 Chrome 或系统默认浏览器中继续。',manual:'如果没有自动跳转，请点击右上角 ⋯，然后选择“在浏览器中打开”。',open:'打开系统浏览器',copy:'复制页面链接',copied:'链接已复制，请粘贴到 Safari 或其他浏览器打开。',close:'暂时关闭'},
    en:{title:'Open in your browser',description:'Facebook’s in-app browser may block the app download. Continue in Chrome or your default browser.',manual:'If the browser does not open, tap ⋯ in the top-right corner and choose “Open in browser”.',open:'Open system browser',copy:'Copy page link',copied:'Link copied. Paste it into Safari or another browser.',close:'Not now'},
    es:{title:'Abrir en el navegador',description:'El navegador interno de Facebook puede bloquear la descarga. Continúa en Chrome o en tu navegador predeterminado.',manual:'Si no se abre, toca ⋯ arriba a la derecha y elige «Abrir en el navegador».',open:'Abrir navegador',copy:'Copiar enlace',copied:'Enlace copiado. Pégalo en Safari u otro navegador.',close:'Ahora no'},
    pt:{title:'Abrir no navegador',description:'O navegador interno do Facebook pode bloquear o download. Continue no Chrome ou no navegador padrão.',manual:'Se não abrir, toque em ⋯ no canto superior direito e escolha “Abrir no navegador”.',open:'Abrir navegador',copy:'Copiar link',copied:'Link copiado. Cole-o no Safari ou em outro navegador.',close:'Agora não'}
  };
  const text=copy[language.split('-')[0]]||copy.en;
  let enabled=false,overlay=null,lastFocus=null,previousOverflow='';

  function make(tag,className,content){
    const node=document.createElement(tag);
    if(className)node.className=className;
    if(content)node.textContent=content;
    return node;
  }
  function closePrompt(){
    if(!overlay)return;
    overlay.remove();overlay=null;
    document.documentElement.style.overflow=previousOverflow;
    lastFocus?.focus?.();
  }
  async function openOutside(status,button){
    if(isAndroid){
      const protocol=window.location.protocol.replace(':','')||'https';
      const target=`${window.location.host}${window.location.pathname}${window.location.search}`;
      window.location.href=`intent://${target}#Intent;scheme=${protocol};action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;end`;
      return;
    }
    try{
      await navigator.clipboard.writeText(window.location.href);
      status.textContent=text.copied;button.textContent=text.copied;
    }catch{
      status.textContent=text.manual;
    }
  }
  function showPrompt(){
    if(!enabled||overlay||!document.body)return;
    lastFocus=document.activeElement;
    previousOverflow=document.documentElement.style.overflow;
    document.documentElement.style.overflow='hidden';

    const style=make('style');
    style.textContent='.hub-browser-guide{position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(4,8,16,.78);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif}.hub-browser-guide__card{width:min(100%,420px);box-sizing:border-box;border-radius:20px;background:#fff;color:#111827;padding:26px 22px 20px;box-shadow:0 24px 70px rgba(0,0,0,.38);text-align:center}.hub-browser-guide__dots{position:absolute;right:max(18px,env(safe-area-inset-right));top:max(12px,env(safe-area-inset-top));color:#fff;font-size:32px;font-weight:800;line-height:1}.hub-browser-guide__arrow{position:absolute;right:max(31px,calc(env(safe-area-inset-right) + 13px));top:max(48px,calc(env(safe-area-inset-top) + 36px));width:56px;height:56px;border-top:4px solid #fff;border-right:4px solid #fff;border-radius:0 18px 0 0;transform:rotate(-18deg)}.hub-browser-guide__arrow:after{content:"";position:absolute;right:-7px;top:-8px;width:17px;height:17px;border-top:4px solid #fff;border-right:4px solid #fff;transform:rotate(16deg)}.hub-browser-guide__icon{display:grid;place-items:center;width:58px;height:58px;margin:0 auto 14px;border-radius:17px;background:#e8f1ff;color:#1769e0;font-size:30px}.hub-browser-guide h2{margin:0 0 10px;font-size:22px;line-height:1.25}.hub-browser-guide p{margin:0;color:#4b5563;font-size:15px;line-height:1.55}.hub-browser-guide__manual{margin-top:12px!important;padding:11px 12px;border-radius:12px;background:#f3f4f6;color:#374151!important}.hub-browser-guide__primary,.hub-browser-guide__close{display:block;width:100%;border:0;border-radius:12px;font:inherit;font-weight:700;cursor:pointer}.hub-browser-guide__primary{margin-top:18px;padding:13px 14px;background:#1769e0;color:#fff}.hub-browser-guide__close{margin-top:8px;padding:10px 14px;background:transparent;color:#6b7280}.hub-browser-guide__status{min-height:0;margin-top:8px!important;color:#1769e0!important;font-size:13px!important}@media(max-width:480px){.hub-browser-guide{align-items:flex-end;padding:14px}.hub-browser-guide__card{padding:24px 18px 16px;border-radius:20px 20px 14px 14px}}';
    const card=make('section','hub-browser-guide__card');
    card.setAttribute('role','dialog');card.setAttribute('aria-modal','true');card.setAttribute('aria-labelledby','hub-browser-guide-title');
    const icon=make('div','hub-browser-guide__icon','↗');icon.setAttribute('aria-hidden','true');
    const title=make('h2','',text.title);title.id='hub-browser-guide-title';
    const description=make('p','',text.description);
    const manual=make('p','hub-browser-guide__manual',text.manual);
    const status=make('p','hub-browser-guide__status');status.setAttribute('role','status');
    const primary=make('button','hub-browser-guide__primary',isAndroid?text.open:text.copy);primary.type='button';
    const close=make('button','hub-browser-guide__close',text.close);close.type='button';
    primary.addEventListener('click',()=>openOutside(status,primary));
    close.addEventListener('click',closePrompt);
    card.append(icon,title,description,manual,primary,status,close);
    overlay=make('div','hub-browser-guide');overlay.dataset.hubBrowserGuide='true';
    const dots=make('div','hub-browser-guide__dots','⋯');dots.setAttribute('aria-hidden','true');
    const arrow=make('div','hub-browser-guide__arrow');arrow.setAttribute('aria-hidden','true');
    overlay.append(style,dots,arrow,card);document.body.append(overlay);primary.focus();
  }
  function configure(data){
    enabled=!!data&&typeof data==='object'&&!data.preview&&!window.TV_PREVIEW;
    if(!enabled){closePrompt();return;}
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',showPrompt,{once:true});
    else showPrompt();
  }
  function intercept(event){
    if(!enabled||event.button!==0)return;
    const link=event.target?.closest?.('.download-link');
    if(!link||link.disabled||link.getAttribute('aria-disabled')==='true')return;
    event.preventDefault();event.stopImmediatePropagation();showPrompt();
  }
  document.addEventListener('click',intercept,true);
  window.addEventListener('tv:settings',event=>configure(event.detail));
  window.TV_SETTINGS_READY?.then(configure);
})();
