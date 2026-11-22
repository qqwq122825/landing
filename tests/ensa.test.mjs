import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
function dictionaries(){const sandbox={window:{}};vm.runInNewContext(read('public/themes/ensa/i18n.js'),sandbox);return sandbox.window.ENSA_I18N;}
test('ENSA preserves hotlinks and platform download wiring',()=>{
 const html=read('resources/pages/ensa.html'),js=read('public/themes/ensa/ensa.js');
 assert.match(html,/<html lang="id" dir="ltr">/);
 assert.equal((html.match(/class="[^"]*download-link/g)||[]).length,48);
 const imageUrls=[...html.matchAll(/https:\/\/dah910c\.site\/ensa\/images\/[^"']+/g)].map(match=>match[0]);
 assert.equal(new Set(imageUrls).size,18);assert.equal((html.match(/class="card" role="button"/g)||[]).length,27);
 assert.match(html,/https:\/\/dah910c\.site\/ensa\/video\.webm/);
 assert.equal((html.match(/data-hub-logo/g)||[]).length,3);assert.match(html,/data-hub-wordmark/);assert.match(html,/data-hub-name>XVIDEOS/);
 assert.doesNotMatch(html+js,/MeetU|meetu-sdk|api\.skyprotect|apk-url|api\/pixels|fbq\(|fbevents|cloudflareinsights|data-cf-beacon|sendBeacon|location\.href\s*=/);
 assert.match(js,/setTimeout\(showDownload,8000\)/);assert.match(js,/event\.key!==\'Escape\'/);
});
test('ENSA exposes complete Indonesian and Spanish dictionaries',()=>{
 const html=read('resources/pages/ensa.html'),dict=dictionaries();
 assert.deepEqual(Object.keys(dict).sort(),['es','id']);
 assert.deepEqual(Object.keys(dict.id).sort(),Object.keys(dict.es).sort());
 for(const lang of ['id','es'])for(const [key,value] of Object.entries(dict[lang]))assert.ok(value.trim(),`${lang}.${key}`);
 const keys=[...html.matchAll(/data-i18n(?:-aria-label)?="([^"]+)"/g)].map(m=>m[1]);
 for(const key of keys)assert.ok(key in dict.id,`missing key ${key}`);
 assert.equal((html.match(/data-job-key=/g)||[]).length,15);
 assert.match(html,/<option value="id">Bahasa Indonesia<\/option><option value="es">Español<\/option>/);
 assert.match(html,/i18n\.js\?v=20261123es/);
});
test('ENSA language controller keeps URL, project-scoped storage and safe fallback rules',()=>{
 const js=read('public/themes/ensa/ensa.js');
 assert.match(js,/hub:ensa:language:/);assert.match(js,/window\.HUB_PAGE&&window\.HUB_PAGE\.slug/);
 assert.match(js,/raw!==null\)return normalize\(raw\)\|\|fallback/);
 assert.match(js,/navigator\.languages/);assert.match(js,/history\.replaceState/);
 assert.match(js,/try\{return localStorage\.getItem/);assert.match(js,/try\{localStorage\.setItem/);
 assert.match(js,/document\.documentElement\.lang=currentLanguage/);assert.match(js,/document\.documentElement\.dir='ltr'/);
});
test('ENSA platform registration keeps historical defaults unchanged',()=>{
 const bootstrap=read('app/bootstrap.php'),routes=read('app/routes.php'),consoleHtml=read('app/console.html'),tenant=read('app/tenant.html');
 assert.match(bootstrap,/const HUB_TEMPLATES=\['ensa','purpleai'/);assert.match(bootstrap,/const HUB_DEFAULT_TEMPLATES=\['feiyue','dptv'\]/);assert.match(bootstrap,/'ensa'=>'XVIDEOS'/);
 assert.match(routes,/\['id'=>'ensa','name'=>'ENSA \/ XVIDEOS'/);assert.match(routes,/印尼语 \/ 西班牙语/);
 assert.match(consoleHtml,/name="allowedTemplates" value="ensa"/);assert.match(tenant,/印度尼西亚语 \/ 西班牙语/);
});
