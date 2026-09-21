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
const page=readFileSync(root+'resources/pages/aivideo.html','utf8');
const script=readFileSync(root+'public/themes/aivideo/aivideo.js','utf8');
const brand=readFileSync(root+'public/assets/brand-settings.js','utf8');
const i18n={window:{}};vm.runInNewContext(readFileSync(root+'public/themes/aivideo/i18n.js','utf8'),i18n);
const dictionaries=i18n.window.AIVIDEO_I18N;

test('AI Video page-surface action uses a real tracked link, not a separate fake event',()=>{
 const start=script.indexOf(" document.addEventListener('click',event=>{");
 const end=script.indexOf(" $('#close-modal')",start);
 let handler,downloads=0;
 const config={preview:false},window={TV_PREVIEW:false,getSelection:()=>({toString:()=>''})};
 vm.runInNewContext(script.slice(start,end),{config,window,document:{addEventListener:(_,fn)=>handler=fn},$:selector=>{assert.equal(selector,'#page-download');return {click:()=>downloads++};}});
 const click=(overrides={})=>{let prevented=false;handler({button:0,target:{closest:()=>null},preventDefault(){prevented=true;},...overrides});return prevented;};
 assert.equal(click(),true);assert.equal(downloads,1);
 for(const tag of ['a','button','input','select','textarea','label','summary','video','dialog']){
  assert.equal(click({target:{closest:selector=>{assert.ok(selector.split(',').includes(tag));return {};}}}),false);
 }
 for(const props of [{button:1},{defaultPrevented:true},{ctrlKey:true},{metaKey:true},{altKey:true},{shiftKey:true},{target:null}])assert.equal(click(props),false);
 config.preview=true;assert.equal(click(),false);config.preview=false;
 window.TV_PREVIEW=true;assert.equal(click(),false);window.TV_PREVIEW=false;
 window.getSelection=()=>({toString:()=> 'selected text'});assert.equal(click(),false);
 assert.equal(downloads,1,'controls, previews and text selection do not open downloads');
 assert.match(page,/<a id="page-download" class="download-link"[^>]*target="_blank"/);
});

test('AI Video has complete AR/EN/ZH/ES/PT interface dictionaries and local assets',()=>{
 assert.deepEqual(Object.keys(dictionaries),['ar','en','zh','es','pt']);
 const keys=Object.keys(dictionaries.es).sort();
 for(const [locale,dict] of Object.entries(dictionaries)){
  assert.deepEqual(Object.keys(dict).sort(),keys,locale);
  for(const value of Object.values(dict))assert.ok(typeof value==='string'&&value.trim(),locale);
  for(const match of page.matchAll(/data-i18n(?:-aria|-alt)?="([^"]+)"/g))assert.ok(dict[match[1]],locale+': '+match[1]);
 }
 for(const match of page.matchAll(/(?:src|href)="([^"#]+)"/g))assert.ok(existsSync(root+'public/themes/aivideo/'+match[1].split('?')[0]),match[1]);
 assert.ok(existsSync(root+'public/themes/aivideo/teaser.mp4'));
 assert.ok(readFileSync(root+'public/themes/aivideo/teaser.mp4').length>1000000);
 assert.equal((page.match(/class="[^"]*download-link/g)||[]).length,4);
 assert.equal((page.match(/data-hub-logo/g)||[]).length,4);assert.match(page,/data-hub-name/);
 assert.doesNotMatch(page+script,/(?:src|href)="https?:\/\/|fbq\(|fbevents|\.apk|location\.(?:replace|assign)|onclick=/);
 assert.match(script,/hub:aivideo:language:/);assert.match(script,/history\.replaceState/);
 assert.match(script,/showModal\(\)/);assert.match(script,/lang==='ar'\?'rtl':'ltr'/);
 assert.doesNotMatch(page+script,/<\?php|Lead|APK_URL|conversionTracked|data:video\//);
 assert.match(script,/document\.addEventListener\('click'/);
 assert.match(script,/\$\('#page-download'\)\.click\(\)/);
 assert.match(script,/a,button,input,select,textarea,label,summary,video,dialog/);
 assert.match(script,/if\(!config.preview&&!window.TV_PREVIEW\)/);
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

test('AI Video isolated HTTP integration: registration, grants, preview, branding, download and Pixel',async t=>{
 const data=mkdtempSync(join(tmpdir(),'hub-aivideo-test-')),env={...process.env,HUB_DATA_DIR:data,HUB_DEV:'1'};
 // Disposable local fixture credentials never enter production data.
 execFileSync('php',['bin/setup.php','--username=fixture','--password=Fixture-AI Video-Only!'],{cwd:root,env,stdio:'pipe'});
 const port=await new Promise(resolve=>{const s=net.createServer();s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>resolve(p));});});
 const base='http://127.0.0.1:'+port,child=spawn('php',['-S','127.0.0.1:'+port,'-t','public','router.php'],{cwd:root,env,stdio:['ignore','ignore','pipe']});let log='';child.stderr.on('data',b=>log+=b);
 t.after(async()=>{child.kill();await new Promise(r=>child.once('exit',r));rmSync(data,{recursive:true,force:true});});
 for(let i=0;i<60;i++){try{await fetch(base);break;}catch{await new Promise(r=>setTimeout(r,30));}}
 async function reaivideo(path,ctx={},body){const response=await fetch(base+path,{method:body===undefined?'GET':'POST',redirect:'manual',headers:{Origin:base,...(ctx.cookie?{Cookie:ctx.cookie}:{}),...(ctx.csrf?{'X-CSRF-Token':ctx.csrf}:{}),...(body===undefined?{}:{'Content-Type':'application/json'})},body:body===undefined?undefined:JSON.stringify(body)});const text=await response.text();let json;try{json=JSON.parse(text);}catch{}return {status:response.status,text,json,headers:response.headers,cookie:response.headers.get('set-cookie')?.split(';')[0]||ctx.cookie};}
 const session=await reaivideo('/api/login',{}, {username:'fixture',password:'Fixture-AI Video-Only!'});assert.equal(session.status,200);const master={cookie:session.cookie,csrf:session.json.csrf};
 const inventory=await reaivideo('/api/templates',master);assert.equal(inventory.json.projectCount,0);assert.equal(inventory.json.templates.find(x=>x.id==='aivideo').allowedCount,0);
 assert.equal((await reaivideo('/templates/aivideo/preview')).status,401);
 const global=await reaivideo('/templates/aivideo/preview',master);assert.equal(global.status,200);assert.equal(pixel(global.text).config.appName,'AI Video');assert.equal(pixel(global.text).config.token,'');assert.deepEqual(pixel(global.text).calls,[]);
 const a=await reaivideo('/api/projects',master,{name:'AI Video isolated account',allowedTemplates:['feiyue','aivideo'],template:'aivideo'});assert.equal(a.status,200);const slug=a.json.project.slug,path='/p/'+slug;assert.equal(a.json.project.app_name,'');assert.equal(a.json.project.pixel_id,'');assert.equal(a.json.project.download_url,'');
 const b=await reaivideo('/api/projects',master,{name:'Legacy grant account'});assert.deepEqual(b.json.project.allowedTemplates,['feiyue','dptv']);const before=b.json.project;
 const login=await reaivideo(path+'/api/login',{},a.json.credentials);assert.equal(login.status,200);const customer={cookie:login.cookie,csrf:login.json.csrf};
 const bLogin=await reaivideo('/p/'+b.json.project.slug+'/api/login',{},b.json.credentials),other={cookie:bLogin.cookie,csrf:bLogin.json.csrf};
 assert.equal((await reaivideo('/p/'+b.json.project.slug+'/preview/aivideo',other)).status,403);
 assert.equal((await reaivideo('/p/'+b.json.project.slug+'/api/settings',other,{template:'aivideo'})).status,403);
 assert.equal((await reaivideo(path+'/preview/missing',customer)).status,404);
 assert.equal((await reaivideo(path+'/dl')).status,404);
 let actual=await reaivideo(path);assert.deepEqual(pixel(actual.text).calls,[]);assert.equal(pixel(actual.text).config.downloadUrl,path+'/dl');
 await reaivideo(path+'/api/settings',customer,{pixelId:'1000000000000001'});actual=await reaivideo(path);
 assert.equal((actual.text.match(/src="\/assets\/brand-settings\.js/g)||[]).length,1);assert.equal((actual.text.match(/src="\/assets\/collector\.js/g)||[]).length,1);
 for(const signals of [{},{doNotTrack:'1'},{globalPrivacyControl:true},{doNotTrack:'1',globalPrivacyControl:true}]){
  const f=pixel(actual.text,{signals});assert.deepEqual(f.calls,[['init','1000000000000001'],['track','PageView']]);f.click(0);f.click(1);f.click(2);f.click(3);assert.equal(f.calls.filter(x=>x[1]==='DownloadClick').length,4);assert.equal(f.scripts.length,0);
 }
 assert.deepEqual(pixel(actual.text,{paused:true}).calls,[]);
 const preview=await reaivideo(path+'/preview/aivideo',customer);assert.equal(preview.status,200);assert.equal(pixel(preview.text).config.pixelId,'1000000000000001');assert.equal(pixel(preview.text).config.token,'');assert.deepEqual(pixel(preview.text).calls,[]);
 const logo='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jY5kAAAAASUVORK5CYII=';
 for(const [appName,logoData] of [['',''],['Custom AI Video',''],['',logo],['Custom AI Video',logo]]){
  assert.equal((await reaivideo(path+'/api/settings',customer,{appName,logoData})).status,200);
  const c=pixel((await reaivideo(path)).text).config;assert.equal(c.appName,appName||'AI Video');assert.equal(c.logoData,logoData);
 }
 await reaivideo(path+'/api/settings',customer,{appName:'',logoData:'',downloadUrl:'https://example.com/aivideo-fixture.apk'});
 const dl=await reaivideo(path+'/dl');assert.equal(dl.status,302);assert.equal(dl.headers.get('location'),'https://example.com/aivideo-fixture.apk');
 assert.deepEqual((await reaivideo('/api/projects/'+before.slug,master)).json.project,before);
 const totals=(await reaivideo(path+'/api/dashboard',customer)).json.stats.totals;assert.equal(totals.visits,0);
 const cfg=pixel((await reaivideo(path)).text).config;
 assert.equal((await reaivideo(path+'/api/event',{}, {type:'view',id:cfg.visitId,visitId:cfg.visitId,issued:cfg.issued,token:cfg.token,elapsed:0})).status,200);
 const next=(await reaivideo(path+'/api/dashboard',customer)).json.stats.totals;assert.equal(next.visits,1);
 await reaivideo('/api/projects/'+slug,master,{allowedTemplates:['feiyue']});assert.equal((await reaivideo(path+'/preview/aivideo',customer)).status,403);assert.equal((await reaivideo(path+'/api/settings',customer,{template:'aivideo'})).status,403);
 for(const f of ['aivideo.css','aivideo.js','i18n.js','logo.svg','teaser.jpg','teaser.mp4','stories.webp'])assert.equal((await reaivideo('/themes/aivideo/'+f)).status,200,f);
 assert.doesNotMatch((await reaivideo('/')).text,/brand-settings\.js/);assert.doesNotMatch((await reaivideo(path+'/admin')).text,/brand-settings\.js/);assert.doesNotMatch(log,/PHP (Warning|Fatal)|Landing Hub:/);
});
