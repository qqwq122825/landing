import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync,rmSync,existsSync} from 'node:fs';
import {spawn,execFileSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import net from 'node:net';

const root=fileURLToPath(new URL('../',import.meta.url));
const page=readFileSync(root+'resources/pages/miradoview.html','utf8');
const script=readFileSync(root+'public/themes/miradoview/miradoview.js','utf8');

test('MiradoView structure, media, server download markers and newest-first registries',()=>{
 assert.match(page,/<html dir="ltr" lang="es-MX">/);
 assert.equal((page.match(/<!doctype html>/gi)||[]).length,1);
 assert.equal((page.match(/\bdownload-link\b/g)||[]).length,2);
 assert.equal((page.match(/data-prompt-download/g)||[]).length,34);
 assert.equal((page.match(/<img[^>]+https:\/\/plusmiradoview\.com\/landing-assets\//g)||[]).length,34);
 const css=readFileSync(root+'public/themes/miradoview/theme.css','utf8');
 assert.match(css,/https:\/\/plusmiradoview\.com\/landing-assets\/promo_208d6839c81f10a8\.jpg/);
 assert.match(css,/\.header \.brand-icon\{display:none;/);
 assert.match(css,/\.header \.brand-icon\[src\^="data:image\/"\]\{display:block\}/);
 assert.doesNotMatch(page+script,/__LANDING_RUNTIME__|fbq\(|fbevents|landing-bind-session|public-manifest|intent:\/\/|\.apk|atob|sendBeacon|fetch\(/);
 assert.match(page,/data-hub-wordmark/);assert.equal((page.match(/data-hub-name/g)||[]).length,3);assert.equal((page.match(/data-hub-logo/g)||[]).length,2);
 assert.equal((page.match(/data-scroll-download/g)||[]).length,1);
 assert.match(page,/<a class="btn btn-secondary" data-scroll-download="" href="#download">Mas Info<\/a>/);
 assert.match(script,/\[data-prompt-download\],\[data-scroll-download\]/);assert.match(script,/preventDefault\(\)/);assert.match(script,/scrollIntoView/);assert.doesNotMatch(script,/location\.(?:assign|href)|window\.open/);
 const consolePage=readFileSync(root+'app/console.html','utf8'),tenantPage=readFileSync(root+'app/tenant.html','utf8');
 assert.equal(consolePage.match(/name="allowedTemplates" value="([^"]+)"/)[1],'miradoview');
 assert.equal(tenantPage.match(/data-template="([^"]+)"/)[1],'miradoview');
 assert.match(readFileSync(root+'public/assets/console.js','utf8'),/const templateLabels=\{miradoview:/);
 assert.match(readFileSync(root+'public/assets/tenant.js','utf8'),/\(\{miradoview:'MiradoView'/);
 for(const file of ['theme.css','miradoview.js','logo.svg'])assert.ok(existsSync(root+'public/themes/miradoview/'+file));
});

test('MiradoView HTTP integration and uniform standards-based noindex switch',async t=>{
 const data=mkdtempSync(join(tmpdir(),'hub-miradoview-test-')),env={...process.env,HUB_DATA_DIR:data,HUB_DEV:'1'};
 execFileSync('php',['bin/setup.php','--username=fixture','--password=Fixture-MiradoView-2026!'],{cwd:root,env,stdio:'pipe'});
 const port=await new Promise(resolve=>{const s=net.createServer();s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>resolve(p));});});
 const base='http://127.0.0.1:'+port,child=spawn('php',['-S','127.0.0.1:'+port,'-t','public','router.php'],{cwd:root,env,stdio:['ignore','ignore','pipe']});let log='';child.stderr.on('data',chunk=>log+=chunk);
 t.after(async()=>{child.kill();await new Promise(resolve=>child.once('exit',resolve));rmSync(data,{recursive:true,force:true});});
 for(let i=0;i<60;i++){try{await fetch(base);break;}catch{if(i===59)throw Error(log);await new Promise(resolve=>setTimeout(resolve,30));}}
 async function request(path,ctx={},body,headers={}){const response=await fetch(base+path,{method:body===undefined?'GET':'POST',redirect:'manual',headers:{Origin:base,...headers,...(ctx.cookie?{Cookie:ctx.cookie}:{}),...(ctx.csrf?{'X-CSRF-Token':ctx.csrf}:{}),...(body===undefined?{}:{'Content-Type':'application/json'})},body:body===undefined?undefined:JSON.stringify(body)});const text=await response.text();let json;try{json=JSON.parse(text);}catch{}return {status:response.status,text,json,headers:response.headers,cookie:response.headers.get('set-cookie')?.split(';')[0]||ctx.cookie};}
 const auth=await request('/api/login',{}, {username:'fixture',password:'Fixture-MiradoView-2026!'});assert.equal(auth.status,200);const master={cookie:auth.cookie,csrf:auth.json.csrf};
 const inventory=await request('/api/templates',master);assert.equal(inventory.status,200);assert.equal(inventory.json.templates[0].id,'miradoview');assert.equal(inventory.json.templates[0].name,'MiradoView');
 const preview=await request('/templates/miradoview/preview',master);assert.equal(preview.status,200);assert.match(preview.text,/<base href="\/themes\/miradoview\/">/);assert.equal(preview.headers.get('x-robots-tag'),'noindex, nofollow');
 const created=await request('/api/projects',master,{name:'MiradoView fixture',allowedTemplates:['miradoview'],template:'miradoview'});assert.equal(created.status,200,created.text);assert.equal(created.json.project.template,'miradoview');assert.equal(created.json.project.block_search_index,false);
 const slug=created.json.project.slug,path='/p/'+slug;
 const login=await request(path+'/api/login',{},created.json.credentials);assert.equal(login.status,200);const customer={cookie:login.cookie,csrf:login.json.csrf};
 let actual=await request(path);assert.equal(actual.status,200);assert.equal(actual.headers.get('x-robots-tag'),null);assert.doesNotMatch(actual.text,/<meta name="robots" content="noindex, nofollow, noarchive, nosnippet, noimageindex">/);
 const links=[...actual.text.matchAll(/<a\b[^>]*class="[^"]*download-link[^"]*"[^>]*>/g)].map(match=>match[0]);assert.equal(links.length,2);for(const link of links)assert.match(link,new RegExp('href="'+path.replaceAll('/','\\/')+'\\/dl"'));
 assert.equal((await request(path+'/api/settings',customer,{blockSearchIndex:'true'})).status,400);
 let saved=await request(path+'/api/settings',customer,{blockSearchIndex:true});assert.equal(saved.status,200,saved.text);assert.equal(saved.json.project.block_search_index,true);
 const human=await request(path),bot=await request(path,{},undefined,{'User-Agent':'Googlebot/2.1 (+http://www.google.com/bot.html)'});
 for(const response of [human,bot]){assert.equal(response.status,200);assert.equal(response.headers.get('x-robots-tag'),'noindex, nofollow, noarchive, nosnippet, noimageindex');assert.match(response.text,/<meta name="robots" content="noindex, nofollow, noarchive, nosnippet, noimageindex">/);assert.match(response.text,/MiradoView<\/span>: Estrenos Recientes/);assert.equal((response.text.match(/data-prompt-download/g)||[]).length,34);}
 const normalize=html=>html.replace(/window\.HUB_PAGE=.*?;window\.APP_CONFIG/s,'window.HUB_PAGE=<request-runtime>;window.APP_CONFIG');assert.equal(normalize(human.text),normalize(bot.text));
 saved=await request(path+'/api/settings',customer,{blockSearchIndex:false});assert.equal(saved.status,200);assert.equal(saved.json.project.block_search_index,false);actual=await request(path);assert.equal(actual.headers.get('x-robots-tag'),null);assert.doesNotMatch(actual.text,/noarchive, nosnippet/);
 for(const file of ['theme.css','miradoview.js','logo.svg'])assert.equal((await request('/themes/miradoview/'+file)).status,200,file);
 assert.doesNotMatch(log,/PHP (Warning|Fatal)|Landing Hub:/);
});
