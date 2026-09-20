(() => {
 'use strict';
 const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
 const realm=document.body.dataset.realm,isSuper=realm==='super',base=isSuper?'/api':'/p/'+realm+'/api';
 const state={csrf:'',username:'',projects:[],totals:{},active:0,view:'overview',project:null,stats:null,page:1,days:7,search:'',filter:'all',credentials:null,deleteSlug:null,deleting:false,pendingTemplate:null,previewMode:null,templates:[],templateSearch:'',selectedTemplate:null};
 const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const n=value=>Number(value||0).toLocaleString('zh-CN');
 const date=value=>new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date(Number(value)));
 const sec=value=>{const s=Math.round(Number(value||0)/1000);return s<60?s+'s':Math.floor(s/60)+'m '+s%60+'s';};
 const device={desktop:'电脑',mobile:'手机',tablet:'平板',other:'其他'};
 const region=new Intl.DisplayNames(['zh-CN'],{type:'region'});
 const country=c=>{try{return c?region.of(c):'未知';}catch{return '未知';}};
 const templateName=id=>id==='dptv'?'DPTV / MinuteDrama':'Feiyue / ReelShort';
 const status=p=>`<span class="badge ${p.status==='active'?'bg-success-lt':'bg-warning-lt'}">${p.status==='active'?'运行中':'已暂停'}</span>`;
 const landing=p=>location.origin+'/p/'+p.slug;
 const modalFocus=new WeakMap();
 function showModal(selector){const el=typeof selector==='string'?$(selector):selector;if(!el.classList.contains('show'))modalFocus.set(el,document.activeElement);$$('.modal.show').filter(d=>d!==el).forEach(hideModal);tabler.Modal.getOrCreateInstance(el).show();}
 function hideModal(selector){const el=typeof selector==='string'?$(selector):selector;if(!el?.classList.contains('show'))return;document.activeElement?.blur();tabler.Modal.getOrCreateInstance(el).hide();const trigger=modalFocus.get(el);if(trigger?.isConnected&&!trigger.closest('[hidden],.modal:not(.show)'))trigger.focus();}
 function toast(message,error=false){const el=$('#toast');$('#toast-text').textContent=message;el.classList.toggle('bg-danger-lt',error);tabler.Toast.getOrCreateInstance(el,{delay:4500}).show();}
 function setupSidebar(){
  const key='landing-hub:sidebar',desktop=window.matchMedia('(min-width: 992px)'),compact=window.matchMedia('(max-width: 1279.98px)');
  const root=document.documentElement,toggle=$('#sidebar-toggle'),mobileToggle=$('#sidebar-mobile-toggle'),menu=$('#sidebar-menu');
  let preference=null;
  try{const saved=localStorage.getItem(key);if(saved==='collapsed'||saved==='expanded')preference=saved;}catch{}
  function render(){
   const folded=desktop.matches&&(preference?preference==='collapsed':compact.matches);
   if(folded)root.setAttribute('data-bs-sidebar','folded');else root.removeAttribute('data-bs-sidebar');
   const label=folded?'展开侧栏':'收起侧栏';
   toggle.setAttribute('aria-expanded',String(!folded));toggle.setAttribute('aria-label',label);toggle.setAttribute('title',label);
  }
  toggle.addEventListener('click',()=>{
   preference=root.getAttribute('data-bs-sidebar')==='folded'?'expanded':'collapsed';
   try{localStorage.setItem(key,preference);}catch{}
   render();
  });
  function closeMobileMenu(){if(!desktop.matches)tabler.Collapse.getInstance(menu)?.hide();}
  desktop.addEventListener('change',()=>{render();tabler.Collapse.getInstance(menu)?.hide();});
  compact.addEventListener('change',render);
  for(const event of ['shown.bs.collapse','hidden.bs.collapse'])menu.addEventListener(event,()=>{
   mobileToggle.setAttribute('aria-label',menu.classList.contains('show')?'收起导航菜单':'展开导航菜单');
  });
  render();
  return {closeMobileMenu};
 }
 async function api(path,options={}){
  let response;try{response=await fetch(base+path,{credentials:'same-origin',cache:'no-store',...options,headers:{'Content-Type':'application/json','X-CSRF-Token':state.csrf,...options.headers}});}catch{throw Error('服务连接失败，请检查本地服务或网络');}
  let data;try{data=await response.json();}catch{throw Error('服务响应格式错误，请检查 PHP 和路由配置');}
  if(!response.ok){if(response.status===401&&path!=='/login')showLogin();throw Object.assign(Error(data.error||'操作失败，请重试'),{status:response.status});}return data;
 }
 const post=(path,body={})=>api(path,{method:'POST',body:JSON.stringify(body)});
 async function busy(button,job){if(button?.disabled)return;if(button)button.disabled=true;try{return await job();}catch(e){toast(e.message,true);}finally{if(button)button.disabled=false;}}
 async function copy(text){try{await navigator.clipboard.writeText(text);toast('已复制');return true;}catch{toast('请选中内容手动复制',true);return false;}}
 function showLogin(){state.csrf='';$('#boot').hidden=true;$('#shell').hidden=true;$('#login').hidden=false;$$('.modal.show').forEach(d=>hideModal(d));$('#password').value='';if(!isSuper){$('#login-kind').textContent='客户项目后台';$('#login-description').textContent='项目 '+realm+' · 使用分配给你的账号登录';} }
 function showShell(){ $('#boot').hidden=true;$('#login').hidden=true;$('#shell').hidden=false;$('#account-name').textContent=state.username;$('#account-role').textContent=isSuper?'总站管理员':'客户管理员';$('#account-avatar').textContent=state.username.slice(0,1).toUpperCase();$('#today-label').textContent=new Intl.DateTimeFormat('zh-CN',{year:'numeric',month:'long',day:'numeric'}).format(new Date());if(!isSuper){$('#main-nav').innerHTML='<button class="nav-item active" data-action="reload"><span>▦</span>我的项目</button>';$('#brand-home').href='/p/'+realm+'/admin';} }
 async function initialize(){try{const s=await api('/session');state.csrf=s.csrf;state.username=s.username;showShell();if(isSuper)await overview();else await detail(realm);}catch(e){if(e.status!==401){$('#boot').hidden=true;showLogin();$('#login-error').textContent=e.message;}}}
 function metric(label,value,symbol,caption){return `<article class="card"><div class="card-body"><div class="subheader">${label}</div><div class="h1 my-3">${value}</div><div class="text-secondary small">${caption}</div></div></article>`;}
 function metrics(t,root=false){return '<div class="stats-grid">'+(root?metric('项目总数',n(state.projects.length),'▦','每个项目拥有独立入口')+metric('运行中项目',n(state.active),'◈','<span class="text-success">● 正常运行</span> · 其余已暂停')+metric('今日访问',n(t.today_visits),'↗','按北京时间统计 · 真实访问')+metric('累计下载点击',n(t.downloads),'↓','累计点击，不等于安装完成'):metric('累计访问',n(t.visits),'↗','今日访问 '+n(t.today_visits))+metric('独立 IP',n(t.unique_ips),'◎','按真实访客 IP 去重')+metric('下载点击',n(t.downloads),'↓','今日下载点击 '+n(t.today_downloads))+metric('下载转化率',n(t.conversion_rate)+'%','◈','平均停留 '+sec(t.avg_duration)))+'</div>';}
 function heading(title,subtitle,actions=''){return `<div class="page-header mb-4"><div class="d-flex align-items-center justify-content-between gap-3 flex-wrap"><div><h1 class="page-title">${title}</h1><p class="text-secondary mt-2 mb-0">${subtitle}</p></div><div class="btn-list">${actions}</div></div></div>`;}
 function setView(view,title){state.view=view;$('#breadcrumb').textContent=title;$$('[data-view]').forEach(el=>el.classList.toggle('active',el.dataset.view===view));}
 async function overview(){
  const data=await api('/projects');Object.assign(state,{projects:data.projects,totals:data.totals,active:data.active});setView('overview','项目总览');
  $('#main').innerHTML=heading('项目总览','所有落地页，一个工作空间。管理客户、配置入口，了解每次访问。','<button class="btn btn-outline-secondary" data-action="reload">↻ 刷新</button><button class="btn btn-primary" data-action="create">＋ 开通项目</button>')+metrics(data.totals,true)+`<section class="card"><div class="card-header"><h2 class="card-title">全部项目 <span class="badge bg-primary-lt">${state.projects.length}</span></h2><div class="filters"><div class="input-icon"><input class="form-control" id="project-search" aria-label="搜索项目" placeholder="搜索项目名称、编号或账号" value="${escape(state.search)}"></div><select class="form-select" id="status-filter" aria-label="项目状态筛选"><option value="all">全部状态</option><option value="active">运行中</option><option value="paused">已暂停</option></select></div></div><div class="table-responsive"><table class="table table-vcenter table-hover"><thead><tr><th>项目 / 编号</th><th>客户账号 / 密码</th><th>状态</th><th>当前模板</th><th>访问 / 转化</th><th>创建时间</th><th>操作</th></tr></thead><tbody id="project-rows"></tbody></table></div><div class="card-footer d-flex justify-content-between align-items-center flex-wrap gap-2"><span id="project-count"></span><span>项目地址永久固定 · 账号独立分配</span></div></section>`;
  $('#status-filter').value=state.filter;renderRows();$('#project-search').addEventListener('input',e=>{state.search=e.target.value;renderRows();});$('#status-filter').addEventListener('change',e=>{state.filter=e.target.value;renderRows();});
 }
 function renderRows(){const q=state.search.trim().toLowerCase(),rows=state.projects.filter(p=>(state.filter==='all'||p.status===state.filter)&&[p.name,p.slug,p.username].some(v=>v.toLowerCase().includes(q)));$('#project-rows').innerHTML=rows.map((p,i)=>`<tr><td><div class="d-flex align-items-center gap-3"><div class="avatar bg-primary-lt tone-${i%4}">${escape(p.app_name.slice(0,1).toUpperCase())}</div><div><strong>${escape(p.name)}</strong><small class="font-monospace d-block text-secondary">/p/${p.slug}</small></div></div></td><td><code>${escape(p.username)}</code><div><button class="btn btn-link btn-sm" data-action="credentials" data-slug="${p.slug}">查看密码</button>${p.credentialsAvailable?'':'<small class="text-secondary">旧版账号</small>'}</div></td><td>${status(p)}</td><td><span class="badge bg-blue-lt">${p.template==='dptv'?'DPTV':'Feiyue'}</span></td><td>${n(p.visits)} <span class="font-monospace">/ ${n(p.conversions)}</span></td><td>${date(p.created_at)}</td><td><button class="btn btn-link btn-sm" data-action="manage" data-slug="${p.slug}">管理</button><button class="btn btn-link btn-sm" data-action="copy-delivery" data-slug="${p.slug}">复制交付</button><button class="btn btn-link btn-sm text-secondary" data-action="copy-url" data-slug="${p.slug}">复制地址</button><button class="btn btn-link btn-sm text-danger" data-action="delete-project" data-slug="${p.slug}">删除</button></td></tr>`).join('')||'<tr><td colspan="7"><div class="empty text-secondary py-4"><span>▦</span><b>这里还没有匹配的项目</b><p>试试其他关键词，或点击右上角开通一个新项目。</p></div></td></tr>';$('#project-count').textContent='显示 '+rows.length+' 个项目 · 共 '+state.projects.length+' 个';}
 async function detail(slug,keepScroll=false){
  const result=await api((isSuper?'/projects/'+slug:'/dashboard')+`?days=${state.days}&page=${state.page}`);state.project=result.project;state.stats=result.stats;state.page=result.stats.page;setView('detail',isSuper?'项目管理':'我的项目');const p=state.project;
  $('#main').innerHTML=(isSuper?'<button class="btn btn-link px-0 mb-3" data-view="overview">← 返回全部项目</button>':'')+`<div class="page-header d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4"><div class="d-flex align-items-center gap-3"><div class="avatar bg-primary-lt">${escape(p.app_name.slice(0,1))}</div><div><h1>${escape(isSuper?p.name:p.app_name)}</h1><p><span class="font-monospace">/p/${p.slug}</span>　${status(p)}</p></div></div><div class="btn-list"><button class="btn btn-outline-secondary" data-action="reload">↻ 刷新</button><a class="btn btn-primary" href="/p/${p.slug}" target="_blank" rel="noopener">打开落地页 ↗</a></div></div>`+metrics(result.stats.totals)+`<section class="card card-body d-flex justify-content-between align-items-center flex-wrap gap-3"><div class="hub-route"><span>落地页地址</span><a href="/p/${p.slug}" target="_blank" rel="noopener">${escape(landing(p))}</a></div><button class="btn btn-link btn-sm" data-action="copy-url" data-slug="${p.slug}">复制地址</button></section><div class="detail-grid"><div><section class="card"><div class="card-header"><h2 class="card-title">显示名与下载地址</h2><span class="badge bg-primary-lt">实时配置</span></div><div class="card-body"><form id="settings-form">${isSuper?`<label class="form-label mb-3">项目名称<input class="form-control" name="name" value="${escape(p.name)}" required maxlength="80"></label><label class="form-label mb-3">内部备注 <small>仅总站可见</small><textarea class="form-control" name="note" rows="2" maxlength="500">${escape(p.note)}</textarea></label>`:''}<label class="form-label mb-3">应用显示名<input class="form-control" name="appName" value="${escape(p.app_name)}" required maxlength="80"></label><label class="form-label mb-3">下载地址<input class="form-control" name="downloadUrl" type="url" value="${escape(p.download_url)}" placeholder="请填写 APK 下载地址" maxlength="2048"></label><label class="form-label mb-3">应用图标 <small>PNG / JPG / WebP，最大 200 KB</small><input class="form-control" name="logo" type="file" accept="image/png,image/jpeg,image/webp"></label><p class="form-hint">下载地址默认留空，由客户自行填写；留空时显示尚未配置，不使用备用链接。保存只影响当前项目。</p><button class="btn btn-primary" type="submit">保存项目配置</button></form></div></section></div><div><section class="card"><div class="card-header"><h2 class="card-title">落地页模板</h2><span class="badge bg-primary-lt">${p.allowedTemplates.length} / 2 款对客户开放</span></div><div class="card-body"><div class="template-grid">${['feiyue','dptv'].map(t=>`<button class="card card-link text-start ${p.template===t?'border-primary':''}" data-action="preview" data-template="${t}">${p.template===t?'<span class="badge bg-primary text-white">使用中</span>':''}<div class="card-header bg-primary-lt justify-content-center py-5 ${t}"><strong>${t==='dptv'?'DPTV':'ReelShort'}</strong></div><div class="card-body"><strong>${templateName(t)}</strong><span>${p.allowedTemplates.includes(t)?'已对客户开放 · 点击预览 ↗':'未对客户开放 · 总站可预览 ↗'}</span></div></button>`).join('')}</div><p class="form-hint">先预览，再确认使用。预览不会改变当前模板，也不计入访问。</p>${isSuper?templatePermissions(p):''}</div></section><section class="card"><div class="card-header"><h2 class="card-title">${isSuper?'客户账号与状态':'我的项目账号'}</h2></div><div class="card-body"><div class="datagrid"><div><label class="form-label mb-3">登录账号</label><strong>${escape(p.username)}</strong></div><div><label class="form-label mb-3">创建时间</label><strong>${date(p.created_at)}</strong></div><div><label class="form-label mb-3">后台路径</label><strong class="font-monospace">/p/${p.slug}/admin</strong></div><div><label class="form-label mb-3">项目状态</label><strong>${p.status==='active'?'运行中':'已暂停'}</strong></div></div>${isSuper?`<div class="btn-list mt-3"><a class="btn btn-outline-secondary" target="_blank" rel="noopener" href="/p/${p.slug}/admin">客户后台 ↗</a><button class="btn btn-outline-secondary" data-action="credentials" data-slug="${p.slug}">查看密码</button><button class="btn btn-primary" data-action="copy-delivery" data-slug="${p.slug}">复制交付</button><button class="btn btn-outline-secondary" data-action="reset-password">重置密码</button><button class="${p.status==='active'?'btn btn-outline-danger':'btn btn-outline-secondary'}" data-action="toggle-status">${p.status==='active'?'暂停项目':'恢复项目'}</button></div><p class="form-hint">内部备注：${escape(p.note||'未填写')}<br>暂停会同时停用落地页与客户后台，已有数据保留。</p>`:'<p class="form-hint">账号由总站管理员分配。密码遗失请联系总站管理员重新生成。</p>'}</div></section></div></div><section class="card"><div class="card-header"><div><h2 class="card-title">访问趋势</h2><p>最近 ${state.days} 天 · 每次访问最多计一次下载转化</p></div><div class="d-flex gap-2"><select class="form-select" id="days" aria-label="统计时间范围"><option value="7">最近 7 天</option><option value="30">最近 30 天</option></select></div></div><div class="card-body"><div id="bars" class="bars"></div><p class="text-secondary mt-3">国家 / 地区：${result.stats.countries.map(r=>escape(country(r.country))+' '+n(r.count)).join(' · ')||'暂无访问记录'}</p></div></section><section class="card"><div class="card-header"><div><h2 class="card-title">访问明细</h2><p>仅当前项目 · 地区来自可信代理 · 停留为可见时长估算</p></div><span class="badge bg-primary-lt">${n(result.stats.total)} 条</span></div><div class="table-responsive"><table class="table table-vcenter"><thead><tr><th>时间</th><th>IP / 地区</th><th>设备 / 系统 / 浏览器</th><th>停留</th><th>下载</th></tr></thead><tbody>${result.stats.visits.map(v=>`<tr><td>${date(v.started_at)}</td><td>${escape(v.ip_address||'未知')}<br><small>${escape([country(v.country),v.region,v.city].filter(Boolean).join(' · '))}</small></td><td>${escape([device[v.device]||v.device,v.os,v.browser].join(' / '))}</td><td>${sec(v.duration_ms)}</td><td class="${Number(v.clicked)?'yes':'no'}">${Number(v.clicked)?'已点击':'未点击'}</td></tr>`).join('')||'<tr><td colspan="5" class="empty text-secondary py-4">还没有访问记录。打开落地页后，新的访问会显示在这里。</td></tr>'}</tbody></table></div><div class="card-footer d-flex justify-content-between align-items-center flex-wrap gap-2"><span>第 ${result.stats.page} / ${result.stats.pages} 页 · 更新于 ${date(result.stats.updatedAt)}</span><div class="btn-list"><button class="btn btn-outline-secondary" data-action="prev" ${state.page<=1?'disabled':''}>上一页</button><button class="btn btn-outline-secondary" data-action="next" ${state.page>=result.stats.pages?'disabled':''}>下一页</button></div></div></section>`;
  $('#days').value=state.days;$('#days').addEventListener('change',e=>{state.days=Number(e.target.value);state.page=1;busy(null,()=>detail(p.slug,true));});drawBars(result.stats.daily);bindSettings();if(!keepScroll)window.scrollTo({top:0});
 }
 function templatePermissions(p){return `<form id="template-permissions-form"><fieldset class="form-fieldset"><legend>为此账号开放模板</legend>${['feiyue','dptv'].map(t=>`<label class="form-check"><input class="form-check-input" type="checkbox" name="allowedTemplates" value="${t}" ${p.allowedTemplates.includes(t)?'checked':''}> ${templateName(t)}</label>`).join('')}<p class="form-hint">至少开放一款。取消当前模板时，将切换至首个勾选模板；客户只显示和使用已开放模板。</p><button type="submit" class="btn btn-primary">保存开放模板</button></fieldset></form>`;}
 function drawBars(rows){const high=Math.max(1,...rows.map(r=>Number(r.visits)));$('#bars').innerHTML='<table class="table table-vcenter mb-0"><thead><tr><th>日期</th><th>访问趋势</th><th>访问</th><th>点击下载的访问</th></tr></thead><tbody>'+rows.map(r=>`<tr><td>${escape(r.day.slice(5))}</td><td><div class="progress"><div class="progress-bar bg-primary" data-day-visits="${Number(r.visits)}"></div></div></td><td>${n(r.visits)}</td><td>${n(r.downloads)}</td></tr>`).join('')+'</tbody></table>';$$('[data-day-visits]').forEach(el=>el.style.width=(100*Number(el.dataset.dayVisits)/high)+'%');}
 function settingsPath(){return isSuper?'/projects/'+state.project.slug:'/settings';}
 function bindSettings(){
  $('#template-permissions-form')?.addEventListener('submit',e=>{e.preventDefault();const form=e.currentTarget;busy(form.querySelector('button'),async()=>{const allowedTemplates=new FormData(form).getAll('allowedTemplates');if(!allowedTemplates.length)throw Error('请至少开放一款模板');await post(settingsPath(),{allowedTemplates});toast('已更新该账号的开放模板');await detail(state.project.slug,true);});});
  $('#settings-form').addEventListener('submit',e=>{e.preventDefault();const form=e.currentTarget;busy(form.querySelector('button'),async()=>{const fd=new FormData(form),data={appName:fd.get('appName'),downloadUrl:fd.get('downloadUrl')},file=fd.get('logo');if(isSuper){data.name=fd.get('name');data.note=fd.get('note');}if(file?.size){if(file.size>204800||!['image/png','image/jpeg','image/webp'].includes(file.type))throw Error('请选择 200 KB 以内的 PNG / JPG / WebP 图片');data.logoData=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(Error('图片读取失败'));r.readAsDataURL(file);});}const result=await post(settingsPath(),data);state.project=result.project;toast('项目配置已保存');await detail(state.project.slug,true);});});
 }
 async function analytics(){const data=await api('/projects');Object.assign(state,{projects:data.projects,totals:data.totals,active:data.active});setView('analytics','访问分析');$('#main').innerHTML=heading('访问分析','汇总所有项目的实际访问，不混淆各客户的数据。','<button class="btn btn-outline-secondary" data-action="reload">↻ 刷新</button>')+metrics(data.totals,true)+`<section class="card"><div class="card-header"><div><h2 class="card-title">项目访问分布</h2><p>累计访问 · 与项目明细保持一致</p></div></div><div class="card-body">${[...data.projects].sort((a,b)=>b.visits-a.visits).map(p=>`<div class="hub-ranking"><span>${escape(p.name)}</span><div class="progress"><div class="progress-bar bg-primary" data-rank="${Number(p.visits)}"></div></div><strong>${n(p.visits)}</strong></div>`).join('')||'<div class="empty text-secondary py-4">先开通项目，再开始收集访问。</div>'}</div></section><section class="card"><div class="card-header"><h2 class="card-title">统计说明</h2></div><div class="card-body"><p class="form-hint">下载数指点击，不代表安装完成。后台和预览不计入访问；实际落地页不因 DNT / GPC 自动停报。相同 IP 在不同项目分别统计；已暂停项目的历史数据继续保留。</p></div></section>`;const high=Math.max(1,...data.projects.map(p=>Number(p.visits)));$$('[data-rank]').forEach(el=>el.style.width=(100*Number(el.dataset.rank)/high)+'%');}
 async function auditView(){const data=await api('/audit');setView('audit','操作日志');$('#main').innerHTML=heading('操作日志','关键管理操作留痕，不记录密码明文。','<button class="btn btn-outline-secondary" data-action="reload">↻ 刷新</button>')+`<section class="card"><div class="card-header"><h2 class="card-title">最近 100 条操作</h2></div><div class="table-responsive"><table class="table table-vcenter"><thead><tr><th>时间</th><th>操作者</th><th>操作</th><th>所属项目</th><th>备注</th></tr></thead><tbody>${data.rows.map(r=>`<tr><td>${date(r.created_at)}</td><td>${escape(r.actor)}</td><td>${escape(r.action)}</td><td>${escape(r.project||'总站')}</td><td>${escape(r.detail||'—')}</td></tr>`).join('')||'<tr><td colspan="5" class="empty text-secondary py-4">暂无日志</td></tr>'}</tbody></table></div></section>`;}
 async function refresh(){if(state.view==='templates')return templateLibrary();if(state.view==='detail')return detail(state.project.slug,true);if(state.view==='analytics')return analytics();if(state.view==='audit')return auditView();return overview();}
 async function templateLibrary(){
  const csrf=state.csrf,data=await api('/templates');if(state.csrf!==csrf)return;
  state.templates=data.templates;setView('templates','模板管理');
  if(!state.templates.some(t=>t.id===state.selectedTemplate))state.selectedTemplate=state.templates[0]?.id||null;
  $('#main').innerHTML=`<div class="page-header mb-4"><div class="row align-items-center g-2"><div class="col"><h1 class="page-title fw-semibold">模板管理</h1><p class="text-secondary fs-5 mt-1 mb-0">预览模板，查看使用与开放情况。</p></div><div class="col-auto ms-auto"><button class="btn btn-outline-secondary" data-action="reload">↻ 刷新</button></div></div></div>
   <section class="card"><div class="card-header"><div><div class="d-flex align-items-center flex-wrap gap-3"><h2 class="card-title">全部模板 <span class="badge bg-primary-lt">${n(data.templates.length)}</span></h2><span class="text-secondary fs-5">关联项目 <strong class="text-body fw-medium">${n(data.projectCount)}</strong></span></div><p class="text-secondary fs-5 mt-1 mb-0">仅预览：不创建项目、不切换模板、不计入访问。</p></div><div class="input-icon ms-md-auto"><input class="form-control" id="template-search" aria-label="搜索模板" placeholder="搜索模板名称或编号" value="${escape(state.templateSearch)}"></div></div><div id="template-library-grid" class="template-library-grid"></div><p id="template-library-count" class="card-footer text-secondary" role="status"></p></section><section id="template-projects" class="card" aria-label="模板关联项目"></section><p class="form-hint">使用数与开放数包含已暂停项目。开放权限仍按账号设置，进入关联项目的「管理」即可调整；这里的预览不修改任何客户配置。</p>`;
  renderTemplateCards();renderTemplateProjects();
  $('#template-search').addEventListener('input',e=>{state.templateSearch=e.target.value;renderTemplateCards();});
 }
 function renderTemplateCards(){
  const q=state.templateSearch.trim().toLowerCase(),items=state.templates.filter(t=>[t.id,t.name,t.brand].some(v=>v.toLowerCase().includes(q)));
  $('#template-library-grid').innerHTML=items.map(t=>`<article class="card"><div class="card-header bg-primary-lt justify-content-center py-5 ${escape(t.id)}"><span class="subheader">落地页模板</span><strong>${escape(t.brand)}</strong><span class="badge bg-white text-secondary">${escape(t.id)}</span></div><div class="card-body"><h3>${escape(t.name)}</h3><p>${escape(t.description)}</p><div class="d-flex gap-2 flex-wrap">${t.tags.map(tag=>`<span>${escape(tag)}</span>`).join('')}</div><div class="datagrid my-3"><div><strong>${n(t.usedCount)}</strong><span>项目正在使用</span></div><div><strong>${n(t.allowedCount)}</strong><span>账号已开放</span></div></div><div class="btn-list"><button class="btn btn-primary" data-action="catalog-preview" data-template="${escape(t.id)}" aria-label="预览 ${escape(t.name)}">预览模板 ↗</button><button class="btn btn-outline-secondary" data-action="template-projects" data-template="${escape(t.id)}" aria-label="查看 ${escape(t.name)} 关联项目">查看关联项目</button></div></div></article>`).join('')||'<div class="empty text-secondary py-4"><b>没有匹配的模板</b><p>试试模板名称或编号，例如 DPTV、feiyue。</p></div>';
  $('#template-library-count').textContent='显示 '+items.length+' / '+state.templates.length+' 款模板';
 }
 function renderTemplateProjects(){
  const t=state.templates.find(item=>item.id===state.selectedTemplate),el=$('#template-projects');
  if(!t){el.innerHTML='<div class="empty text-secondary py-4">暂无模板</div>';return;}
  el.innerHTML=`<div class="card-header"><div><h2 class="card-title">${escape(t.name)} · 关联项目</h2><p>当前使用或已对该账号开放的项目</p></div><select class="form-select" id="template-project-filter" aria-label="选择关联模板">${state.templates.map(item=>`<option value="${escape(item.id)}">${escape(item.name)}</option>`).join('')}</select></div><div class="table-responsive"><table class="table table-vcenter"><thead><tr><th>项目 / 编号</th><th>客户账号</th><th>状态</th><th>模板关系</th><th>操作</th></tr></thead><tbody>${t.projects.map(p=>`<tr><td><div class="d-flex align-items-center gap-3"><div><strong>${escape(p.name)}</strong><small class="font-monospace d-block text-secondary">/p/${escape(p.slug)}</small></div></div></td><td><code>${escape(p.username)}</code></td><td>${status(p)}</td><td><div class="d-flex gap-2 flex-wrap">${p.using?'<span class="badge bg-blue-lt">当前使用</span>':''}${p.allowed?'<span>已开放</span>':'<span>未开放</span>'}</div></td><td><button class="btn btn-link btn-sm" data-action="manage" data-slug="${escape(p.slug)}">管理</button></td></tr>`).join('')||'<tr><td colspan="5" class="empty text-secondary py-4">暂无关联项目。开通项目或在项目管理中开放此模板后，将显示在这里。</td></tr>'}</tbody></table></div><div class="card-footer d-flex justify-content-between align-items-center flex-wrap gap-2"><span>${n(t.usedCount)} 个项目使用 · ${n(t.allowedCount)} 个账号已开放</span><span>共 ${n(t.projects.length)} 个关联项目</span></div>`;
  $('#template-project-filter').value=t.id;$('#template-project-filter').addEventListener('change',e=>{state.selectedTemplate=e.target.value;renderTemplateProjects();});
 }
 function setPreviewSize(size){
  const desktop=size==='desktop';$('#preview-dialog').classList.toggle('is-desktop',desktop);
  $$('[data-preview-size]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.previewSize===(desktop?'desktop':'mobile'))));
 }
 function openCatalogPreview(id){
  const t=state.templates.find(item=>item.id===id);if(!t||!isSuper)return;
  state.previewMode='catalog';state.pendingTemplate=null;$('#apply-template').hidden=true;$('#apply-template').disabled=true;
  $('#preview-title').textContent=t.name+' · 原始预览';setPreviewSize('mobile');$('#preview-frame').src=t.previewUrl;showModal('#preview-dialog');
 }
 function openProjectPreview(id){
  state.previewMode='project';state.pendingTemplate=id;$('#apply-template').hidden=false;
  $('#preview-title').textContent=templateName(id);$('#preview-frame').src='/p/'+state.project.slug+'/preview/'+id;
  const allowed=state.project.allowedTemplates.includes(id);$('#apply-template').disabled=!allowed||id===state.project.template;$('#apply-template').textContent=!allowed?'请先开放此模板':id===state.project.template?'当前使用中':'使用此模板';
  setPreviewSize('mobile');showModal('#preview-dialog');
 }
 function credentialText(c){return `落地页：${c.landingUrl}\n客户后台：${c.adminUrl}\n账号：${c.username}\n密码：${c.password}`;}
 function showCredentials(c,slug){
  if(!state.csrf||$('#shell').hidden||document.hidden)return;
  state.credentials=c;state.credentialSlug=slug;clearTimeout(showCredentials.timer);
  $('#credentials-content').innerHTML=[['落地页',c.landingUrl],['客户后台',c.adminUrl],['账号',c.username],['密码',c.password??'旧账号仅存哈希；重置一次后即可查看']].map(([label,v])=>`<div class="list-group-item d-flex justify-content-between gap-3 ${label==='密码'?'secret':''}"><label class="form-label mb-3">${label}</label><code>${escape(v)}</code></div>`).join('');
  $('#credentials-note').textContent=c.password?'密码已加密保存，可在总站再次查看。此窗口将在 60 秒后自动关闭。':'旧账号此前只保存密码哈希，原密码不变。由总站重置一次后，新密码可查看和复制；重置会让客户旧会话失效。';
  $('#copy-credentials').disabled=!c.password;$('#legacy-reset-credentials').hidden=!!c.password;$('#credentials-text').hidden=true;$('#credentials-text').value='';
  showModal('#credentials-dialog');showCredentials.timer=setTimeout(()=>hideModal('#credentials-dialog'),60000);
 }
 async function copyDelivery(){const c=state.credentials;if(!c?.password)return;const text=credentialText(c);if(!await copy(text)){if(state.credentials!==c||!$('#credentials-dialog').classList.contains('show'))return;$('#credentials-text').value=text;$('#credentials-text').hidden=false;$('#credentials-text').select();}}
 async function loadCredentials(slug,copyNow=false){const csrf=state.csrf;const data=await post('/projects/'+slug+'/credentials');if(state.csrf!==csrf)return;showCredentials(data.credentials,slug);if(copyNow&&data.available)await copyDelivery();}
 function resetCredentials(slug){confirm('重新生成客户密码？','旧密码和客户已登录会话将失效。新密码会加密保存，之后可在总站再次查看与复制。',async()=>{const data=await post('/projects/'+slug+'/password');hideModal('#confirm-dialog');showCredentials(data.credentials,slug);if(state.view==='detail')await detail(slug,true);else await overview();});}
 function confirm(title,text,job){$('#confirm-title').textContent=title;$('#confirm-text').textContent=text;$('#confirm-submit').onclick=()=>busy($('#confirm-submit'),async()=>{await job();hideModal('#confirm-dialog');});showModal('#confirm-dialog');}
 function openDeleteProject(slug){
  if(!isSuper)return;const p=state.projects.find(p=>p.slug===slug);if(!p)return;
  state.deleteSlug=slug;$('#delete-form').reset();$('#delete-error').textContent='';$('#delete-submit').disabled=true;
  $('#delete-project-name').textContent=p.name;$('#delete-project-route').textContent='/p/'+slug;$('#delete-project-slug').textContent=slug;
  showModal('#delete-dialog');$('#delete-confirm-slug').focus();
 }
 document.addEventListener('click',e=>{
  const close=e.target.closest('[data-close]');if(close){hideModal(close.closest('.modal'));return;}
  const size=e.target.closest('[data-preview-size]');if(size){setPreviewSize(size.dataset.previewSize);return;}
  const nav=e.target.closest('[data-view]');if(nav&&isSuper){sidebar.closeMobileMenu();busy(nav,()=>({overview,templates:templateLibrary,analytics,audit:auditView}[nav.dataset.view])());return;}
  const el=e.target.closest('[data-action]');if(!el)return;const a=el.dataset.action;
  if(a==='create'){$('#create-form').reset();$('#create-error').textContent='';showModal('#create-dialog');}
  if(a==='reload')busy(el,refresh);
  if(a==='manage'){state.page=1;busy(el,()=>detail(el.dataset.slug));}
  if(a==='copy-url')copy(location.origin+'/p/'+el.dataset.slug);
  if(a==='delete-project')openDeleteProject(el.dataset.slug);
  if(a==='credentials'||a==='copy-delivery')busy(el,()=>loadCredentials(el.dataset.slug,a==='copy-delivery'));
  if(a==='preview')openProjectPreview(el.dataset.template);
  if(a==='catalog-preview')openCatalogPreview(el.dataset.template);
  if(a==='template-projects'){state.selectedTemplate=el.dataset.template;renderTemplateProjects();$('#template-projects').scrollIntoView({block:'start',behavior:'instant'});}
  if(a==='prev'||a==='next'){state.page+=a==='prev'?-1:1;busy(el,()=>detail(state.project.slug,true));}
  if(a==='toggle-status'){const p=state.project,next=p.status==='active'?'paused':'active';confirm(next==='paused'?'暂停这个项目？':'恢复这个项目？',next==='paused'?'该客户的落地页和后台将立即停用，现有数据保留。':'恢复后客户可重新登录，落地页恢复访问。',async()=>{await post('/projects/'+p.slug+'/status',{status:next});toast('项目状态已更新');await detail(p.slug,true);});}
  if(a==='reset-password')resetCredentials(state.project.slug);
 });
 $('#login-form').addEventListener('submit',async e=>{e.preventDefault();$('#login-error').textContent='';const btn=$('#login-submit');btn.disabled=true;try{const data=await post('/login',{username:$('#username').value.trim(),password:$('#password').value});state.csrf=data.csrf;state.username=data.username;$('#password').value='';showShell();if(isSuper)await overview();else await detail(realm);}catch(e){$('#login-error').textContent=e.message;}finally{btn.disabled=false;}});
 $('#logout').addEventListener('click',()=>busy($('#logout'),async()=>{await post('/logout');showLogin();}));
 $('#create-form').addEventListener('submit',async e=>{e.preventDefault();const form=e.currentTarget,button=form.querySelector('[type=submit]');button.disabled=true;$('#create-error').textContent='';try{const result=await post('/projects',{...Object.fromEntries(new FormData(form)),allowedTemplates:new FormData(form).getAll('allowedTemplates')});hideModal('#create-dialog');showCredentials(result.credentials,result.project.slug);await overview();}catch(e){$('#create-error').textContent=e.message;}finally{button.disabled=false;}});
 $('#copy-credentials').addEventListener('click',copyDelivery);
 $('#delete-confirm-slug').addEventListener('input',()=>{$('#delete-submit').disabled=state.deleting||!state.deleteSlug||$('#delete-confirm-slug').value!==state.deleteSlug;});
 $('#delete-dialog').addEventListener('hide.bs.modal',e=>{
  if(state.deleting){e.preventDefault();return;}
  state.deleteSlug=null;$('#delete-form').reset();$('#delete-submit').disabled=true;$('#delete-error').textContent='';
 });
 $('#delete-form').addEventListener('submit',async e=>{
  e.preventDefault();const slug=state.deleteSlug;
  if(!isSuper||state.deleting||!slug||$('#delete-confirm-slug').value!==slug)return;
  state.deleting=true;$('#delete-submit').disabled=true;$('#delete-confirm-slug').disabled=true;$('#delete-error').textContent='';
  $$('#delete-dialog [data-close]').forEach(el=>el.disabled=true);
  let deleted=false;
  try{
   await post('/projects/'+slug+'/delete',{confirmSlug:slug});
   deleted=true;state.projects=state.projects.filter(p=>p.slug!==slug);if(state.view==='overview')renderRows();
   state.deleting=false;hideModal('#delete-dialog');state.project=null;toast('项目已永久删除');
   await overview();
  }catch(e){
   if(deleted)toast('项目已删除，列表刷新失败，请点击刷新',true);
   else if($('#delete-dialog').classList.contains('show'))$('#delete-error').textContent=e.message;else toast(e.message,true);
  }finally{
   state.deleting=false;$('#delete-confirm-slug').disabled=false;$$('#delete-dialog [data-close]').forEach(el=>el.disabled=false);
   $('#delete-submit').disabled=!state.deleteSlug||$('#delete-confirm-slug').value!==state.deleteSlug;
   if($('#shell').hidden)hideModal('#delete-dialog');
  }
 });
 $('#legacy-reset-credentials').addEventListener('click',()=>{const slug=state.credentialSlug;hideModal('#credentials-dialog');resetCredentials(slug);});
 $('#credentials-dialog').addEventListener('hide.bs.modal',()=>{clearTimeout(showCredentials.timer);state.credentials=null;state.credentialSlug=null;$('#credentials-content').replaceChildren();$('#credentials-text').value='';$('#credentials-text').hidden=true;});
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&$('#credentials-dialog').classList.contains('show'))hideModal('#credentials-dialog');});
 $('#preview-dialog').addEventListener('hide.bs.modal',()=>{$('#preview-frame').removeAttribute('src');state.previewMode=null;state.pendingTemplate=null;});
 $('#apply-template').addEventListener('click',()=>busy($('#apply-template'),async()=>{if(state.previewMode!=='project'||!state.project)return;await post(settingsPath(),{template:state.pendingTemplate});hideModal('#preview-dialog');toast('模板已应用');await detail(state.project.slug,true);}));
 const sidebar=setupSidebar();
 initialize();
})();
