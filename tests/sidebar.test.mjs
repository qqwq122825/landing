import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../public/assets/console.js', import.meta.url), 'utf8');
const start = source.indexOf(' function setupSidebar(){');
const end = source.indexOf('\n async function api(', start);
assert.ok(start >= 0 && end > start);
const code = source.slice(start, end) + '\nsetupSidebar();';
const key = 'landing-hub:sidebar';

function fixture(width, storage = new Map(), blocked = false) {
  const element = () => ({
    attrs:new Map(), listeners:new Map(), classes:new Set(),
    setAttribute(name, value){this.attrs.set(name, value);},
    getAttribute(name){return this.attrs.get(name) ?? null;},
    removeAttribute(name){this.attrs.delete(name);},
    addEventListener(name, callback){this.listeners.set(name, callback);},
    emit(name){this.listeners.get(name)?.();},
  });
  const root = element(), toggle = element(), mobile = element(), menu = element();
  menu.classList = {contains:name => menu.classes.has(name)};
  const desktop = {matches:width >= 992, addEventListener(_, fn){this.change=fn;}};
  const compact = {matches:width < 1280, addEventListener(_, fn){this.change=fn;}};
  let hides = 0;
  const controller = vm.runInNewContext(code, {
    $:selector => ({'#sidebar-toggle':toggle, '#sidebar-mobile-toggle':mobile, '#sidebar-menu':menu})[selector],
    document:{documentElement:root},
    window:{matchMedia:query => query.includes('min-width') ? desktop : compact},
    localStorage:{
      getItem(name){if(blocked) throw Error('storage disabled'); return storage.get(name);},
      setItem(name, value){if(blocked) throw Error('storage disabled'); storage.set(name,value);},
    },
    tabler:{Collapse:{getInstance:() => ({hide(){hides++;menu.classes.delete('show');menu.emit('hidden.bs.collapse');}})}},
  });
  return {
    root,toggle,mobile,menu,storage,controller,
    folded:() => root.getAttribute('data-bs-sidebar') === 'folded',
    hides:() => hides,
    resize(next){
      const wasDesktop=desktop.matches,wasCompact=compact.matches;
      desktop.matches=next>=992;compact.matches=next<1280;
      if(wasDesktop!==desktop.matches)desktop.change();
      if(wasCompact!==compact.matches)compact.change();
    },
  };
}

test('sidebar uses native Tabler folded layout, named icons and separate mobile control', () => {
  const html = readFileSync(new URL('../app/console.html', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../public/assets/console.css', import.meta.url), 'utf8');
  assert.match(html, /id="sidebar-toggle"[^>]*aria-controls="sidebar"/);
  assert.match(html, /id="sidebar-mobile-toggle"[^>]*data-bs-toggle="collapse"/);
  for (const name of ['项目总览','模板管理','访问分析','操作日志','平台说明']) assert.ok(html.includes(`aria-label="${name}" title="${name}"`));
  assert.match(css, /--tblr-sidebar-width:14rem;--tblr-sidebar-folded-width:4rem/);
  assert.match(css, /html\[data-bs-sidebar=folded\]/);
});

test('sidebar automatically adapts at mobile, compact desktop and wide desktop boundaries', () => {
  const f = fixture(1440);
  assert.equal(f.folded(),false);
  for (const [width,folded] of [[1280,false],[1279,true],[992,true],[991,false],[390,false],[1024,true],[1440,false]]) {
    f.resize(width);assert.equal(f.folded(),folded,`viewport ${width}`);
  }
  assert.equal(f.storage.size,0,'automatic changes must not overwrite the preference');
});

test('sidebar toggle remembers an explicit choice across refresh and navigation', () => {
  const f = fixture(1440);
  f.toggle.emit('click');assert.equal(f.folded(),true);
  assert.equal(f.toggle.getAttribute('aria-expanded'),'false');
  assert.equal(f.toggle.getAttribute('aria-label'),'展开侧栏');
  const reload=fixture(1440,f.storage);assert.equal(reload.folded(),true);
  reload.controller.closeMobileMenu();assert.equal(reload.folded(),true);assert.equal(reload.hides(),0);
  reload.toggle.emit('click');assert.equal(reload.folded(),false);
  assert.equal(reload.toggle.getAttribute('title'),'收起侧栏');
  assert.equal(fixture(1024,f.storage).folded(),false,'manual expand overrides automatic compact mode');
});

test('mobile layout ignores but preserves the desktop preference', () => {
  const f=fixture(1440,new Map([[key,'collapsed']]));
  f.resize(390);assert.equal(f.folded(),false);assert.equal(f.storage.get(key),'collapsed');
  f.resize(1440);assert.equal(f.folded(),true);
});

test('invalid or unavailable browser storage does not break sidebar controls', () => {
  const invalid=fixture(1024,new Map([[key,'unexpected-value']]));assert.equal(invalid.folded(),true);
  const blocked=fixture(1440,new Map(),true);
  blocked.toggle.emit('click');assert.equal(blocked.folded(),true);
  blocked.toggle.emit('click');assert.equal(blocked.folded(),false);
});

test('mobile selection and switching to desktop close only the transient mobile menu', () => {
  const f=fixture(390);
  f.menu.classes.add('show');f.menu.emit('shown.bs.collapse');
  assert.equal(f.mobile.getAttribute('aria-label'),'收起导航菜单');
  f.controller.closeMobileMenu();assert.equal(f.hides(),1);
  assert.equal(f.mobile.getAttribute('aria-label'),'展开导航菜单');
  f.menu.classes.add('show');f.resize(1280);
  assert.equal(f.menu.classes.has('show'),false);assert.equal(f.hides(),2);
  f.controller.closeMobileMenu();assert.equal(f.hides(),2,'desktop navigation leaves sidebar alone');
});
