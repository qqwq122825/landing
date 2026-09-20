import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const script = join(root, 'bin/check.php');
const temp = t => {
  const dir = mkdtempSync(join(tmpdir(), 'hub-deploy-check-'));
  t.after(() => rmSync(dir, {recursive:true, force:true}));
  return dir;
};
const check = (data, args = [script], cwd = tmpdir()) => {
  const result = spawnSync('php', args, {cwd, env:{...process.env, HUB_DATA_DIR:data}, encoding:'utf8'});
  assert.ifError(result.error);
  assert.equal(result.stderr, '');
  return result;
};

test('PHP deployment preflight runs independently of cwd and leaves private data unchanged', t => {
  const data = temp(t);
  const files = ['hub.sqlite', 'secret.key', 'credentials.key', 'install.lock'];
  for (const file of files) writeFileSync(join(data, file), `fixture-private-content-${file}`, {mode:0o600});
  const before = Object.fromEntries(files.map(file => [file, readFileSync(join(data,file))]));
  const result = check(data);
  assert.equal(result.status, 0, result.stdout);
  assert.match(result.stdout, /预检通过/);
  assert.match(result.stdout, /已有安装锁/);
  assert.doesNotMatch(result.stdout, /fixture-private-content/);
  assert.deepEqual(readdirSync(data).sort(), [...files].sort());
  for (const file of files) assert.deepEqual(readFileSync(join(data,file)), before[file]);
});

test('PHP deployment preflight checks fresh data without initializing the application', t => {
  const data = temp(t);
  const result = check(data);
  assert.equal(result.status, 0, result.stdout);
  assert.match(result.stdout, /未发现安装锁/);
  assert.deepEqual(readdirSync(data), []);
});

test('PHP deployment preflight reports a missing data directory without creating it', t => {
  const data = join(temp(t), 'not-created');
  const result = check(data);
  assert.equal(result.status, 1, result.stdout);
  assert.match(result.stdout, /\[FAIL\] 数据目录存在/);
  assert.equal(existsSync(data), false);
});

test('PHP deployment preflight reports unavailable PHP features without bootstrapping business code', t => {
  const data = temp(t);
  // Homebrew PHP can compile its extensions in, even with -n. Disable capabilities explicitly.
  const result = check(data, ['-n', '-d', 'disable_functions=openssl_encrypt,openssl_decrypt,session_start,getimagesizefromstring', script]);
  assert.equal(result.status, 1, result.stdout);
  assert.match(result.stdout, /\[FAIL\] OpenSSL AES-256-GCM/);
  assert.match(result.stdout, /\[FAIL\] 会话支持/);
  assert.match(result.stdout, /\[FAIL\] 图像信息读取/);
  assert.doesNotMatch(result.stdout, /Fatal error|Warning:/);
  assert.deepEqual(readdirSync(data), []);
});

test('PHP deployment preflight identifies incomplete checkouts and resolves public data symlinks', t => {
  const fixture = temp(t);
  mkdirSync(join(fixture, 'bin'));
  mkdirSync(join(fixture, 'public'));
  copyFileSync(script, join(fixture, 'bin/check.php'));
  symlinkSync(join(fixture, 'public'), join(fixture, 'private-link'), 'dir');
  const result = check(join(fixture, 'private-link'), [join(fixture, 'bin/check.php')]);
  assert.equal(result.status, 1, result.stdout);
  assert.match(result.stdout, /缺失或不可读：public\/assets\/vendor\/tabler-1.5.1\/tabler.min.css/);
  assert.match(result.stdout, /\[FAIL\] 数据目录位于 public 之外/);
  assert.deepEqual(readdirSync(join(fixture, 'public')), []);
});
