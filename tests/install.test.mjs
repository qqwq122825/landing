import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawn,execFileSync} from 'node:child_process';
import {mkdtempSync,rmSync,readFileSync,existsSync,unlinkSync,readdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import net from 'node:net';
const root=fileURLToPath(new URL('../',import.meta.url));
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const freePort=()=>new Promise(resolve=>{const s=net.createServer();s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>resolve(p));});});

test('Web installer — first install, lock, reinstall and preservation',async t=>{
 const runtime=mkdtempSync(join(tmpdir(),'hub-installer-test-'));
 const env={...process.env,HUB_DATA_DIR:runtime,HUB_DEV:'1',HUB_ORIGIN:''};
 const port=await freePort(),base=`http://127.0.0.1:${port}`;
 const child=spawn('php',['-S',`127.0.0.1:${port}`,'-t',root+'public',root+'router.php'],{cwd:root,env,stdio:['ignore','ignore','pipe']});
 let log='';child.stderr.on('data',b=>log+=b);
 t.after(async()=>{const ended=new Promise(r=>child.once('exit',r));child.kill('SIGTERM');await ended;rmSync(runtime,{recursive:true,force:true});});
 for(let i=0;i<60;i++){try{await fetch(base+'/install.php');break;}catch{if(i===59)throw Error(log);await wait(50);}}
 async function request(path,ctx={}){
  const {method='GET',cookie='',body,headers={},origin=base}=ctx;
  const r=await fetch(base+path,{method,redirect:'manual',headers:{Origin:origin,...(cookie?{Cookie:cookie}:{}),...headers},...(body===undefined?{}:{body})});
  const text=await r.text();let data;try{data=JSON.parse(text);}catch{}
  return {status:r.status,headers:r.headers,text,data,cookie:r.headers.get('set-cookie')?.split(';')[0]||cookie};
 }
 async function form(){const r=await request('/install.php');assert.equal(r.status,200,r.text);return {...r,csrf:r.text.match(/name="csrf" value="([a-f0-9]+)"/)[1]};}
 const submit=(ctx,values={},options={})=>request('/install.php',{method:'POST',cookie:ctx.cookie,headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({csrf:ctx.csrf,username:'mtx',password:'mtx123',password_confirmation:'mtx123',confirm_install:'1',...values}).toString(),...options});
 const api=(path,body,ctx={})=>request(path,{method:'POST',cookie:ctx.cookie,body:JSON.stringify(body),headers:{'Content-Type':'application/json',...(ctx.csrf?{'X-CSRF-Token':ctx.csrf}:{})}});
 const php=(code)=>execFileSync('php',['-r','require "app/bootstrap.php";'+code],{cwd:root,env,encoding:'utf8'});
 let f,admin,customer,project,newPassword='Reinstalled-Secret-2026!';
 await t.test('uninstalled GET performs environment checks without creating an administrator',async()=>{f=await form();assert.match(f.text,/PDO SQLite/);assert.match(f.text,/value="mtx"/);assert.match(f.text,/value="mtx123"/);assert.match(f.headers.get('cache-control'),/no-store/);assert.equal(f.headers.get('referrer-policy'),'same-origin');assert.match(f.headers.get('content-security-policy'),/form-action 'self'/);assert.equal(existsSync(join(runtime,'install.lock')),false);assert.equal(existsSync(join(runtime,'hub.sqlite')),false);});
 await t.test('login explains the missing installation instead of reporting wrong credentials',async()=>{const r=await api('/api/login',{username:'mtx',password:'mtx123'});assert.equal(r.status,503);assert.match(r.data.error,/尚未安装.*install\.php/);});
 await t.test('installer rejects missing CSRF and cross-origin posts',async()=>{assert.equal((await submit(f,{csrf:''})).status,403);assert.equal((await submit(f,{}, {origin:'https://foreign.example'})).status,403);assert.equal(existsSync(join(runtime,'install.lock')),false);});
 await t.test('installer rejects inconsistent passwords, short custom passwords and missing confirmation',async()=>{assert.equal((await submit(f,{password_confirmation:'wrong'})).status,400);assert.equal((await submit(f,{username:'other'})).status,400);assert.equal((await submit(f,{confirm_install:''})).status,400);assert.equal((await submit(f,{username:'<script>'})).status,400);assert.equal(php('echo query("SELECT COUNT(*) FROM admins")->fetchColumn();'),'0');});
 await t.test('first install succeeds and writes a private install.lock',async()=>{const r=await submit(f);assert.equal(r.status,200,r.text);assert.match(r.text,/总站已安装完成/);assert.ok(!r.text.includes('value="mtx123"'));const lock=JSON.parse(readFileSync(join(runtime,'install.lock'),'utf8'));assert.equal(lock.reinstalled,false);assert.equal(php('echo password_verify("mtx123",query("SELECT password_hash FROM admins WHERE username=\'mtx\'")->fetchColumn())?"yes":"no";'),'yes');});
 await t.test('GET, alias and POST are blocked while install.lock exists',async()=>{for(const path of ['/install.php','/install']){const r=await request(path);assert.equal(r.status,423);assert.match(r.text,/安装入口已锁定/);assert.doesNotMatch(r.text,/<form /);}assert.equal((await submit(f,{username:'intruder'})).status,423);assert.equal(php('echo query("SELECT username FROM admins")->fetchColumn();'),'mtx');});
 await t.test('new administrator logs in and creates an isolated customer project',async()=>{const r=await api('/api/login',{username:'mtx',password:'mtx123'});assert.equal(r.status,200,r.text);admin={cookie:r.cookie,csrf:r.data.csrf};const p=await api('/api/projects',{name:'保留数据测试',appName:'Kept App',note:'private note'},admin);assert.equal(p.status,200,p.text);project=p.data;const c=await api('/p/'+project.project.slug+'/api/login',project.credentials);assert.equal(c.status,200);customer={cookie:c.cookie,csrf:c.data.csrf};php("query('INSERT INTO visits(project_id,id,started_at,ip_address,country,region,city,device,os,browser) VALUES(?,?,?,?,?,?,?,?,?,?)',["+project.project.id+",'fixture-visit-1234',now_ms(),'127.0.0.1','','','','desktop','macOS','Chrome']);");});
 await t.test('manual lock deletion reopens the form and requires an explicit preservation checkbox',async()=>{unlinkSync(join(runtime,'install.lock'));f=await form();assert.match(f.text,/检测到已有总站管理员/);assert.match(f.text,/name="confirm_existing"/);const r=await submit(f,{password:newPassword,password_confirmation:newPassword});assert.equal(r.status,409);assert.equal(existsSync(join(runtime,'install.lock')),false);});
 await t.test('reinstall changes only the primary administrator and regenerates the lock',async()=>{const r=await submit(f,{password:newPassword,password_confirmation:newPassword,confirm_existing:'1'});assert.equal(r.status,200,r.text);assert.match(r.text,/已有客户和统计数据已保留/);assert.ok(!r.text.includes(newPassword));assert.equal(JSON.parse(readFileSync(join(runtime,'install.lock'),'utf8')).reinstalled,true);assert.equal((await request('/api/projects',admin)).status,401);assert.equal((await api('/api/login',{username:'mtx',password:'mtx123'})).status,401);const login=await api('/api/login',{username:'mtx',password:newPassword});assert.equal(login.status,200);admin={cookie:login.cookie,csrf:login.data.csrf};});
 await t.test('customer accounts, configuration and visitor history survive reinstallation',async()=>{const r=await request('/p/'+project.project.slug+'/api/dashboard',customer);assert.equal(r.status,200,r.text);assert.equal(r.data.project.app_name,'Kept App');assert.equal(r.data.project.download_url,'');assert.equal(r.data.stats.totals.visits,1);assert.equal((await api('/p/'+project.project.slug+'/api/login',project.credentials)).status,200);const p=await request('/api/projects/'+project.project.slug,admin);assert.equal(p.data.project.note,'private note');});
 await t.test('reinstall creates a valid database backup with prior accounts and data',()=>{const names=readdirSync(join(runtime,'backups')).filter(s=>s.startsWith('before-install-'));assert.ok(names.length>0);const files=names.map(name=>join(runtime,'backups',name));const counts=files.map(file=>execFileSync('php',['-r','$db=new PDO("sqlite:".$argv[1]);echo $db->query("SELECT COUNT(*) FROM projects")->fetchColumn();',file],{encoding:'utf8'}));assert.ok(counts.includes('1'));});
 await t.test('a repeated install post stays blocked and lock content remains unchanged',async()=>{const previous=readFileSync(join(runtime,'install.lock'),'utf8');assert.equal((await submit(f,{confirm_existing:'1'})).status,423);assert.equal(readFileSync(join(runtime,'install.lock'),'utf8'),previous);});
 await t.test('database failure rolls back account changes and removes only the attempt-owned lock',async()=>{unlinkSync(join(runtime,'install.lock'));php("db()->exec(\"CREATE TRIGGER reject_admin_update BEFORE UPDATE ON admins BEGIN SELECT RAISE(ABORT, 'fixture denied'); END;\");");f=await form();const r=await submit(f,{confirm_existing:'1'});assert.equal(r.status,503);assert.equal(existsSync(join(runtime,'install.lock')),false);assert.equal((await api('/api/login',{username:'mtx',password:newPassword})).status,200);php("db()->exec('DROP TRIGGER reject_admin_update');");});
 await t.test('failed attempts can be retried successfully without removing customer data',async()=>{f=await form();assert.equal((await submit(f,{password:newPassword,password_confirmation:newPassword,confirm_existing:'1'})).status,200);assert.equal(existsSync(join(runtime,'install.lock')),true);assert.equal(php('echo query("SELECT COUNT(*) FROM projects")->fetchColumn();'),'1');});
 await t.test('lock and backups are outside the public document root',async()=>{for(const path of ['/runtime/install.lock','/runtime/hub.sqlite','/runtime/backups/','/app/install-service.php'])assert.equal((await request(path)).status,404);});
 await t.test('installer produced no PHP warnings or fatal errors',()=>assert.doesNotMatch(log,/PHP (?:Warning|Fatal error)/));
});

test('parallel installer processes serialize on one lock',async()=>{
 const runtime=mkdtempSync(join(tmpdir(),'hub-install-race-'));
 try {
  const env={...process.env,HUB_DATA_DIR:runtime,HUB_DEV:'1'};
  const run=()=>new Promise((resolve,reject)=>{const child=spawn('php',['-r','require "app/install-service.php";try{hub_install_run("mtx","mtx123");echo "installed";}catch(HubError $e){echo "blocked:".$e->status;}'],{cwd:root,env});let out='',err='';child.stdout.on('data',b=>out+=b);child.stderr.on('data',b=>err+=b);child.on('error',reject);child.on('exit',code=>code===0?resolve(out):reject(Error(err)));});
  const results=await Promise.all([run(),run()]);assert.deepEqual(results.sort(),['blocked:423','installed']);
 }finally{rmSync(runtime,{recursive:true,force:true});}
});
