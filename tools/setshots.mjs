// Set inspection: boots the built HTML with ?setview=<set>&env=<preset> and photographs every camera and anchor.
// Usage: node tools/setshots.mjs --file out/x.html --set parade [--env day] [--only name,name] [--dir out/shots-parade]
//        [--w 1280 --h 720] [--timeout 120] [--quiet]
// Writes one PNG per view, <kind>-<name>.png (kind = cam | anchor), and prints calls / tris / textures per view;
// views over 300 draw calls are flagged. Exit 1 on a page error, a console error or a view that fails.
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const flag = (k) => args.includes('--' + k);
const file = path.resolve(opt('file', 'two.html'));
const set = opt('set', null), env = opt('env', null);
if (!set) { console.error('setshots: --set <setId> is required'); process.exit(2); }
const only = opt('only', null) ? new Set(opt('only').split(',').map((x) => x.trim()).filter(Boolean)) : null;
const dir = path.resolve(opt('dir', `out/shots-${set}`));
const W = +opt('w', 1280), H = +opt('h', 720), timeout = +opt('timeout', 120) * 1000, quiet = flag('quiet');
const LIMIT = 300;
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const threeDir = path.join(root, 'node_modules/three');
const html = fs.readFileSync(file, 'utf8');
const launchArgs = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'];
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: launchArgs }).catch(async () => chromium.launch({ args: launchArgs }));
const page = await browser.newPage({ viewport: { width: W, height: H } });
await page.route('https://cdn.jsdelivr.net/npm/three@0.186.1/**', async (r) => {
  const u = new URL(r.request().url()); const rel = u.pathname.replace('/npm/three@0.186.1/', '');
  const fp = path.join(threeDir, rel);
  if (!fs.existsSync(fp)) return r.fulfill({ status: 404, body: 'nf' });
  r.fulfill({ status: 200, contentType: 'application/javascript', body: fs.readFileSync(fp) });
});
await page.route('http://game.local/**', (r) => r.fulfill({ status: 200, contentType: 'text/html', body: html }));
const errors = [];
page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message + '\n' + (e.stack || '')));
page.on('console', (m) => {
  const t = m.type(), s = m.text();
  if (t === 'error') errors.push(s);
  if (!quiet && (t === 'error' || t === 'warning')) console.log(`[${t}] ${s}`);
});
const q = new URLSearchParams({ setview: set });
if (env) q.set('env', env);
await page.goto('http://game.local/two.html?' + q.toString());
const T0 = Date.now();
let ready = false;
while (Date.now() - T0 < timeout) {
  ready = await page.evaluate(() => !!(window.TWO_TEST && window.TWO_TEST.ready)).catch(() => false);
  if (ready) break;
  await page.waitForTimeout(250);
}
const fail = (msg) => { console.error('setshots: ' + msg); for (const e of errors.slice(0, 20)) console.error('ERROR: ' + e); };
if (!ready) { fail('the page never became ready (timeout)'); await browser.close(); process.exit(1); }
const hasViews = await page.evaluate(() => typeof window.TWO_TEST.views === 'function');
if (!hasViews) { fail(`no views: set '${set}' did not load`); await browser.close(); process.exit(1); }
let views = await page.evaluate(() => window.TWO_TEST.views());
const envs = await page.evaluate(() => window.TWO_TEST.envs());
if (only) views = views.filter((v) => only.has(v.name) || only.has(`${v.kind}-${v.name}`));
fs.mkdirSync(dir, { recursive: true });
console.log(`set ${set}${env ? ' · env ' + env : ''} · envs: ${envs.join(', ') || '-'} · ${views.length} views -> ${path.relative(process.cwd(), dir) || '.'}`);
const rows = [];
let bad = 0;
for (const v of views) {
  const safe = `${v.kind}-${v.name}`.replace(/[^\w.-]+/g, '_');
  try {
    const s = await page.evaluate(([k, n]) => window.TWO_TEST.view(k, n), [v.kind, v.name]);
    await page.screenshot({ path: path.join(dir, safe + '.png') });
    rows.push({ ...v, ...s, file: safe + '.png' });
  } catch (e) { bad++; rows.push({ ...v, err: String(e.message || e).split('\n')[0] }); }
}
// the table
const pad = (s, n) => String(s).padEnd(n), lpad = (s, n) => String(s).padStart(n);
const wN = Math.max(4, ...rows.map((r) => r.name.length));
console.log(`\n${pad('kind', 7)}${pad('name', wN + 2)}${lpad('calls', 7)}${lpad('tris', 10)}${lpad('tex', 6)}${lpad('geo', 6)}`);
for (const r of rows) {
  if (r.err) { console.log(`${pad(r.kind, 7)}${pad(r.name, wN + 2)}  FAILED: ${r.err}`); continue; }
  console.log(`${pad(r.kind, 7)}${pad(r.name, wN + 2)}${lpad(r.calls, 7)}${lpad(r.tris, 10)}${lpad(r.textures, 6)}${lpad(r.geometries, 6)}${r.calls > LIMIT ? `  <-- over ${LIMIT} calls` : ''}`);
}
const okRows = rows.filter((r) => !r.err), over = okRows.filter((r) => r.calls > LIMIT);
if (okRows.length) {
  const mx = okRows.reduce((a, b) => (b.calls > a.calls ? b : a));
  console.log(`\nmax ${mx.calls} calls (${mx.kind} ${mx.name}) · ${over.length} over ${LIMIT}${bad ? ` · ${bad} failed` : ''}${errors.length ? ` · ${errors.length} console errors` : ''}`);
}
for (const e of errors.slice(0, 20)) console.log('ERROR: ' + e);
await browser.close();
process.exit(errors.length || bad ? 1 : 0);
