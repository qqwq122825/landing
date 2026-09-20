import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawn,execFileSync} from 'node:child_process';
import {mkdtempSync,rmSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import net from 'node:net';
import {randomUUID} from 'node:crypto';

const root=fileURLToPath(new URL('../',import.meta.url));
test('master project deletion — authorization, transaction, isolation and retired identities',async t=>{
 const runtime=mkdtempSync(join(tmpdir(),'hub-delete-test-'));
 const env={...process.env,HUB_DATA_DIR:runtime,HUB_DEV:'1',HUB_ORIGIN:''};
 execFileSync('php',['bin/setup.php','--username=fixture','--password=Fixture-Admin-2026!'],{cwd:root,env});
 const port=await new Promise(resolve=>{const s=net.createServer();s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>resolve(p));});});
 const base=`http://127.0.0.1:${port}`;
 const child=spawn('php',['-S',`127.0.0.1:${port}`,'-t','public','router.php'],{cwd:root,env,stdio:['ignore','ignore','pipe']});
 let log='';child.stderr.on('data',b=>log+=b);
 t.after(async()=>{const stopped=new Promise(resolve=>child.once('exit',resolve));child.kill();await stopped;rmSync(runtime,{recursive:true,force:true});});
 for(let i=0;i<80;i++){try{await fetch(base);break;}catch{if(i===79)throw Error(log);await new Promise(r=>setTimeout(r,50));}}
 async function request(path,{method='GET',body,cookie='',csrf='',origin=base}={}){
  const res=await fetch(base+path,{method,redirect:'manual',headers:{Origin:origin,...(cookie?{Cookie:cookie}:{}),...(csrf?{'X-CSRF-Token':csrf}:{}),...(body!==undefined?{'Content-Type':'application/json'}:{})},...(body===undefined?{}:{body:JSON.stringify(body)})});
  const text=await res.text();let data;try{data=JSON.parse(text);}catch{}
  return {status:res.status,text,data,cookie:res.headers.get('set-cookie')?.split(';')[0]||cookie};
 }
 const post=(path,body,ctx={})=>request(path,{method:'POST',body,...ctx});
 const login=async(path,body)=>{const r=await post(path,body);assert.equal(r.status,200);return {cookie:r.cookie,csrf:r.data.csrf};};
 const php=(code,args=[])=>execFileSync('php',['-r','require "app/bootstrap.php";'+code,...args],{cwd:root,env,encoding:'utf8'});
 const master=await login('/api/login',{username:'fixture',password:'Fixture-Admin-2026!'});
 const create=async name=>{const r=await post('/api/projects',{name},master);assert.equal(r.status,200,r.text);return r.data;};
 const kept=await create('保留项目'),paused=await create('暂停项目'),target=await create('删除测试项目');
 const slug=target.project.slug,path='/api/projects/'+slug+'/delete',confirmation={confirmSlug:slug};
 const tenant=await login('/p/'+slug+'/api/login',target.credentials);
 const keptTenant=await login('/p/'+kept.project.slug+'/api/login',kept.credentials);
 const page=await request('/p/'+slug),config=JSON.parse(page.text.match(/window\.HUB_PAGE=(.*?);window\.APP_CONFIG/s)[1]);
 const event=(type)=>({id:type==='view'?config.visitId:randomUUID(),visitId:config.visitId,issued:config.issued,token:config.token,type,elapsed:100});
 assert.equal((await post('/p/'+slug+'/api/event',event('view'))).status,200);
 assert.equal((await post('/p/'+slug+'/api/event',event('download'))).status,200);
 await post('/api/projects/'+paused.project.slug+'/status',{status:'paused'},master);
 const preserved=JSON.parse(php('echo json_encode(project($argv[1]));',[kept.project.slug]));
 const files=['secret.key','credentials.key','install.lock'];
 const privateFiles=files.map(file=>readFileSync(join(runtime,file)));
 const snapshot=()=>JSON.parse(php('echo json_encode(["projects"=>query("SELECT * FROM projects ORDER BY id")->fetchAll(),"visits"=>query("SELECT * FROM visits")->fetchAll(),"events"=>query("SELECT * FROM events")->fetchAll(),"audit"=>query("SELECT * FROM audit ORDER BY id")->fetchAll(),"retired"=>query("SELECT * FROM deleted_projects")->fetchAll()]);'));

 await t.test('delete appears in master only and confirmation input starts disabled',()=>{
  const js=readFileSync(root+'public/assets/console.js','utf8'),html=readFileSync(root+'app/console.html','utf8');
  assert.match(js,/text-danger" data-action="delete-project"/);
  assert.match(html,/id="delete-confirm-slug"/);assert.match(html,/id="delete-submit"[^>]*disabled/);
  assert.doesNotMatch(readFileSync(root+'public/assets/tenant.js','utf8'),/delete-project|\/delete/);
 });
 await t.test('anonymous, tenant and wrong-method requests never delete projects',async()=>{
  const before=snapshot();
  for(const ctx of [{},tenant])assert.equal((await post(path,confirmation,ctx)).status,401);
  assert.equal((await post('/p/'+slug+'/api/projects/'+slug+'/delete',confirmation,tenant)).status,404);
  for(const method of ['GET','DELETE'])assert.equal((await request(path,{...master,method})).status,404);
  assert.deepEqual(snapshot(),before);
 });
 await t.test('deletion requires CSRF, same origin and the exact project identifier',async()=>{
  const before=snapshot();
  assert.equal((await post(path,confirmation,{cookie:master.cookie})).status,403);
  assert.equal((await post(path,confirmation,{...master,origin:'https://other.example'})).status,403);
  for(const confirmSlug of [undefined,null,[],{},'',kept.project.slug,' '+slug])assert.equal((await post(path,{confirmSlug},master)).status,400);
  assert.deepEqual(snapshot(),before);
 });
 await t.test('a database failure rolls back the project, statistics, retirement and audit together',async()=>{
  const before=snapshot();
  php('db()->exec("CREATE TRIGGER fixture_delete_failure BEFORE DELETE ON projects BEGIN SELECT RAISE(ABORT, \'fixture_delete_failure\'); END");');
  try{const r=await post(path,confirmation,master);assert.equal(r.status,500);assert.doesNotMatch(r.text,/fixture_delete_failure|SQLSTATE/);assert.deepEqual(snapshot(),before);}
  finally{php('db()->exec("DROP TRIGGER fixture_delete_failure");');}
 });
 await t.test('confirmed deletion removes only its account, settings and all tracking rows',async()=>{
  const r=await post(path,confirmation,master);assert.equal(r.status,200,r.text);assert.deepEqual(r.data,{ok:true,deleted:slug});
  const after=snapshot();assert.equal(after.projects.length,2);assert.ok(!after.projects.some(p=>p.slug===slug));
  assert.ok(!after.visits.some(v=>v.project_id===target.project.id));assert.ok(!after.events.some(e=>e.project_id===target.project.id));
  assert.equal(after.retired.length,1);assert.equal(after.retired[0].id,target.project.id);assert.equal(after.retired[0].slug,slug);
  assert.deepEqual(Object.keys(after.retired[0]).sort(),['deleted_at','id','slug']);
  assert.deepEqual(after.projects.find(p=>p.slug===kept.project.slug),preserved);
  files.forEach((file,i)=>assert.deepEqual(readFileSync(join(runtime,file)),privateFiles[i]));
 });
 await t.test('deleted landing, downloads, customer sessions and old account credentials stop working',async()=>{
  for(const suffix of ['','/admin','/dl','/api/dashboard','/api/session','/preview/feiyue'])assert.equal((await request('/p/'+slug+suffix,tenant)).status,404,suffix);
  assert.equal((await post('/p/'+slug+'/api/login',target.credentials)).status,404);
  assert.equal((await post('/p/'+slug+'/api/event',event('download'))).status,404);
  assert.equal((await post('/api/projects/'+slug+'/credentials',{},master)).status,404);
  assert.equal((await request('/p/'+kept.project.slug+'/api/dashboard',keptTenant)).status,200);
  assert.equal((await request('/p/'+kept.project.slug)).status,200);
 });
 await t.test('lists, totals and template counts update while historical audit identity remains readable',async()=>{
  const list=(await request('/api/projects',master)).data;assert.equal(list.projects.length,2);assert.equal(list.active,1);assert.equal(list.totals.visits,0);assert.equal(list.totals.downloads,0);
  const inventory=(await request('/api/templates',master)).data;assert.equal(inventory.projectCount,2);assert.ok(inventory.templates.every(item=>!item.projects.some(p=>p.slug===slug)));
  const audit=await request('/api/audit',master);const deleted=audit.data.rows.find(r=>r.action==='删除项目');assert.equal(deleted.project,'已删除 /p/'+slug);assert.match(deleted.detail,/删除测试项目/);
  assert.ok(audit.data.rows.some(r=>r.action==='创建项目'&&r.project==='已删除 /p/'+slug));
  assert.ok(!audit.text.includes(target.credentials.password));assert.doesNotMatch(audit.text,/password_hash|password_cipher/);
 });
 await t.test('repeated deletion returns not found without additional changes',async()=>{
  const before=snapshot();assert.equal((await post(path,confirmation,master)).status,404);assert.deepEqual(snapshot(),before);
 });
 let next;
 await t.test('new projects never inherit deleted IDs, audit history, sessions or tracking tokens',async()=>{
  next=await create('删除后新项目');assert.ok(next.project.id>target.project.id);assert.notEqual(next.project.slug,slug);
  assert.equal((await post('/p/'+next.project.slug+'/api/event',event('view'))).status,403);
  assert.equal((await request('/p/'+next.project.slug+'/api/dashboard',tenant)).status,401);
  const audit=(await request('/api/audit',master)).data.rows;assert.equal(audit.find(r=>r.action==='删除项目').project,'已删除 /p/'+slug);
  assert.equal((await request('/api/projects/'+next.project.slug,master)).data.stats.totals.visits,0);
 });
 await t.test('paused and last projects can be deleted, and creating after an empty list still works',async()=>{
  for(const p of [paused,kept,next])assert.equal((await post('/api/projects/'+p.project.slug+'/delete',{confirmSlug:p.project.slug},master)).status,200);
  const list=(await request('/api/projects',master)).data;assert.deepEqual(list.projects,[]);assert.equal(list.active,0);
  const replacement=await create('空列表重新开户');assert.ok(replacement.project.id>next.project.id);
  const loginResponse=await post('/p/'+replacement.project.slug+'/api/login',replacement.credentials);assert.equal(loginResponse.status,200);
  assert.equal((await request('/install.php')).status,423);
 });
 await t.test('stale in-flight analytics rechecks project existence before writing',()=>{
  const result=php('require "app/analytics.php"; $_SERVER["HTTP_HOST"]=$argv[1];$_SERVER["HTTP_ORIGIN"]="http://".$argv[1];try{record_event(json_decode($argv[2],true),json_decode($argv[3],true));echo "unexpected";}catch(HubError $e){echo $e->status;}',[`127.0.0.1:${port}`,JSON.stringify(target.project),JSON.stringify(event('view'))]);
  assert.equal(result,'404');assert.equal(snapshot().visits.length,0);
 });
 await t.test('server has no warnings or unexpected errors',()=>{
  assert.doesNotMatch(log,/PHP (?:Warning|Fatal error)/);
  assert.equal(log.split('\n').filter(s=>s.includes('Landing Hub:')&&!s.includes('fixture_delete_failure')).length,0);
 });
});
