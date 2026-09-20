import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawn,execFileSync} from 'node:child_process';
import {mkdtempSync,rmSync,readFileSync,renameSync,statSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import net from 'node:net';
import {randomUUID,createHash} from 'node:crypto';
const root=fileURLToPath(new URL('../',import.meta.url));
const wait=ms=>new Promise(r=>setTimeout(r,ms));

test('master UI uses local Tabler components without Vue or a frontend build step',()=>{
 const html=readFileSync(root+'app/console.html','utf8');
 const js=readFileSync(root+'public/assets/console.js','utf8');
 const pkg=JSON.parse(readFileSync(root+'package.json','utf8'));
 assert.match(html,/vendor\/tabler-1\.5\.1\/tabler\.min\.css/);
 assert.match(html,/vendor\/tabler-1\.5\.1\/tabler\.min\.js/);
 assert.ok(html.indexOf('tabler.min.js')<html.indexOf('/assets/console.js'));
 assert.doesNotMatch(html,/<dialog\b|<script[^>]+src="https?:|<link[^>]+href="https?:|<script[^>]+(?:vue|vite)/i);
 assert.match(js,/tabler\.Modal\.getOrCreateInstance/);assert.match(js,/tabler\.Toast\.getOrCreateInstance/);
 assert.match(js,/hide\.bs\.modal/);assert.doesNotMatch(js,/\.showModal\(\)/);
 assert.equal(pkg.scripts.build,undefined);assert.equal(pkg.dependencies,undefined);assert.equal(pkg.devDependencies,undefined);
 assert.equal(existsSync(root+'vite.config.mjs'),false);assert.equal(existsSync(root+'frontend/admin/App.vue'),false);
});

test('overview omits intro banner, onboarding and activity cards, while the dedicated audit page remains',()=>{
 const html=readFileSync(root+'app/console.html','utf8');
 const js=readFileSync(root+'public/assets/console.js','utf8');
 const css=readFileSync(root+'public/assets/console.css','utf8');
 assert.doesNotMatch(html+js,/architecture-(?:button|dialog)|平台说明|从这里，开始一个新项目|最近动态|从开户到上线|自动生成项目地址和客户账号|hub-intro/);
 assert.doesNotMatch(css,/architecture-button|sidebar-footer|bottom-grid|hub-intro/);
 const overview=js.slice(js.indexOf(' async function overview(){'),js.indexOf(' function renderRows(){'));
 assert.match(overview,/api\('\/projects'\)/);
 assert.ok(overview.includes('metrics(data.totals,true)+`<section class="card">'));
 assert.match(overview,/全部项目/);
 assert.doesNotMatch(overview,/api\('\/audit'\)|recent\(/);
 assert.match(html,/data-view="audit"/);
 assert.match(js,/async function auditView\(\).*?api\('\/audit'\)/);
});

test('template catalog uses compact native typography without a separate blue banner',()=>{
 const js=readFileSync(root+'public/assets/console.js','utf8');
 const catalog=js.slice(js.indexOf(' async function templateLibrary(){'),js.indexOf(' function renderTemplateCards(){'));
 assert.match(catalog,/<h1 class="page-title fw-semibold">模板管理<\/h1>/);
 assert.match(catalog,/<p class="text-secondary fs-5 mt-1 mb-0">预览模板/);
 assert.match(catalog,/<p class="text-secondary fs-5 mt-1 mb-0">仅预览/);
 assert.match(catalog,/关联项目 <strong class="text-body fw-medium">\$\{n\(data.projectCount\)\}/);
 assert.match(catalog,/全部模板.*?n\(data.templates.length\)/);
 assert.doesNotMatch(catalog,/alert-info|所有模板集中查看/);
 assert.match(catalog,/id="template-search"/);
 assert.match(catalog,/id="template-library-count"[^>]*role="status"/);
 assert.match(catalog,/renderTemplateCards\(\);renderTemplateProjects\(\)/);
});

test('vendored Tabler files match the pinned upstream distribution and have license notices',()=>{
 const base=root+'public/assets/vendor/tabler-1.5.1/';
 for(const [name,expected] of [['tabler.min.css','6aa5677e9cfc2620405bf97a98074ba43ff06a411cb35c5337acfb56d124c273'],['tabler.min.js','d4c4c2768f166c308391e0cea44db593056f12b84a4eeef46d55e35ca46d6e60']]){
  assert.equal(createHash('sha256').update(readFileSync(base+name)).digest('hex'),expected);
 }
 assert.match(readFileSync(base+'LICENSE','utf8'),/MIT License/);
 const css=readFileSync(base+'tabler.min.css','utf8');
 assert.doesNotMatch(css,/@import\s+(?:url\()?['"]?https?:/);
 for(const match of css.matchAll(/url\(([^)]+)\)/g))assert.match(match[1],/^['"]?data:/);
});

test('customer credentials are matching-length random alphanumeric strings without a fixed prefix',()=>{
 const result=JSON.parse(execFileSync('php',['-r',`require "app/credentials.php";
  $valid=true;$prefixes=[];
  for($i=0;$i<256;$i++){
   $u=random_customer_credential(false);$p=random_customer_credential(true);$prefixes[substr($u,0,2)]=true;
   $valid=$valid && strlen($u)===10 && strlen($p)===10
    && preg_match('/^[a-z2-9]{10}$/D',$u) && preg_match('/[a-z]/',$u) && preg_match('/[2-9]/',$u)
    && preg_match('/^[A-Za-z2-9]{10}$/D',$p) && preg_match('/[a-z]/',$p) && preg_match('/[A-Z]/',$p) && preg_match('/[2-9]/',$p)
    && !preg_match('/[0O1Ilo]/',$u.$p) && !str_starts_with($u,'lp');
  }
  echo json_encode(['valid'=>(bool)$valid,'variedPrefix'=>count($prefixes)>1]);`],{cwd:root,encoding:'utf8'}));
 assert.deepEqual(result,{valid:true,variedPrefix:true});
});

test('updating the credential generator preserves existing lp accounts and long passwords',()=>{
 const runtime=mkdtempSync(join(tmpdir(),'landing-hub-legacy-credential-'));
 const env={...process.env,HUB_DATA_DIR:runtime};
 try{
  const before=JSON.parse(execFileSync('php',['-r',`require "app/bootstrap.php";
   $r=create_project(['name'=>'Legacy account fixture'],'fixture');$slug=$r['project']['slug'];
   $u='lp12345678';$p=str_repeat('A',23).'9';$hash=password_hash($p,PASSWORD_DEFAULT);$cipher=seal_customer_password($p,$slug,$u);
   query('UPDATE projects SET username=?,password_hash=?,password_cipher=? WHERE slug=?',[$u,$hash,$cipher,$slug]);
   echo json_encode(project($slug));`],{cwd:root,env,encoding:'utf8'}));
  const after=JSON.parse(execFileSync('php',['-r',`require "app/bootstrap.php";$p=project($argv[1]);
   echo json_encode(['project'=>$p,'valid'=>password_verify(str_repeat('A',23).'9',$p['password_hash']),'deliveryValid'=>open_customer_password($p)===str_repeat('A',23).'9']);`,before.slug],{cwd:root,env,encoding:'utf8'}));
  assert.deepEqual(after.project,before);assert.equal(after.valid,true);assert.equal(after.deliveryValid,true);
 }finally{rmSync(runtime,{recursive:true,force:true});}
});

test('Landing Hub integration — isolated SQLite fixture',async t=>{
 const runtime=mkdtempSync(join(tmpdir(),'landing-hub-test-'));
 const env={...process.env,HUB_DATA_DIR:runtime,HUB_DEV:'1',HUB_FACEBOOK_VERIFY:'fixture_domain_code'};
 const password='Fixture-Admin-2026!';
 execFileSync('php',['bin/setup.php','--username=fixture','--password='+password],{cwd:root,env});
 const port=await new Promise(resolve=>{const s=net.createServer();s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>resolve(p));});});
 const base=`http://127.0.0.1:${port}`;
 const child=spawn('php',['-S',`127.0.0.1:${port}`,'-t',root+'public',root+'router.php'],{cwd:root,env,stdio:['ignore','ignore','pipe']});
 let log='';child.stderr.on('data',b=>log+=b);
 t.after(async()=>{child.kill('SIGTERM');await new Promise(r=>child.once('exit',r));rmSync(runtime,{recursive:true,force:true});});
 for(let i=0;i<60;i++){try{await fetch(base);break;}catch{if(i===59)throw Error(log);await wait(50);}}
 async function request(path,{method='GET',body,cookie='',csrf='',origin=base,headers={},...rest}={}){
  const res=await fetch(base+path,{method,redirect:'manual',...rest,headers:{Origin:origin,...(cookie?{Cookie:cookie}:{}),...(body!==undefined?{'Content-Type':'application/json'}:{}),...(csrf?{'X-CSRF-Token':csrf}:{}),...headers},...(body===undefined?{}:{body:JSON.stringify(body)})});
  const text=await res.text();let data;try{data=JSON.parse(text);}catch{data=null;}
  return {status:res.status,data,text,headers:res.headers,cookie:res.headers.get('set-cookie')?.split(';')[0]||cookie};
 }
 const post=(path,body,ctx={})=>request(path,{method:'POST',body,...ctx});
 const signIn=async(path,username,password)=>{const r=await post(path,{username,password});assert.equal(r.status,200,r.text);return {cookie:r.cookie,csrf:r.data.csrf,headers:r.headers};};
 let master,A,B,ca,cb,token;
 await t.test('template inventory and global previews require master authentication',async()=>{
  for(const path of ['/api/templates','/templates/feiyue/preview','/templates/dptv/preview'])assert.equal((await request(path)).status,401,path);
 });
 await t.test('root renders a no-store master login with self-only CSP',async()=>{const r=await request('/');assert.equal(r.status,200);assert.match(r.text,/data-realm="super"/);assert.match(r.headers.get('cache-control'),/no-store/);assert.match(r.headers.get('content-security-policy'),/frame-ancestors 'none'/);assert.match(r.text,/facebook-domain-verification.*fixture_domain_code/);});
 await t.test('plain PHP serves master UI and all local library assets without a build server',async()=>{
  const page=await request('/');
  assert.match(page.headers.get('content-security-policy'),/script-src 'self'/);
  assert.doesNotMatch(page.headers.get('content-security-policy'),/unsafe-eval|unsafe-inline/);
  for(const file of ['tabler.min.css','tabler.min.js']){
   const path='/assets/vendor/tabler-1.5.1/'+file;assert.ok(page.text.includes(path));
   const response=await request(path);assert.equal(response.status,200);assert.equal(response.text,readFileSync(root+'public'+path,'utf8'));
  }
 });
 await t.test('anonymous users and invalid credentials are denied',async()=>{assert.equal((await request('/api/projects')).status,401);assert.equal((await post('/api/login',{username:'fixture',password:'wrong'})).status,401);});
 await t.test('master login sets HttpOnly SameSite cookie and CSRF token',async()=>{master=await signIn('/api/login','fixture',password);assert.match(master.headers.get('set-cookie'),/HttpOnly/i);assert.match(master.headers.get('set-cookie'),/SameSite=Strict/i);assert.equal(master.csrf.length,48);});
 await t.test('mutation rejects missing CSRF and cross-origin requests',async()=>{assert.equal((await post('/api/projects',{name:'bad'},{cookie:master.cookie})).status,403);assert.equal((await post('/api/projects',{name:'bad'},{...master,origin:'https://other.example'})).status,403);});
 await t.test('master sees the complete template catalog before creating any project',async()=>{
  const r=await request('/api/templates',master);assert.equal(r.status,200);assert.match(r.headers.get('cache-control'),/no-store/);assert.equal(r.data.projectCount,0);
  assert.deepEqual(r.data.templates.map(t=>t.id),['feiyue','dptv']);
  for(const item of r.data.templates){assert.equal(item.usedCount,0);assert.equal(item.allowedCount,0);assert.deepEqual(item.projects,[]);assert.equal(item.previewUrl,'/templates/'+item.id+'/preview');}
  const page=await request('/');assert.match(page.text,/data-view="templates"/);assert.match(page.text,/data-preview-size="desktop"/);
 });
 await t.test('standalone previews render both real templates without accounts, tokens or analytics writes',async()=>{
  for(const id of ['feiyue','dptv']){
   const r=await request('/templates/'+id+'/preview',master);assert.equal(r.status,200,r.text);assert.match(r.text,new RegExp('<base href="/themes/'+id+'/">'));assert.equal(r.headers.get('x-frame-options'),'SAMEORIGIN');assert.match(r.headers.get('cache-control'),/no-store/);
   const config=JSON.parse(r.text.match(/window\.HUB_PAGE=(.*?);window\.APP_CONFIG/s)[1]);assert.equal(config.preview,true);assert.equal(config.token,'');assert.equal(config.pixelId,'');assert.equal(config.logoData,'');assert.equal(config.appName,id==='dptv'?'DPTV':'ReelShort');assert.equal(config.slug,'template-demo');
  }
  const counts=JSON.parse(execFileSync('php',['-r','require "app/bootstrap.php"; echo json_encode([query("SELECT COUNT(*) FROM projects")->fetchColumn(),query("SELECT COUNT(*) FROM visits")->fetchColumn(),query("SELECT COUNT(*) FROM events")->fetchColumn()]);'],{cwd:root,env,encoding:'utf8'}));assert.deepEqual(counts,[0,0,0]);
  assert.equal((await request('/templates/missing/preview',master)).status,404);assert.equal((await post('/templates/dptv/preview',{},master)).status,404);assert.equal((await post('/api/templates',{},master)).status,404);
 });
 await t.test('project creation returns unique generated account, slug, one-time password',async()=>{A=(await post('/api/projects',{name:'客户 A',appName:'Alpha',note:'PRIVATE A',template:'feiyue'},master)).data;B=(await post('/api/projects',{name:'客户 B',appName:'Beta',note:'PRIVATE B',template:'dptv',username:'mtx',password:'mtx123',slug:'fixedslug'},master)).data;assert.match(A.project.slug,/^[a-f0-9]{9}$/);for(const item of [A,B]){assert.match(item.credentials.username,/^[a-z2-9]{10}$/);assert.doesNotMatch(item.credentials.username,/^lp/);assert.match(item.credentials.password,/^[A-Za-z2-9]{10}$/);assert.match(item.credentials.password,/[a-z]/);assert.match(item.credentials.password,/[A-Z]/);assert.match(item.credentials.password,/[2-9]/);assert.equal(item.credentials.username.length,item.credentials.password.length);}assert.notEqual(A.credentials.password,B.credentials.password);assert.notEqual(B.credentials.password,'mtx123');assert.notEqual(B.credentials.username,'mtx');assert.notEqual(B.project.slug,'fixedslug');assert.notEqual(A.project.slug,B.project.slug);assert.notEqual(A.credentials.username,B.credentials.username);assert.equal(A.credentials.adminUrl,base+'/p/'+A.project.slug+'/admin');assert.equal(A.project.password_hash,undefined);});
 await t.test('new projects have an empty APK URL without a fallback redirect',async()=>{for(const item of [A,B]){assert.equal(item.project.download_url,'');assert.equal(item.project.pixel_id,'');const r=await request('/p/'+item.project.slug+'/dl');assert.equal(r.status,404);assert.equal(r.headers.get('location'),null);assert.match(r.text,/下载地址尚未配置/);}});
 await t.test('project lists contain no credential hashes or passwords',async()=>{const r=await request('/api/projects',master);assert.equal(r.data.projects.length,2);assert.equal(r.data.totals.visits,0);assert.doesNotMatch(r.text,/password|\$2y\$/);assert.ok(!r.text.includes(A.credentials.password));});
 await t.test('each customer signs in only at their own entry',async()=>{ca=await signIn('/p/'+A.project.slug+'/api/login',A.credentials.username,A.credentials.password);cb=await signIn('/p/'+B.project.slug+'/api/login',B.credentials.username,B.credentials.password);assert.match(ca.headers.get('set-cookie'),new RegExp('path=/p/'+A.project.slug,'i'));assert.equal((await post('/p/'+B.project.slug+'/api/login',A.credentials)).status,401);});
 const aPath=()=>'/p/'+A.project.slug;
 const bPath=()=>'/p/'+B.project.slug;
 await t.test('both templates embed their own saved Pixel ID and versioned shared tracking scripts',async()=>{
  const version=createHash('sha256').update(readFileSync(root+'public/assets/brand-settings.js')).digest('hex').slice(0,12);
  const collectorVersion=createHash('sha256').update(readFileSync(root+'public/assets/collector.js')).digest('hex').slice(0,12);
  try{
   for(const [p,ctx,id] of [[A,ca,'1000000000000001'],[B,cb,'2000000000000002']]){
    assert.equal((await post('/p/'+p.project.slug+'/api/settings',{pixelId:id},ctx)).status,200);
    const r=await request('/p/'+p.project.slug);assert.equal(r.status,200);
    const config=JSON.parse(r.text.match(/window\.HUB_PAGE=(.*?);window\.APP_CONFIG/s)[1]);assert.equal(config.pixelId,id);assert.equal(config.preview,false);
    assert.equal((r.text.match(/src="\/assets\/brand-settings\.js\?v=/g)||[]).length,1);assert.ok(r.text.includes('/assets/brand-settings.js?v='+version));
    assert.equal((r.text.match(/src="\/assets\/collector\.js\?v=/g)||[]).length,1);assert.ok(r.text.includes('/assets/collector.js?v='+collectorVersion));
    const admin=await request('/p/'+p.project.slug+'/admin');assert.doesNotMatch(admin.text,/src="[^"]*(?:brand-settings|fbevents)\.js/);assert.match(admin.text,/PageView（访问）和 DownloadClick/);
    assert.doesNotMatch(admin.text,/尊重浏览器 DNT/);assert.match(admin.text,/不因浏览器 DNT \/ GPC 信号自动停报/);
   }
   assert.doesNotMatch((await request('/')).text,/src="[^"]*(?:brand-settings|fbevents)\.js/);
  }finally{await post(aPath()+'/api/settings',{pixelId:''},ca);await post(bPath()+'/api/settings',{pixelId:''},cb);}
 });
 await t.test('inventory counts and associated projects reflect usage and per-account grants without secrets',async()=>{
  const r=await request('/api/templates',master);assert.equal(r.data.projectCount,2);
  for(const item of r.data.templates){assert.equal(item.usedCount,1);assert.equal(item.allowedCount,2);assert.equal(item.projects.length,2);assert.equal(item.projects.filter(p=>p.using).length,1);assert.ok(item.projects.every(p=>p.allowed));}
  assert.doesNotMatch(r.text,/password|cipher|PRIVATE A|PRIVATE B|download_url|pixel_id/);assert.ok(!r.text.includes(A.credentials.password));
 });
 await t.test('tenant sessions have no access to global catalog or standalone previews',async()=>{
  assert.equal((await request('/api/templates',ca)).status,401);assert.equal((await request(aPath()+'/api/templates',ca)).status,404);
  for(const id of ['feiyue','dptv'])assert.equal((await request('/templates/'+id+'/preview',ca)).status,401);
  assert.doesNotMatch((await request(aPath()+'/admin',ca)).text,/data-view="templates"/);
 });
 await t.test('tenant admin restores the dark standalone view without altering the master',async()=>{
  const rootPage=await request('/');assert.match(rootPage.text,/assets\/console\.css\?v=[a-f0-9]{12}/);assert.doesNotMatch(rootPage.text,/assets\/tenant\./);
  for(const suffix of ['/admin','/admin/']){
   const r=await request(aPath()+suffix);assert.equal(r.status,200);assert.match(r.text,/data-role="customer"/);assert.match(r.text,/id="username"/);assert.match(r.text,/id="password"/);assert.match(r.text,/id="visit-rows"/);assert.match(r.text,/id="pixel-form"/);assert.match(r.text,/id="brand-form"/);assert.match(r.text,/id="settings-form"/);assert.match(r.text,/id="template-preview"/);assert.match(r.text,/id="daily-rows"/);assert.match(r.text,/默认留空/);assert.match(r.text,/Facebook 广告落地页地址（当前项目）/);assert.doesNotMatch(r.text,/Facebook 绑定域名/);assert.equal((r.text.match(/class="metric"/g)||[]).length,7);
   assert.doesNotMatch(r.text,/assets\/console\.|id="create-form"|id="main-nav"|id="verify-form"|id="download-options"/);
   assert.doesNotMatch(r.text,/<iframe[^>]+src=/);assert.ok(!r.text.includes(A.credentials.password));assert.match(r.headers.get('cache-control'),/no-store/);assert.match(r.headers.get('content-security-policy'),/script-src 'self'/);
   for(const ext of ['css','js']){const filename='tenant.'+ext;const expected=createHash('sha256').update(readFileSync(root+'public/assets/'+filename)).digest('hex').slice(0,12);assert.ok(r.text.includes('/assets/'+filename+'?v='+expected));const asset=await request('/assets/'+filename+'?v='+expected);assert.equal(asset.status,200);}
  }
  const css=readFileSync(root+'public/assets/tenant.css','utf8');assert.match(css,/background:#0f1115/);assert.match(css,/max-width:980px/);
 });
 await t.test('customer APIs omit the master-only private note and password hash',async()=>{for(const route of ['/session','/dashboard']){const r=await request(aPath()+'/api'+route,ca);assert.equal(r.status,200);assert.equal(r.data.project.note,undefined);assert.equal(r.data.project.password_hash,undefined);assert.ok(!r.text.includes('PRIVATE A'));}});
 await t.test('tenant session has no access to another tenant or master APIs',async()=>{assert.equal((await request(bPath()+'/api/dashboard',ca)).status,401);assert.equal((await request('/api/projects',ca)).status,401);assert.equal((await request(aPath()+'/api/projects',ca)).status,404);});
 await t.test('tenant cannot elevate role or change the project identity / private note',async()=>{const r=await post(aPath()+'/api/settings',{appName:'Alpha Updated',note:'stolen',name:'renamed',slug:B.project.slug,id:B.project.id,status:'paused',role:'super',downloadUrl:'https://example.com/alpha.apk'},ca);assert.equal(r.status,200,r.text);assert.equal(r.data.project.slug,A.project.slug);assert.equal(r.data.project.name,'客户 A');assert.equal(r.data.project.status,'active');assert.equal(r.data.project.note,undefined);const all=await request('/api/projects/'+A.project.slug,master);assert.equal(all.data.project.note,'PRIVATE A');assert.equal((await request(bPath()+'/api/dashboard',cb)).data.project.download_url,'');});
 await t.test('rejects script URLs, unsupported templates, malicious branding and image data',async()=>{for(const b of [{downloadUrl:'javascript:alert(1)'},{downloadUrl:'https://name:pass@example.com/'},{appName:'<script>alert(1)</script>'},{template:'../app/bootstrap'},{pixelId:'abc'},{logoData:'data:image/svg+xml;base64,PHN2Zz4='}])assert.equal((await post(aPath()+'/api/settings',b,ca)).status,400);});
 await t.test('download redirect is scoped to the selected project',async()=>{const r=await request(aPath()+'/dl');assert.equal(r.status,302);assert.equal(r.headers.get('location'),'https://example.com/alpha.apk');assert.equal((await request(bPath()+'/dl')).status,404);});
 await t.test('customer can clear a saved APK URL without restoring any default',async()=>{assert.equal((await post(bPath()+'/api/settings',{downloadUrl:'https://example.com/customer.apk'},cb)).status,200);assert.equal((await request(bPath()+'/dl')).headers.get('location'),'https://example.com/customer.apk');const cleared=await post(bPath()+'/api/settings',{downloadUrl:''},cb);assert.equal(cleared.status,200);assert.equal(cleared.data.project.download_url,'');assert.equal((await request(bPath()+'/api/dashboard',cb)).data.project.download_url,'');const r=await request(bPath()+'/dl');assert.equal(r.status,404);assert.equal(r.headers.get('location'),null);});
 await t.test('public landing config has a signed project token and no private data',async()=>{const r=await request(aPath());assert.equal(r.status,200);const match=r.text.match(/window\.HUB_PAGE=(.*?);window\.APP_CONFIG/s);token=JSON.parse(match[1]);assert.equal(token.appName,'Alpha Updated');assert.equal(token.downloadUrl,aPath()+'/dl');assert.equal(token.preview,false);assert.equal(token.token.length,64);assert.ok(!r.text.includes('PRIVATE A'));assert.ok(!r.text.includes(A.credentials.password));assert.match(r.headers.get('cache-control'),/no-store/);});
 await t.test('template previews require login, are tenant-scoped and do not issue event tokens',async()=>{assert.equal((await request(aPath()+'/preview/dptv')).status,401);assert.equal((await request(bPath()+'/preview/dptv',ca)).status,401);for(const ctx of [ca,master]){const r=await request(aPath()+'/preview/dptv',ctx);assert.equal(r.status,200);assert.match(r.text,/"preview":true/);assert.match(r.text,/"token":""/);assert.match(r.text,/<base href="\/themes\/dptv\/">/);}assert.equal((await request('/api/projects/'+A.project.slug,master)).data.stats.totals.visits,0);});
 const event=(type,id=type==='view'?token.visitId:randomUUID(),extra={})=>({type,id,visitId:token.visitId,issued:token.issued,token:token.token,elapsed:1000,...extra});
 await t.test('visitor events reject a different project, bad signature, stale token or origin',async()=>{assert.equal((await post(bPath()+'/api/event',event('view'))).status,403);assert.equal((await post(aPath()+'/api/event',event('view',token.visitId,{token:'bad'}))).status,403);assert.equal((await post(aPath()+'/api/event',event('view',token.visitId,{issued:0}))).status,403);assert.equal((await post(aPath()+'/api/event',event('view'),{origin:'https://other.example'})).status,403);});
 await t.test('view and download events are idempotent; elapsed time is bounded',async()=>{const v=event('view'),d=event('download');for(const b of [v,v,d,d,event('stay',randomUUID(),{elapsed:99999999})])assert.equal((await post(aPath()+'/api/event',b,{headers:{'CF-Connecting-IP':'8.8.8.8','CF-IPCountry':'US'}})).status,200);const r=await request(aPath()+'/api/dashboard',ca);assert.equal(r.data.stats.totals.visits,1);assert.equal(r.data.stats.totals.downloads,1);assert.equal(r.data.stats.totals.conversions,1);assert.equal(r.data.stats.totals.conversion_rate,100);assert.ok(r.data.stats.totals.avg_duration<60000);assert.equal(r.data.stats.daily.length,7);});
 await t.test('untrusted connecting-IP headers are ignored on direct requests',async()=>{const r=await request(aPath()+'/api/dashboard',ca);assert.equal(r.data.stats.visits[0].ip_address,'127.0.0.1');assert.notEqual(r.data.stats.visits[0].country,'US');});
 await t.test('stats remain isolated, with 30-day range and safe pagination',async()=>{const r=await request(bPath()+'/api/dashboard?days=30&page=-10',cb);assert.equal(r.data.stats.totals.visits,0);assert.equal(r.data.stats.daily.length,30);assert.equal(r.data.stats.page,1);const rootStats=await request('/api/projects',master);assert.equal(rootStats.data.totals.visits,1);});
 await t.test('device breakdown covers the selected period, not just one page or another project',async()=>{
  execFileSync('php',['-r','require "app/bootstrap.php"; $id=(int)$argv[1]; for($i=0;$i<30;$i++){query("INSERT INTO visits(project_id,id,started_at,ip_address,country,region,city,device,os,browser) VALUES(?,?,?,?,?,?,?,?,?,?)",[$id,"device-fixture-".$i,now_ms(),"192.0.2.1","US","","",$i<26?"mobile":"desktop","FixtureOS","FixtureBrowser"]);} query("INSERT INTO visits(project_id,id,started_at,ip_address,country,region,city,device,os,browser) VALUES(?,?,?,?,?,?,?,?,?,?)",[$id,"device-fixture-old",now_ms()-31*86400000,"192.0.2.2","US","","","tablet","FixtureOS","FixtureBrowser"]);',String(B.project.id)],{cwd:root,env});
  try{const r=await request(bPath()+'/api/dashboard?days=7&page=1',cb);assert.equal(r.data.stats.visits.length,25);assert.equal(r.data.stats.pages,2);assert.equal(r.data.stats.total,30);assert.deepEqual(r.data.stats.devices,[{device:'mobile',count:26},{device:'desktop',count:4}]);const next=await request(bPath()+'/api/dashboard?days=7&page=2',cb);assert.equal(next.data.stats.visits.length,5);assert.deepEqual(next.data.stats.devices,r.data.stats.devices);const other=await request(aPath()+'/api/dashboard',ca);assert.equal(other.data.stats.total,1);assert.equal(other.data.stats.devices.reduce((sum,d)=>sum+Number(d.count),0),1);}
  finally{execFileSync('php',['-r','require "app/bootstrap.php"; query("DELETE FROM visits WHERE project_id=? AND id LIKE ?",[(int)$argv[1],"device-fixture-%"]);',String(B.project.id)],{cwd:root,env});}
 });
 await t.test('master can retrieve complete delivery credentials after the initial creation response',async()=>{
  for(const p of [A,B]){const r=await post('/api/projects/'+p.project.slug+'/credentials',{},master);assert.equal(r.status,200,r.text);assert.equal(r.data.available,true);assert.equal(r.data.credentials.password,p.credentials.password);assert.equal(r.data.credentials.username,p.credentials.username);assert.equal(r.data.credentials.adminUrl,p.credentials.adminUrl);assert.equal(r.data.credentials.landingUrl,p.credentials.landingUrl);assert.match(r.headers.get('cache-control'),/no-store/);}
 });
 await t.test('delivery secrets are encrypted at rest and stripped from normal APIs',async()=>{
  const rows=JSON.parse(execFileSync('php',['-r','require "app/bootstrap.php"; echo json_encode(query("SELECT * FROM projects")->fetchAll());'],{cwd:root,env,encoding:'utf8'}));
  for(const p of [A,B]){const row=rows.find(r=>r.slug===p.project.slug);assert.match(row.password_cipher,/^v1:/);assert.notEqual(row.password_hash,p.credentials.password);assert.ok(!JSON.stringify(rows).includes(p.credentials.password));for(const ctx of [{path:'/api/projects/'+p.project.slug,auth:master},{path:'/p/'+p.project.slug+'/api/session',auth:p===A?ca:cb}]){const r=await request(ctx.path,ctx.auth);assert.ok(!r.text.includes(p.credentials.password));assert.doesNotMatch(r.text,/password_cipher|password_hash/);}}
  assert.equal(statSync(join(runtime,'credentials.key')).mode&0o777,0o600);
  assert.notEqual(readFileSync(join(runtime,'credentials.key'),'utf8').trim(),readFileSync(join(runtime,'secret.key'),'utf8').trim());
 });
 await t.test('viewing credentials requires master login, POST, CSRF and same origin',async()=>{
  const path='/api/projects/'+A.project.slug+'/credentials';assert.equal((await post(path,{})).status,401);assert.equal((await post(path,{},ca)).status,401);assert.equal((await request(path,master)).status,404);assert.equal((await post(path,{}, {cookie:master.cookie})).status,403);assert.equal((await post(path,{}, {...master,origin:'https://other.example'})).status,403);assert.equal((await post(aPath()+'/api/projects/'+A.project.slug+'/credentials',{},ca)).status,404);
 });
 await t.test('legacy hashes stay valid and viewing a legacy account does not reset its password',async()=>{
  const original=execFileSync('php',['-r','require "app/bootstrap.php"; $p=project($argv[1]); echo $p["password_cipher"]; query("UPDATE projects SET password_cipher=? WHERE id=?",["",$p["id"]]);',A.project.slug],{cwd:root,env,encoding:'utf8'});
  try{const r=await post('/api/projects/'+A.project.slug+'/credentials',{},master);assert.equal(r.status,200);assert.equal(r.data.available,false);assert.equal(r.data.credentials.password,null);assert.equal(r.data.credentials.username,A.credentials.username);ca=await signIn(aPath()+'/api/login',A.credentials.username,A.credentials.password);}
  finally{execFileSync('php',['-r','require "app/bootstrap.php"; query("UPDATE projects SET password_cipher=? WHERE slug=?",[$argv[2],$argv[1]]);',A.project.slug,original],{cwd:root,env});}
 });
 await t.test('swapped or altered ciphertext is rejected rather than exposing a different account password',async()=>{
  const originals=JSON.parse(execFileSync('php',['-r','require "app/bootstrap.php"; echo json_encode([project($argv[1])["password_cipher"],project($argv[2])["password_cipher"]]);',A.project.slug,B.project.slug],{cwd:root,env,encoding:'utf8'}));
  try{execFileSync('php',['-r','require "app/bootstrap.php"; query("UPDATE projects SET password_cipher=? WHERE slug=?",[$argv[2],$argv[1]]);',B.project.slug,originals[0]],{cwd:root,env});const r=await post('/api/projects/'+B.project.slug+'/credentials',{},master);assert.equal(r.status,409);assert.ok(!r.text.includes(A.credentials.password));}
  finally{execFileSync('php',['-r','require "app/bootstrap.php"; query("UPDATE projects SET password_cipher=? WHERE slug=?",[$argv[2],$argv[1]]);',B.project.slug,originals[1]],{cwd:root,env});}
 });
 await t.test('missing credential key fails clearly and is never silently regenerated',async()=>{
  const key=join(runtime,'credentials.key');renameSync(key,key+'.backup');
  try{assert.equal((await post('/api/projects/'+A.project.slug+'/credentials',{},master)).status,503);const failed=await post('/api/projects',{name:'missing-key-project'},master);assert.equal(failed.status,503);assert.equal((await request('/api/projects',master)).data.projects.length,2);assert.throws(()=>statSync(key));}
  finally{renameSync(key+'.backup',key);}
 });
 await t.test('all templates are open by default, and master permissions persist per account',async()=>{
  for(const [path,ctx] of [[aPath(),ca],[bPath(),cb]])assert.deepEqual((await request(path+'/api/dashboard',ctx)).data.project.allowedTemplates,['feiyue','dptv']);
  const r=await post('/api/projects/'+A.project.slug,{allowedTemplates:['dptv']},master);assert.equal(r.status,200,r.text);assert.deepEqual(r.data.project.allowedTemplates,['dptv']);assert.equal(r.data.project.template,'dptv');assert.deepEqual((await request(aPath()+'/api/dashboard',ca)).data.project.allowedTemplates,['dptv']);assert.deepEqual((await request(bPath()+'/api/dashboard',cb)).data.project.allowedTemplates,['feiyue','dptv']);
 });
 await t.test('tenant cannot preview or select ungranted templates or expand template permissions',async()=>{
  const catalog=(await request('/api/templates',master)).data.templates;
  assert.equal(catalog.find(t=>t.id==='dptv').usedCount,2);assert.equal(catalog.find(t=>t.id==='feiyue').usedCount,0);assert.equal(catalog.find(t=>t.id==='feiyue').allowedCount,1);assert.ok(!catalog.find(t=>t.id==='feiyue').projects.some(p=>p.slug===A.project.slug));
  assert.equal((await request(aPath()+'/preview/feiyue',ca)).status,403);assert.equal((await request(aPath()+'/preview/dptv',ca)).status,200);assert.equal((await request(aPath()+'/preview/feiyue',master)).status,200);
  for(const b of [{template:'feiyue'},{allowedTemplates:['feiyue','dptv']}])assert.equal((await post(aPath()+'/api/settings',b,ca)).status,403);
  assert.equal((await request(aPath()+'/api/dashboard',ca)).data.project.template,'dptv');assert.equal((await request(aPath()+'/api/dashboard',ca)).data.stats.total,1);
 });
 await t.test('template permission validation is atomic and rejects empty/unknown lists',async()=>{
  for(const allowedTemplates of [[],['missing'],['feiyue','../app'],null,'feiyue']){const r=await post('/api/projects/'+A.project.slug,{allowedTemplates,appName:'Must Not Be Saved'},master);assert.equal(r.status,400);}
  assert.equal((await request(aPath()+'/api/dashboard',ca)).data.project.app_name,'Alpha Updated');
  const mismatch=await post('/api/projects/'+A.project.slug,{allowedTemplates:['dptv'],template:'feiyue'},master);assert.equal(mismatch.status,403);
  await post('/api/projects/'+A.project.slug,{allowedTemplates:['feiyue','dptv']},master);assert.equal((await post(aPath()+'/api/settings',{template:'feiyue'},ca)).status,200);assert.equal((await request(aPath()+'/preview/feiyue',ca)).status,200);
 });
 await t.test('creation supports selected template grants and rejects inconsistent initial choices',async()=>{
  const r=await post('/api/projects',{name:'Invalid grants',template:'feiyue',allowedTemplates:['dptv']},master);assert.equal(r.status,400);assert.equal((await request('/api/projects',master)).data.projects.length,2);
 });
 await t.test('customer cannot pause or reset any project',async()=>{for(const suffix of ['/status','/password'])assert.equal((await post(aPath()+'/api/projects/'+A.project.slug+suffix,{status:'paused'},ca)).status,404);});
 await t.test('master pause disables public pages, downloads, analytics and tenant sessions',async()=>{assert.equal((await post('/api/projects/'+A.project.slug+'/status',{status:'paused'},master)).status,200);for(const path of [aPath(),aPath()+'/admin',aPath()+'/dl',aPath()+'/api/dashboard'])assert.equal((await request(path,ca)).status,403);assert.equal((await post(aPath()+'/api/event',event('stay'))).status,403);assert.equal((await request(bPath())).status,200);});
 await t.test('template inventory includes paused projects and preview leaves account settings untouched',async()=>{
  const before=(await request('/api/projects/'+A.project.slug,master)).data;
  const catalog=(await request('/api/templates',master)).data.templates;assert.ok(catalog.every(t=>t.projects.some(p=>p.slug===A.project.slug&&p.status==='paused')));
  assert.equal((await request('/templates/dptv/preview',master)).status,200);
  const after=(await request('/api/projects/'+A.project.slug,master)).data;assert.deepEqual(after.project,before.project);assert.deepEqual(after.stats.totals,before.stats.totals);
 });
 await t.test('resume retains data and requires a fresh customer login',async()=>{assert.equal((await post('/api/projects/'+A.project.slug+'/status',{status:'active'},master)).status,200);assert.equal((await request(aPath())).status,200);assert.equal((await request(aPath()+'/api/dashboard',ca)).status,401);ca=await signIn(aPath()+'/api/login',A.credentials.username,A.credentials.password);assert.equal((await request(aPath()+'/api/dashboard',ca)).data.stats.totals.visits,1);});
 await t.test('password reset upgrades a legacy hash to viewable credentials and revokes old sessions',async()=>{execFileSync('php',['-r','require "app/bootstrap.php"; query("UPDATE projects SET password_cipher=? WHERE slug=?",["",$argv[1]]);',A.project.slug],{cwd:root,env});const r=await post('/api/projects/'+A.project.slug+'/password',{},master);assert.equal(r.status,200);assert.notEqual(r.data.credentials.password,A.credentials.password);assert.equal(r.data.credentials.username,A.credentials.username);assert.match(r.data.credentials.password,/^[A-Za-z2-9]{10}$/);const shown=await post('/api/projects/'+A.project.slug+'/credentials',{},master);assert.equal(shown.data.credentials.password,r.data.credentials.password);assert.equal((await request(aPath()+'/api/dashboard',ca)).status,401);assert.equal((await post(aPath()+'/api/login',A.credentials)).status,401);ca=await signIn(aPath()+'/api/login',r.data.credentials.username,r.data.credentials.password);});
 await t.test('audit trail includes management actions but no credentials',async()=>{const r=await request('/api/audit',master);for(const action of ['创建项目','更新项目配置','暂停项目','恢复项目','重置客户密码'])assert.ok(r.data.rows.some(row=>row.action===action));assert.ok(!r.text.includes(password));assert.ok(!r.text.includes(A.credentials.password));assert.doesNotMatch(r.text,/password_hash/);});
 await t.test('private filesystem files and traversal attempts are not served',async()=>{for(const path of ['/runtime/hub.sqlite','/runtime/credentials.key','/runtime/secret.key','/runtime/初始账号.txt','/app/bootstrap.php','/bin/setup.php','/.env','/%2e%2e%2fapp/bootstrap.php','/themes/feiyue/%2e%2e%2f%2e%2e%2f%2e%2e%2fapp/bootstrap.php'])assert.equal((await request(path)).status,404,path);});
 await t.test('local theme assets referenced by HTML exist',async()=>{for(const theme of ['feiyue','dptv']){const html=readFileSync(root+`resources/pages/${theme}.html`,'utf8');const refs=[...html.matchAll(/(?:src|href)=["']([^"']+)["']/g)].map(m=>m[1]).filter(s=>!s.startsWith('http')&&!s.startsWith('//')&&!s.startsWith('#')&&!s.startsWith('data:')&&!s.startsWith('javascript:')&&!s.startsWith('mailto:')&&!s.endsWith('.html')&&!s.endsWith('.apk')&&!/(?:config|site-settings|brand-settings|analytics)\.js/.test(s));for(const ref of [...new Set(refs)]){const path=new URL(ref,base+`/themes/${theme}/`).pathname;if(/\.(css|js|png|jpg|jpeg|svg|webp|ico|avif)$/i.test(path))assert.equal((await request(path)).status,200,path);}}});
 await t.test('logout invalidates the session',async()=>{assert.equal((await post(aPath()+'/api/logout',{},ca)).status,200);assert.equal((await request(aPath()+'/api/dashboard',ca)).status,401);});
 await t.test('backup CLI creates a consistent database snapshot outside public',()=>{const text=execFileSync('php',['bin/backup.php','--output='+runtime+'/backups'],{cwd:root,env,encoding:'utf8'});const file=text.match(/数据库备份：(.*)/)[1];const result=execFileSync('php',['-r','$db=new PDO("sqlite:".$argv[1]); echo $db->query("SELECT COUNT(*) FROM projects")->fetchColumn();',file],{encoding:'utf8'});assert.equal(result,'2');});
 await t.test('initialization preserves existing accounts on repeated runs',()=>{assert.throws(()=>execFileSync('php',['bin/setup.php'],{cwd:root,env,stdio:'pipe'}),e=>e.status===1);});
 await t.test('master recovery CLI rotates credentials and revokes existing sessions',async()=>{const text=execFileSync('php',['bin/admin-password.php','--username=fixture'],{cwd:root,env,encoding:'utf8'});const next=text.match(/新密码：(.*)/)[1];assert.equal(next.length,24);assert.notEqual(next,password);assert.equal((await request('/api/projects',master)).status,401);master=await signIn('/api/login','fixture',next);assert.equal((await post('/api/login',{username:'fixture',password})).status,401);});
 await t.test('login requests are rate-limited',async()=>{let status;for(let i=0;i<16;i++)status=(await post('/api/login',{username:'fixture',password:'invalid'})).status;assert.equal(status,429);});
 await t.test('server log contains no PHP warnings or fatal errors',()=>assert.doesNotMatch(log,/PHP (?:Warning|Fatal error)|Landing Hub:/));
});

test('default setup uses mtx / mtx123 and stores a password hash',()=>{
 const dir=mkdtempSync(join(tmpdir(),'hub-default-'));
 try {
  const env={...process.env,HUB_DATA_DIR:dir};
  execFileSync('php',['bin/setup.php'],{cwd:root,env,stdio:'pipe'});
  const result=execFileSync('php',['-r','require "app/bootstrap.php"; $a=query("SELECT * FROM admins")->fetch(); echo json_encode(["username"=>$a["username"],"valid"=>password_verify("mtx123",$a["password_hash"]),"hashed"=>$a["password_hash"]!=="mtx123","count"=>(int)query("SELECT COUNT(*) FROM admins")->fetchColumn()]);'],{cwd:root,env,encoding:'utf8'});
  assert.deepEqual(JSON.parse(result),{username:'mtx',valid:true,hashed:true,count:1});
 }finally{rmSync(dir,{recursive:true,force:true});}
});

test('random-password initialization overrides the built-in password',()=>{
 const dir=mkdtempSync(join(tmpdir(),'hub-random-'));
 try {
  execFileSync('php',['bin/setup.php','--random-password'],{cwd:root,env:{...process.env,HUB_DATA_DIR:dir},stdio:'pipe'});
  const text=readFileSync(join(dir,'初始账号.txt'),'utf8');
  assert.match(text,/总管理员账号：mtx/);
  const password=text.match(/总管理员密码：(.*)/)[1];
  assert.equal(password.length,24);assert.notEqual(password,'mtx123');
 }finally{rmSync(dir,{recursive:true,force:true});}
});


test('legacy database migration preserves the existing account and starts with both templates open',()=>{
 const dir=mkdtempSync(join(tmpdir(),'hub-migration-'));const env={...process.env,HUB_DATA_DIR:dir,HUB_DEV:'1'};
 try{
  const before=JSON.parse(execFileSync('php',['-r','require "app/bootstrap.php"; $_SERVER["HTTP_HOST"]="127.0.0.1:57600"; $r=create_project(["name"=>"Legacy schema","template"=>"dptv"],"fixture"); echo json_encode(["created"=>$r,"hash"=>project($r["project"]["slug"])["password_hash"]]); db()->exec("ALTER TABLE projects DROP COLUMN password_cipher"); db()->exec("ALTER TABLE projects DROP COLUMN allowed_templates");'],{cwd:root,env,encoding:'utf8'}));
  const after=JSON.parse(execFileSync('php',['-r','require "app/bootstrap.php"; $p=project($argv[1]); echo json_encode(["account"=>$p,"valid"=>password_verify($argv[2],$p["password_hash"]),"templates"=>project_templates($p),"credentials"=>open_customer_password($p)]);',before.created.project.slug,before.created.credentials.password],{cwd:root,env,encoding:'utf8'}));
  assert.equal(after.valid,true);assert.equal(after.account.password_hash,before.hash);assert.equal(after.account.username,before.created.credentials.username);assert.equal(after.account.template,'dptv');assert.equal(after.account.password_cipher,'');assert.equal(after.credentials,null);assert.deepEqual(after.templates,['feiyue','dptv']);
  const next=JSON.parse(execFileSync('php',['-r','require "app/bootstrap.php"; $_SERVER["HTTP_HOST"]="127.0.0.1:57600"; echo json_encode(create_project(["name"=>"Restricted new","allowedTemplates"=>["dptv"]],"fixture"));'],{cwd:root,env,encoding:'utf8'}));assert.deepEqual(next.project.allowedTemplates,['dptv']);assert.equal(next.project.template,'dptv');assert.equal(next.project.credentialsAvailable,true);
 }finally{rmSync(dir,{recursive:true,force:true});}
});

test('one-click delivery text contains both project URLs, account and password in separate lines',()=>{
 const source=readFileSync(root+'public/assets/console.js','utf8');
 const fn=source.match(/function credentialText\(c\)\{return (`[^`]*`);\}/);
 assert.ok(fn,'delivery formatter is present');
 const format=Function('c','return '+fn[1]);
 assert.equal(format({landingUrl:'https://example.test/p/123456789',adminUrl:'https://example.test/p/123456789/admin',username:'lp12345678',password:'Fixture-random-password!'}),'落地页：https://example.test/p/123456789\n客户后台：https://example.test/p/123456789/admin\n账号：lp12345678\n密码：Fixture-random-password!');
});

test('Pixel input belongs to the tenant console, not the master console',()=>{
 const master=readFileSync(root+'public/assets/console.js','utf8');
 assert.doesNotMatch(master,/pixel-form|name="pixelId"|<h2>Facebook Pixel<\/h2>/);
 const tenant=readFileSync(root+'app/tenant.html','utf8');
 assert.match(tenant,/id="pixel-form"/);assert.match(tenant,/id="pixel-id"/);
 assert.match(readFileSync(root+'public/assets/tenant.js','utf8'),/post\(\{ pixelId:/);
});
