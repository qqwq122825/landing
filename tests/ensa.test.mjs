import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('ENSA reproduces the Indonesian reference layout using stable hotlinks and project downloads',()=>{
 const html=read('resources/pages/ensa.html'),js=read('public/themes/ensa/ensa.js');
 assert.match(html,/<html lang="id" dir="ltr">/);
 assert.equal((html.match(/class="[^"]*download-link/g)||[]).length,48);
 const imageUrls=[...html.matchAll(/https:\/\/dah910c\.site\/ensa\/images\/[^"']+/g)].map(match=>match[0]);
 assert.equal(new Set(imageUrls).size,18);
 assert.equal((html.match(/class="card" role="button"/g)||[]).length,27);
 assert.match(html,/https:\/\/dah910c\.site\/ensa\/video\.webm/);
 assert.equal((html.match(/data-hub-logo/g)||[]).length,3);
 assert.match(html,/data-hub-wordmark/);assert.match(html,/data-hub-name>XVIDEOS/);
 assert.doesNotMatch(html+js,/MeetU|meetu-sdk|api\.skyprotect|apk-url|api\/pixels|fbq\(|fbevents|cloudflareinsights|data-cf-beacon|sendBeacon|location\.href\s*=/);
 assert.match(js,/setTimeout\(showDownload,8000\)/);assert.match(js,/event\.key!=='Escape'/);
});
test('ENSA platform registration keeps historical defaults unchanged',()=>{
 const bootstrap=read('app/bootstrap.php'),routes=read('app/routes.php'),consoleHtml=read('app/console.html'),tenant=read('app/tenant.html');
 assert.match(bootstrap,/const HUB_TEMPLATES=\['ensa','purpleai'/);
 assert.match(bootstrap,/const HUB_DEFAULT_TEMPLATES=\['feiyue','dptv'\]/);
 assert.match(bootstrap,/'ensa'=>'XVIDEOS'/);
 assert.match(routes,/\['id'=>'ensa','name'=>'ENSA \/ XVIDEOS'/);
 assert.match(consoleHtml,/name="allowedTemplates" value="ensa"/);
 assert.match(tenant,/data-template="ensa"/);
});
