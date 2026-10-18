import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync,rmSync,existsSync} from 'node:fs';
import {spawn,execFileSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';
import net from 'node:net';
const root=fileURLToPath(new URL('../',import.meta.url));
const page=readFileSync(root+'resources/pages/lumama.html','utf8');
const script=readFileSync(root+'public/themes/lumama/lumama.js','utf8');
const brand=readFileSync(root+'public/assets/brand-settings.js','utf8');
test('Lumama Spanish layout, hotlinked media, branding and only two real downloads',()=>{
 assert.match(page,/<html lang="es-MX">/);
 const consolePage=readFileSync(root+'app/console.html','utf8'),tenantPage=readFileSync(root+'app/tenant.html','utf8');
 assert.equal([...consolePage.matchAll(/name="allowedTemplates" value="([^"]+)"/g)][1][1],'lumama');
 assert.equal([...tenantPage.matchAll(/data-template="([^"]+)"/g)][1][1],'lumama');
 assert.match(readFileSync(root+'public/assets/console.js','utf8'),/const templateLabels=\{miradoview:'MiradoView',lumama:/);
 assert.doesNotMatch(page+script,/__LANDING_RUNTIME__|fbq\(|fbevents|landing-bind-session|public-manifest|intent:\/\/|\.apk|atob/);
 assert.equal((page.match(/download-link/g)||[]).length,2);
 assert.equal((page.match(/data-prompt-download/g)||[]).length,34);
 assert.equal((page.match(/<img[^>]+https:\/\/lumamatvapp\.com\/landing-assets\//g)||[]).length,34);
 assert.match(page,/data-hub-wordmark/);assert.equal((page.match(/data-hub-name/g)||[]).length,3);
 assert.equal((page.match(/data-hub-logo/g)||[]).length,4);
 assert.match(script,/scrollIntoView/);assert.doesNotMatch(script,/fetch\(|sendBeacon|location\.(?:assign|href)|fbq/);
 assert.match(readFileSync(root+'public/themes/lumama/theme.css','utf8'),/https:\/\/lumamatvapp\.com\/landing-assets\/promo_52d9d53b8618b61a\.jpg/);
 assert.match(readFileSync(root+'app/console.html','utf8'),/name="allowedTemplates" value="lumama"/);
 assert.match(readFileSync(root+'app/tenant.html','utf8'),/data-template="lumama" hidden/);
 for(const f of ['theme.css','lumama.js','logo.svg'])assert.ok(existsSync(root+'public/themes/lumama/'+f));
});

// Runs the real rendered page's shared Pixel wiring with an SDK double: no external calls.
function pixel(html,{paused=false,signals={}}={}){
 const config=JSON.parse(html.match(/window\.HUB_PAGE=(.*?);window\.APP_CONFIG/s)[1]);
 const calls=[],scripts=[],listeners={};let ready;
 const links=[...html.matchAll(/<a\b[^>]+class="[^"]*download-link[^>]*>/g)].map(()=>({disabled:false,getAttribute:()=>null}));
 const document={querySelectorAll:()=>[],head:{append:s=>scripts.push(s)},createElement:()=>({}),addEventListener:(name,fn)=>{(listeners[name]??=[]).push(fn);}};
 const window={HUB_TRACKING_CONSENT:paused?false:undefined,TV_PREVIEW:config.preview,TV_SETTINGS_READY:{then:fn=>ready=fn},fbq:(...args)=>calls.push(args),addEventListener:(name,fn)=>{window[name]=fn;}};
 vm.runInNewContext(brand,{window,document,navigator:signals});ready(config);window['tv:settings']({detail:config});
 return {config,calls,scripts,click(index){const target={closest:s=>s==='.download-link'?links[index]:null};for(const fn of listeners.click||[])fn({button:0,target});}};
}

test('Lumama isolated HTTP integration: registration, grants, preview, branding, download and Pixel',async t=>{
 const data=mkdtempSync(join(tmpdir(),'hub-lumama-test-')),env={...process.env,HUB_DATA_DIR:data,HUB_DEV:'1'};
 // Disposable local fixture credentials never enter production data.
 execFileSync('php',['bin/setup.php','--username=fixture','--password=Fixture-Lumama-Only!'],{cwd:root,env,stdio:'pipe'});
 const port=await new Promise(resolve=>{const s=net.createServer();s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>resolve(p));});});
 const base='http://127.0.0.1:'+port,child=spawn('php',['-S','127.0.0.1:'+port,'-t','public','router.php'],{cwd:root,env,stdio:['ignore','ignore','pipe']});let log='';child.stderr.on('data',b=>log+=b);
 t.after(async()=>{child.kill();await new Promise(r=>child.once('exit',r));rmSync(data,{recursive:true,force:true});});
 for(let i=0;i<60;i++){try{await fetch(base);break;}catch{await new Promise(r=>setTimeout(r,30));}}
 async function request(path,ctx={},body){const response=await fetch(base+path,{method:body===undefined?'GET':'POST',redirect:'manual',headers:{Origin:base,...(ctx.cookie?{Cookie:ctx.cookie}:{}),...(ctx.csrf?{'X-CSRF-Token':ctx.csrf}:{}),...(body===undefined?{}:{'Content-Type':'application/json'})},body:body===undefined?undefined:JSON.stringify(body)});const text=await response.text();let json;try{json=JSON.parse(text);}catch{}return {status:response.status,text,json,headers:response.headers,cookie:response.headers.get('set-cookie')?.split(';')[0]||ctx.cookie};}
 const session=await request('/api/login',{}, {username:'fixture',password:'Fixture-Lumama-Only!'});assert.equal(session.status,200);const master={cookie:session.cookie,csrf:session.json.csrf};
 const inventory=await request('/api/templates',master);assert.equal(inventory.json.projectCount,0);assert.equal(inventory.json.templates[0].id,'miradoview');assert.equal(inventory.json.templates.find(x=>x.id==='lumama').allowedCount,0);
 assert.equal((await request('/templates/lumama/preview')).status,401);
 const global=await request('/templates/lumama/preview',master);assert.equal(global.status,200);assert.equal(pixel(global.text).config.appName,'LumamaTV');assert.equal(pixel(global.text).config.token,'');assert.deepEqual(pixel(global.text).calls,[]);
 const a=await request('/api/projects',master,{name:'Lumama isolated account',allowedTemplates:['feiyue','lumama'],template:'lumama'});assert.equal(a.status,200);const slug=a.json.project.slug,path='/p/'+slug;assert.equal(a.json.project.app_name,'');assert.equal(a.json.project.pixel_id,'');assert.equal(a.json.project.download_url,'');
 const b=await request('/api/projects',master,{name:'Legacy grant account'});assert.deepEqual(b.json.project.allowedTemplates,['feiyue']);const before=b.json.project;
 const login=await request(path+'/api/login',{},a.json.credentials);assert.equal(login.status,200);const customer={cookie:login.cookie,csrf:login.json.csrf};
 const bLogin=await request('/p/'+b.json.project.slug+'/api/login',{},b.json.credentials),other={cookie:bLogin.cookie,csrf:bLogin.json.csrf};
 assert.equal((await request('/p/'+b.json.project.slug+'/preview/lumama',other)).status,403);
 assert.equal((await request('/p/'+b.json.project.slug+'/api/settings',other,{template:'lumama'})).status,403);
 assert.equal((await request(path+'/preview/missing',customer)).status,404);
 assert.equal((await request(path+'/dl')).status,404);
 let actual=await request(path);assert.deepEqual(pixel(actual.text).calls,[]);assert.equal(pixel(actual.text).config.downloadUrl,path+'/dl');
 await request(path+'/api/settings',customer,{pixelId:'1000000000000001'});actual=await request(path);
 assert.equal((actual.text.match(/src="\/assets\/brand-settings\.js/g)||[]).length,1);assert.equal((actual.text.match(/src="\/assets\/collector\.js/g)||[]).length,1);
 for(const signals of [{},{doNotTrack:'1'},{globalPrivacyControl:true},{doNotTrack:'1',globalPrivacyControl:true}]){
  const f=pixel(actual.text,{signals});assert.deepEqual(f.calls,[['init','1000000000000001'],['track','PageView']]);f.click(0);f.click(1);assert.equal(f.calls.filter(x=>x[1]==='DownloadClick').length,2);assert.equal(f.scripts.length,0);
 }
 assert.deepEqual(pixel(actual.text,{paused:true}).calls,[]);
 assert.deepEqual(pixel(actual.text.replace('\"pixelId\":\"1000000000000001\"','\"pixelId\":\"invalid\"')).calls,[]);
 const preview=await request(path+'/preview/lumama',customer);assert.equal(preview.status,200);assert.equal(pixel(preview.text).config.pixelId,'1000000000000001');assert.equal(pixel(preview.text).config.token,'');assert.deepEqual(pixel(preview.text).calls,[]);
 const logo='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jY5kAAAAASUVORK5CYII=';
 for(const [appName,logoData] of [['',''],['Custom Lumama',''],['',logo],['Custom Lumama',logo]]){
  assert.equal((await request(path+'/api/settings',customer,{appName,logoData})).status,200);
  const c=pixel((await request(path)).text).config;assert.equal(c.appName,appName||'LumamaTV');assert.equal(c.logoData,logoData);
 }
 await request(path+'/api/settings',customer,{appName:'',logoData:'',downloadUrl:'https://example.com/lumama-fixture.apk'});
 const dl=await request(path+'/dl');assert.equal(dl.status,302);assert.equal(dl.headers.get('location'),'https://example.com/lumama-fixture.apk');
 assert.deepEqual((await request('/api/projects/'+before.slug,master)).json.project,before);
 const totals=(await request(path+'/api/dashboard',customer)).json.stats.totals;assert.equal(totals.visits,0);
 const cfg=pixel((await request(path)).text).config;
 assert.equal((await request(path+'/api/event',{}, {type:'view',id:cfg.visitId,visitId:cfg.visitId,issued:cfg.issued,token:cfg.token,elapsed:0})).status,200);
 const next=(await request(path+'/api/dashboard',customer)).json.stats.totals;assert.equal(next.visits,1);
 const eventBody={type:'download',id:'11111111111111111111111111111111',visitId:cfg.visitId,issued:cfg.issued,token:cfg.token,elapsed:100};
 assert.equal((await request(path+'/api/event',{},eventBody)).status,200);
 assert.equal((await request(path+'/api/event',{},eventBody)).status,200);
 assert.equal((await request(path+'/api/dashboard',customer)).json.stats.totals.conversions,1);

 await request('/api/projects/'+slug,master,{allowedTemplates:['feiyue']});assert.equal((await request(path+'/preview/lumama',customer)).status,403);assert.equal((await request(path+'/api/settings',customer,{template:'lumama'})).status,403);
 for(const f of ['theme.css','lumama.js','logo.svg'])assert.equal((await request('/themes/lumama/'+f)).status,200,f);
 assert.doesNotMatch((await request('/')).text,/brand-settings\.js/);assert.doesNotMatch((await request(path+'/admin')).text,/brand-settings\.js/);assert.doesNotMatch(log,/PHP (Warning|Fatal)|Landing Hub:/);
});
