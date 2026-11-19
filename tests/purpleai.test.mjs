import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('PurpleAI keeps supplied English layout and media while stripping third-party tracking/downloads',()=>{
 const html=read('resources/pages/purpleai.html'),js=read('public/themes/purpleai/purpleai.js');
 assert.match(html,/<html lang="en" dir="ltr">/);
 assert.equal((html.match(/class="mcard download-link"/g)||[]).length,40);
 assert.equal((html.match(/download-link/g)||[]).length,42);
 assert.equal((html.match(/data-batch=/g)||[]).length,10);
 assert.equal((html.match(/data-hub-logo/g)||[]).length,3);
 assert.match(html,/data-hub-name>Shorts/);
 assert.doesNotMatch(html+js,/2095074734450986|jgsf1987|fbq\(|fbevents|cloudflareinsights|data-cf-beacon|data-dl|location\.href\s*=|sendBeacon|fetch\(/);
 assert.match(js,/aria-pressed/);assert.match(js,/timeupdate/);
 assert.match(read('app/bootstrap.php'),/const HUB_DEFAULT_TEMPLATES=\['feiyue','dptv'\]/);
});
test('PurpleAI extracted media byte hashes are self-contained and verified',()=>{
 const media=JSON.parse(read('docs/templates/purpleai-media.json'));assert.equal(media.length,42);
 assert.equal(media.filter(x=>x.path.endsWith('.mp4')).length,1);
 for(const asset of media){const b=readFileSync(new URL('../public/themes/purpleai/'+asset.path,import.meta.url));assert.equal(b.length,asset.bytes);assert.equal(createHash('sha256').update(b).digest('hex'),asset.sha256);}
});

test('PurpleAI Hindi dictionaries cover every text and dynamic accessibility key',()=>{
 const sandbox={window:{}};vm.runInNewContext(read('public/themes/purpleai/i18n.js'),sandbox);const d=sandbox.window.PURPLEAI_I18N;
 assert.deepEqual(Object.keys(d),['en','hi']);assert.equal(Object.keys(d.hi).length,21);assert.deepEqual(Object.keys(d.hi).sort(),Object.keys(d.en).sort());
 for(const [key,value] of Object.entries(d.hi)){assert.ok(value.trim(),key);assert.notEqual(value,d.en[key],key);}
 const html=read('resources/pages/purpleai.html');for(const m of html.matchAll(/data-i18n="([^"]+)"/g))assert.ok(d.hi[m[1]],m[1]);
 assert.equal((html.match(/data-episodes=/g)||[]).length,40);assert.match(html,/id="purpleai-language"/);
});
