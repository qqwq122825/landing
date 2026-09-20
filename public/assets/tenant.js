(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const realm = document.body.dataset.realm;
  const base = '/p/' + realm + '/api';
  const state = { csrf: '', project: null, loading: false, request: 0, page: 1, pages: 1, days: '7', pendingTemplate: null };
  const format = value => Number(value || 0).toLocaleString('zh-CN');
  const dateFormat = new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  const regionNames = typeof Intl.DisplayNames === 'function' ? new Intl.DisplayNames(['zh-CN'], { type: 'region' }) : null;
  const country = code => { try { return code ? regionNames?.of(code) || code : '未知'; } catch { return '未知'; } };
  const devices = { mobile: '手机', desktop: '电脑', tablet: '平板', other: '其他' };
  const templateName = id => id === 'dptv' ? 'DPTV / MinuteDrama' : 'Feiyue / ReelShort';
  const previewUrl = id => '/p/' + realm + '/preview/' + id + '?lang=zh';
  const dialog = $('#template-preview');

  function duration(ms) {
    const seconds = Math.max(0, Math.round(Number(ms || 0) / 1000));
    if (seconds < 60) return seconds + 's';
    if (seconds < 3600) return Math.floor(seconds / 60) + 'm' + (seconds % 60 ? seconds % 60 + 's' : '');
    return Math.floor(seconds / 3600) + 'h' + (Math.floor(seconds % 3600 / 60) ? Math.floor(seconds % 3600 / 60) + 'm' : '');
  }
  function message(element, text, error = false) {
    element.textContent = text;
    element.classList.toggle('error', error);
  }
  function showLogin(text = '') {
    state.csrf = ''; state.project = null; state.request++;
    $('#boot').hidden = true; $('#dashboard').hidden = true; $('#login-panel').hidden = false;
    $('#password').value = ''; $('#login-error').textContent = text;
    if (dialog.open) dialog.close();
    $$('.phone iframe').forEach(frame => frame.removeAttribute('src'));
    ['pixel-form', 'brand-form', 'settings-form'].forEach(id => $('#' + id).reset());
    $('#app-logo').disabled = false;
    ['pixel-message', 'brand-message', 'settings-message'].forEach(id => message($('#' + id), ''));
    $('#visit-rows').replaceChildren(); $('#daily-rows').replaceChildren();
    $('#logo-preview').removeAttribute('src'); $('#logo-preview').hidden = true;
  }
  async function api(path, options = {}) {
    let response;
    try {
      response = await fetch(base + path, { credentials: 'same-origin', cache: 'no-store', ...options,
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': state.csrf, ...options.headers } });
    } catch { throw Error('服务连接失败，请检查网络后重试'); }
    let data;
    try { data = await response.json(); }
    catch { throw Error('服务响应格式错误，请检查 PHP 和伪静态配置'); }
    if (!response.ok) {
      if (path !== '/login' && response.status === 401) showLogin('登录已过期，请重新登录');
      if (path !== '/login' && response.status === 403 && data.error?.includes('项目已暂停')) showLogin(data.error);
      throw Object.assign(Error(data.error || '操作失败，请重试'), { status: response.status });
    }
    return data;
  }
  const post = body => api('/settings', { method: 'POST', body: JSON.stringify(body) });
  function busy(loading) {
    state.loading = loading;
    ['refresh', 'days', 'logout'].forEach(id => $('#' + id).disabled = loading);
    $('#prev-page').disabled = loading || state.page <= 1;
    $('#next-page').disabled = loading || state.page >= state.pages;
  }
  function renderStats(stats) {
    const totals = stats.totals;
    for (const [id, value] of Object.entries({ 'today-views': totals.today_visits, 'today-downloads': totals.today_downloads,
      'total-views': totals.visits, 'unique-ips': totals.unique_ips, 'total-downloads': totals.downloads })) $('#' + id).textContent = format(value);
    $('#download-rate').textContent = Number(totals.conversion_rate).toFixed(1) + '%';
    $('#avg-stay').textContent = duration(totals.avg_duration);
    $('#updated').textContent = '更新于 ' + dateFormat.format(new Date(stats.updatedAt));
    $('#countries').textContent = stats.countries.map(r => country(r.country) + ' ' + format(r.count)).join(' · ') || '暂无数据';
    $('#devices').textContent = (stats.devices || []).map(r => (devices[r.device] || '其他') + ' ' + format(r.count)).join(' · ') || '暂无数据';
    const max = Math.max(1, ...stats.daily.map(r => Number(r.visits)));
    $('#chart').replaceChildren(...stats.daily.map((r, i) => {
      const bar = document.createElement('div'); bar.className = 'bar';
      bar.style.height = Math.max(4, Math.round(Number(r.visits) * 72 / max)) + 'px';
      bar.title = `${r.day} · 访问 ${r.visits} · 下载转化 ${r.downloads}`;
      bar.setAttribute('aria-label', bar.title); bar.setAttribute('role', 'img'); bar.tabIndex = 0;
      const label = document.createElement('i'); label.textContent = stats.daily.length <= 7 || i % 5 === 0 ? r.day.slice(5) : '';
      bar.append(label); return bar;
    }));
    $('#empty-message').hidden = stats.total > 0;
    $('#visit-rows').replaceChildren(...stats.visits.map(row => {
      const tr = document.createElement('tr');
      const time = document.createElement('td'); time.textContent = dateFormat.format(new Date(Number(row.started_at)));
      const place = document.createElement('td'), ip = document.createElement('p'), geo = document.createElement('p');
      ip.textContent = row.ip_address || '未知'; geo.className = 'geo';
      geo.textContent = [country(row.country), row.region, row.city].filter(Boolean).join(' · '); place.append(ip, geo);
      const device = document.createElement('td'); device.textContent = [devices[row.device] || '其他', row.os, row.browser].filter(Boolean).join(' / ');
      const stay = document.createElement('td'); stay.textContent = duration(row.duration_ms);
      const clicked = document.createElement('td'); clicked.className = Number(row.clicked) ? 'clicked' : 'not-clicked';
      clicked.textContent = Number(row.clicked) ? '已点击' : '未点击'; tr.append(time, place, device, stay, clicked); return tr;
    }));
    $('#visits-empty').hidden = stats.visits.length > 0;
    $('#daily-rows').replaceChildren(...[...stats.daily].reverse().map(row => {
      const tr = document.createElement('tr');
      for (const value of [row.day, format(row.visits), format(row.downloads)]) { const td = document.createElement('td'); td.textContent = value; tr.append(td); }
      return tr;
    }));
    state.page = stats.page; state.pages = stats.pages;
    $('#visit-total').textContent = '共 ' + format(stats.total) + ' 次访问';
    $('#page-info').textContent = `第 ${state.page} / ${state.pages} 页`;
  }
  function markTemplate(id) {
    $$('[data-template]').forEach(button => {
      const allowed=state.project.allowedTemplates.includes(button.dataset.template);button.hidden=!allowed;
      const frame=button.querySelector('iframe');if(!allowed)frame.removeAttribute('src');else if(!frame.getAttribute('src'))frame.src=previewUrl(button.dataset.template);
      const selected = button.dataset.template === id;
      button.classList.toggle('selected', selected); button.setAttribute('aria-pressed', String(selected));
      button.querySelector('.template-badge').hidden = !selected;
    });
  }
  function updateProject(project) {
    state.project = project;
    if(dialog.open&&!project.allowedTemplates.includes(state.pendingTemplate))dialog.close();
    $('#project-name').textContent = project.effectiveAppName;
    $('#app-name').placeholder = '留空使用：' + project.defaultAppName;
    document.title = '落地页后台 · ' + project.effectiveAppName;
    markTemplate(project.template);
  }
  function loadPreviews() {
    $$('.tpl').forEach(button => {const frame=button.querySelector('iframe');if(state.project.allowedTemplates.includes(button.dataset.template))frame.src=previewUrl(button.dataset.template);else frame.removeAttribute('src');});
  }
  function fillSettings(project) {
    $('#app-name').value = project.app_name; $('#download-url').value = project.download_url;
    $('#pixel-id').value = project.pixel_id;
    $('#logo-preview').hidden = !project.logo_data;
    if (project.logo_data) $('#logo-preview').src = project.logo_data; else $('#logo-preview').removeAttribute('src');
    const url = location.origin + '/p/' + realm;
    $('#pixel-bind').href = url; $('#pixel-bind').textContent = url;
    const li = document.createElement('li'), link = document.createElement('a');
    link.href = url; link.textContent = url; link.target = '_blank'; link.rel = 'noopener'; li.append(link);
    $('#landing-addresses').replaceChildren(li); loadPreviews();
  }
  async function load(initial = false, wantedPage = state.page) {
    if (state.loading) return;
    busy(true); const request = ++state.request, days = $('#days').value;
    $('#stats-error').hidden = true;
    try {
      const data = await api('/dashboard?days=' + days + '&page=' + wantedPage);
      if (request !== state.request) return;
      state.days = days; updateProject(data.project); renderStats(data.stats);
      $('#boot').hidden = true; $('#login-panel').hidden = true; $('#dashboard').hidden = false;
      // Refresh statistics without replacing unsaved form edits.
      if (initial) fillSettings(data.project);
    } catch (error) {
      $('#days').value = state.days;
      if ($('#dashboard').hidden) showLogin(error.status === 401 ? '登录已过期，请重新登录' : error.message);
      else { message($('#stats-error'), error.message + '；下方保留上次成功读取的数据。', true); $('#stats-error').hidden = false; }
    } finally { busy(false); }
  }
  async function saveForm(form, status, work, success = '已保存') {
    const button = form.querySelector('button'); if (button.disabled) return;
    button.disabled = true; message(status, '正在保存…');
    try { await work(); message(status, success); }
    catch (error) { message(status, error.message, true); }
    finally { button.disabled = false; }
  }
  $('#login-form').addEventListener('submit', async event => {
    event.preventDefault(); const button = $('#login-button'); if (button.disabled) return;
    button.disabled = true; $('#login-error').textContent = '';
    try {
      const data = await api('/login', { method: 'POST', body: JSON.stringify({ username: $('#username').value.trim(), password: $('#password').value }) });
      state.csrf = data.csrf; $('#password').value = ''; await load(true, 1);
    } catch (error) { $('#login-error').textContent = error.message; }
    finally { button.disabled = false; }
  });
  $('#pixel-form').addEventListener('submit', event => {
    event.preventDefault(); saveForm(event.currentTarget, $('#pixel-message'), async () => {
      const result = await post({ pixelId: $('#pixel-id').value.trim() }); updateProject(result.project);
      $('#pixel-id').value = result.project.pixel_id;
    }, 'Pixel ID 已保存；请刷新实际落地页后验证事件，留空则停用。');
  });
  $('#settings-form').addEventListener('submit', event => {
    event.preventDefault(); saveForm(event.currentTarget, $('#settings-message'), async () => {
      const result = await post({ downloadUrl: $('#download-url').value.trim() }); updateProject(result.project);
      $('#download-url').value = result.project.download_url;
    }, '下载地址已保存；留空时不跳转到任何 APK。');
  });
  $('#reset-logo').addEventListener('change',event=>{const file=$('#app-logo');file.disabled=event.target.checked;if(event.target.checked)file.value='';});
  $('#brand-form').addEventListener('submit', event => {
    event.preventDefault(); saveForm(event.currentTarget, $('#brand-message'), async () => {
      const body = { appName: $('#app-name').value.trim() }, file = $('#app-logo').files[0];
      if ($('#reset-logo').checked) body.logoData = '';
      else if (file) {
        if (file.size > 204800 || !['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) throw Error('请选择 200 KB 以内的 PNG / JPG / WebP 图片');
        body.logoData = await new Promise((resolve, reject) => {
          const reader = new FileReader(); reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(Error('图片读取失败，请重新选择')); reader.readAsDataURL(file);
        });
      }
      const result = await post(body); updateProject(result.project); $('#app-name').value = result.project.app_name; $('#app-logo').value = ''; $('#app-logo').disabled = false; $('#reset-logo').checked = false;
      $('#logo-preview').hidden = !result.project.logo_data;
      if (result.project.logo_data) $('#logo-preview').src = result.project.logo_data;
      loadPreviews();
    });
  });
  $('#copy-bind').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText($('#pixel-bind').href); message($('#pixel-message'), '已复制当前项目落地页地址'); }
    catch { message($('#pixel-message'), '请选中上方地址手动复制'); }
  });
  $$('[data-template]').forEach(button => button.addEventListener('click', () => {
    if (!state.project || !state.project.allowedTemplates.includes(button.dataset.template)) return;
    state.pendingTemplate = button.dataset.template;
    $('#preview-title').textContent = templateName(state.pendingTemplate);
    $('#template-frame').src = previewUrl(state.pendingTemplate);
    const current = state.project.template === state.pendingTemplate;
    $('#apply-template').disabled = current; $('#apply-template').textContent = current ? '当前使用中' : '使用此模板';
    message($('#template-message'), '预览不计访问。点击「使用此模板」才会切换。'); dialog.showModal();
  }));
  $('#apply-template').addEventListener('click', async () => {
    const button = $('#apply-template'); if (button.disabled) return; button.disabled = true;
    try {
      const result = await post({ template: state.pendingTemplate }); updateProject(result.project);
      button.textContent = '当前使用中'; message($('#template-message'), '已应用。新打开的落地页将使用此模板，统计数据保留。');
    } catch (error) { message($('#template-message'), error.message, true); button.disabled = false; }
  });
  $('#close-preview').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => $('#template-frame').removeAttribute('src'));
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  $('#refresh').addEventListener('click', () => load());
  $('#days').addEventListener('change', () => load(false, 1));
  $('#prev-page').addEventListener('click', () => load(false, state.page - 1));
  $('#next-page').addEventListener('click', () => load(false, state.page + 1));
  $('#logout').addEventListener('click', async () => {
    if (state.loading) return; busy(true);
    try { await api('/logout', { method: 'POST', body: '{}' }); showLogin(); }
    catch (error) { if (error.status === 401) showLogin(); else { message($('#stats-error'), error.message, true); $('#stats-error').hidden = false; } }
    finally { busy(false); }
  });
  async function initialize() {
    try { const session = await api('/session'); state.csrf = session.csrf; await load(true, 1); }
    catch (error) { showLogin(error.status === 401 ? '' : error.message); }
  }
  setInterval(() => { if (!$('#dashboard').hidden && document.visibilityState === 'visible') load(); }, 30000);
  window.addEventListener('pageshow', event => { if (event.persisted) initialize(); });
  initialize();
})();
