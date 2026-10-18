import {test} from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync,spawn} from 'node:child_process';
import {mkdtempSync,rmSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import net from 'node:net';

const root=fileURLToPath(new URL('../',import.meta.url));
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const human='Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
const googlebot='Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';
const googleInspection='Mozilla/5.0 (compatible; Google-InspectionTool/1.0;)';
const adsbot='AdsBot-Google (+http://www.google.com/adsbot.html)';
const metaAgents=[
 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
 'facebookcatalog/1.0',
 'facebookplatform/1.1',
 'FacebookBot/1.0',
 'meta-externalagent/1.1 (+https://developers.facebook.com/docs/sharing/webmasters/crawler)',
 'meta-externalfetcher/1.1'
];
const fbInApp='Mozilla/5.0 (Linux; Android 13; SM-A536B Build/TP1A.220624.014; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/124.0.0.0 Mobile Safari/537.36 [FBAN/EMA;FBLC/en_US;FBAV/451.0.0.0]';

test('crawler user-agent matching is case-insensitive, covers Google/Meta review agents and skips in-app browsers',()=>{
 const probes=JSON.parse(execFileSync('php',['-r',`require "app/bootstrap.php";
  $uas=[${[googlebot,googleInspection,adsbot,...metaAgents,fbInApp,human,'curl/8.7.1',''].map(ua=>JSON.stringify(ua)).join(',')}];
  echo json_encode(array_map(fn($ua)=>is_crawler_ua($ua),$uas));`],{cwd:root,encoding:'utf8'}));
 assert.deepEqual(probes,[true,true,true,...metaAgents.map(()=>true),false,false,false,false]);
 assert.equal(new Set(JSON.parse(execFileSync('php',['-r','require "app/bootstrap.php"; echo json_encode(HUB_CRAWLER_PATTERNS);'],{cwd:root,encoding:'utf8'}))).size>10,true);
});

test('cloaking stays off by default and the setting is stored globally',()=>{
 const runtime=mkdtempSync(join(tmpdir(),'hub-cloak-store-')),env={...process.env,HUB_DATA_DIR:runtime};
 const state=()=>JSON.parse(execFileSync('php',['-r',`require "app/bootstrap.php";
  $before=cloaking_enabled();$empty=platform_settings();
  setting_set('cloaking_enabled','1');setting_set('cloaking_updated_by','fixture');setting_set('cloaking_updated_at',(string)now_ms());
  $after=cloaking_enabled();$payload=platform_settings();
  echo json_encode(['before'=>$before,'empty'=>$empty,'after'=>$after,'payload'=>$payload]);`],{cwd:root,env,encoding:'utf8'}));
 try{
  const result=state();
  assert.equal(result.before,false);
  assert.equal(result.empty.cloaking.enabled,false);
  assert.equal(result.empty.cloaking.updatedAt,0);
  assert.equal(result.after,true);
  assert.equal(result.payload.cloaking.enabled,true);
  assert.equal(result.payload.cloaking.updatedBy,'fixture');
  assert.ok(result.payload.cloaking.updatedAt>0);
  assert.ok(result.payload.cloaking.patterns.includes('googlebot'));
  assert.ok(result.payload.cloaking.patterns.includes('facebookexternalhit'));
 }finally{rmSync(runtime,{recursive:true,force:true});}
});

test('master-level cloaking switch splits crawler and human responses end to end',async t=>{
 const runtime=mkdtempSync(join(tmpdir(),'hub-cloak-e2e-')),env={...process.env,HUB_DATA_DIR:runtime,HUB_DEV:'1'};
 const password='Fixture-Cloak-2026!';
 execFileSync('php',['bin/setup.php','--username=fixture','--password='+password],{cwd:root,env,stdio:'pipe'});
 const port=await new Promise(resolve=>{const server=net.createServer();server.listen(0,'127.0.0.1',()=>{const value=server.address().port;server.close(()=>resolve(value));});});
 const base='http://127.0.0.1:'+port;
 const child=spawn('php',['-S','127.0.0.1:'+port,'-t',root+'public',root+'router.php'],{cwd:root,env,stdio:['ignore','ignore','pipe']});
 let log='';child.stderr.on('data',chunk=>log+=chunk);
 t.after(async()=>{child.kill('SIGTERM');await new Promise(resolve=>child.once('exit',resolve));rmSync(runtime,{recursive:true,force:true});});
 for(let i=0;i<60;i++){try{await fetch(base);break;}catch{if(i===59)throw Error(log);await wait(50);}}
 async function request(path,{method='GET',body,cookie='',csrf='',origin=base,headers={}}={}){
  const response=await fetch(base+path,{method,redirect:'manual',headers:{Origin:origin,...(cookie?{Cookie:cookie}:{}),...(csrf?{'X-CSRF-Token':csrf}:{}),...(body===undefined?{}:{'Content-Type':'application/json'}),...headers},...(body===undefined?{}:{body:JSON.stringify(body)})});
  const text=await response.text();let data=null;try{data=JSON.parse(text);}catch{}
  return {status:response.status,text,data,headers:response.headers,cookie:response.headers.get('set-cookie')?.split(';')[0]||cookie};
 }
 const post=(path,body,ctx={})=>request(path,{method:'POST',body,...ctx});
 const counts=()=>JSON.parse(execFileSync('php',['-r','require "app/bootstrap.php"; echo json_encode([query("SELECT COUNT(*) FROM visits")->fetchColumn(),query("SELECT COUNT(*) FROM events")->fetchColumn(),cloaking_enabled()]);'],{cwd:root,env,encoding:'utf8'}));

 assert.equal((await request('/api/settings')).status,401,'platform settings need a master session');
 const login=await post('/api/login',{username:'fixture',password});assert.equal(login.status,200,login.text);
 const master={cookie:login.cookie,csrf:login.data.csrf};
 let settings=await request('/api/settings',master);assert.equal(settings.status,200);assert.equal(settings.data.cloaking.enabled,false);assert.equal(settings.data.cloaking.updatedAt,0);

 const created=await post('/api/projects',{name:'Cloak fixture',allowedTemplates:['feiyue'],template:'feiyue'},master);
 assert.equal(created.status,200,created.text);const slug=created.data.project.slug,landing='/p/'+slug;
 const tenant=await post(landing+'/api/login',created.data.credentials);assert.equal(tenant.status,200);const customer={cookie:tenant.cookie,csrf:tenant.data.csrf};

 const complete=response=>{assert.equal(response.status,200);assert.match(response.text,/window\.HUB_PAGE=/);assert.match(response.text,/\/assets\/collector\.js\?v=/);assert.match(response.text,/download-link/);assert.doesNotMatch(response.text,/Checking your browser/);};
 const shell=response=>{assert.equal(response.status,200);assert.match(response.text,/Checking your browser/);assert.doesNotMatch(response.text,/window\.HUB_PAGE=|collector\.js|download-link|<base href=|fbq\(/);assert.match(response.headers.get('x-robots-tag'),/noindex, nofollow/);assert.match(response.headers.get('cache-control'),/no-store/);assert.ok(response.text.length<4000,'shell stays small');};

 // The switch is off by default: crawler agents already receive the full page.
 const beforeSwitch=await request(landing,{headers:{'User-Agent':googlebot}});
 complete(beforeSwitch);assert.equal(beforeSwitch.headers.get('x-robots-tag'),null);
 assert.deepEqual(counts(),[0,0,false]);

 assert.equal((await post('/api/settings',{cloaking:'true'},{cookie:master.cookie})).status,403,'CSRF is required');
 assert.equal((await post('/api/settings',{cloaking:'true'},master)).status,400,'only booleans are accepted');
 settings=await post('/api/settings',{cloaking:true},master);
 assert.equal(settings.status,200,settings.text);assert.equal(settings.data.cloaking.enabled,true);assert.ok(settings.data.cloaking.updatedAt>0);assert.match(settings.data.cloaking.updatedBy,/fixture/);

 shell(await request(landing,{headers:{'User-Agent':googlebot}}));
 for(const agent of [googleInspection,adsbot,...metaAgents])shell(await request(landing,{headers:{'User-Agent':agent}}));
 complete(await request(landing,{headers:{'User-Agent':human}}));
 complete(await request(landing,{headers:{'User-Agent':fbInApp}}));
 complete(await request(landing,{headers:{'User-Agent':'curl/8.7.1'}}));

 // Both preview entry points stay complete for any user agent.
 const catalog=await request('/templates/feiyue/preview',{...master,headers:{'User-Agent':googlebot}});complete(catalog);
 assert.equal(catalog.headers.get('x-frame-options'),'SAMEORIGIN');
 const projectPreview=await request(landing+'/preview/feiyue',{...master,headers:{'User-Agent':metaAgents[0]}});complete(projectPreview);
 assert.match(projectPreview.text,/"preview":true/);

 // Crawler shells never load the collector, so no visit or event is recorded.
 assert.deepEqual(counts(),[0,0,true]);

 // The customer admin cannot read or flip the global switch: the field is ignored.
 assert.equal((await request(landing+'/api/settings',customer)).status,404);
 const saved=await post(landing+'/api/settings',{appName:'Cloak fixture app',cloaking:false},customer);
 assert.equal(saved.status,200,saved.text);
 assert.equal((await request('/api/settings',master)).data.cloaking.enabled,true);
 shell(await request(landing,{headers:{'User-Agent':googlebot}}));

 const audit=await request('/api/audit',master);
 assert.ok(audit.data.rows.some(row=>row.action==='开启爬虫分流'&&row.project===null));

 settings=await post('/api/settings',{cloaking:false},master);
 assert.equal(settings.status,200);assert.equal(settings.data.cloaking.enabled,false);
 complete(await request(landing,{headers:{'User-Agent':googlebot}}));
 complete(await request(landing,{headers:{'User-Agent':metaAgents[0]}}));
 assert.ok((await request('/api/audit',master)).data.rows.some(row=>row.action==='关闭爬虫分流'));

 assert.doesNotMatch(log,/PHP (?:Warning|Fatal error)|Landing Hub:/);
 assert.match(readFileSync(root+'app/console.html','utf8'),/data-view="settings"/);
 assert.match(readFileSync(root+'public/assets/console.js','utf8'),/async function platformSettings\(\)/);
});
