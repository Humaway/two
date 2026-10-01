// Headless test runner. Serves the built HTML with three.js routed from node_modules (the CDN is not reachable here).
// Usage: node tools/run.mjs [--file two.html] [--q "autoplay=1&fast=1&scene=1.1&stop=1.3&speed=8"] [--timeout 600]
//        [--shots dir] [--every 2] [--w 1280 --h 720] [--quiet]
// Prints console errors/warnings and TWO_TEST.log (or RUE_TEST for ref/rue.html); exit code 1 on page errors or timeout.
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const flag = (k) => args.includes('--' + k);
const file = path.resolve(opt('file', 'two.html'));
const q = opt('q', 'autoplay=1&fast=1&speed=8');
const timeout = +opt('timeout', 600) * 1000;
const shots = opt('shots', null), every = +opt('every', 0);
const W = +opt('w', shots ? 1280 : 640), H = +opt('h', shots ? 720 : 360);   // no screenshots: render small (the CPU renders WebGL here)
const quiet = flag('quiet');
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const threeDir = path.join(root, 'node_modules/three');
const html = fs.readFileSync(file, 'utf8');
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] }).catch(async () => chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] }));
const page = await browser.newPage({ viewport: { width: W, height: H } });
await page.route('https://cdn.jsdelivr.net/npm/three@0.186.1/**', async (r) => {
  const u = new URL(r.request().url()); const rel = u.pathname.replace('/npm/three@0.186.1/', '');
  const fp = path.join(threeDir, rel);
  if (!fs.existsSync(fp)) return r.fulfill({ status: 404, body: 'nf' });
  r.fulfill({ status: 200, contentType: 'application/javascript', body: fs.readFileSync(fp) });
});
await page.route('http://game.local/**', (r) => r.fulfill({ status: 200, contentType: 'text/html', body: html }));
const errors = [], warns = [];
page.on('pageerror', (e) => { errors.push('PAGEERROR ' + e.message + '\n' + (e.stack || '')); });
page.on('console', (m) => {
  const t = m.type(), s = m.text();
  if (t === 'error') errors.push(s); else if (t === 'warning') warns.push(s);
  if (!quiet && (t === 'error' || t === 'warning')) console.log(`[${t}] ${s}`);
});
const T0 = Date.now();
await page.goto('http://game.local/two.html?' + q);
const hook = file.endsWith('rue.html') ? 'RUE_TEST' : 'TWO_TEST';
if (shots) fs.mkdirSync(shots, { recursive: true });
let lastShot = 0, n = 0, lastLog = 0, done = false;
while (Date.now() - T0 < timeout) {
  await page.waitForTimeout(500);
  const st = await page.evaluate((h) => { const t = window[h]; return t ? { ready: t.ready, done: t.done, scene: t.scene, step: t.step, log: t.log.slice() } : null; }, hook).catch(() => null);
  if (st) {
    for (; lastLog < st.log.length; lastLog++) if (!quiet) console.log('  log: ' + st.log[lastLog]);
    if (st.done) { done = true; break; }
  }
  if (shots && every && Date.now() - lastShot > every * 1000) {
    lastShot = Date.now();
    const nm = `${String(n++).padStart(4, '0')}_${(st && st.scene) || 'x'}.png`;
    await page.screenshot({ path: path.join(shots, nm) }).catch(() => {});
  }
}
const secs = ((Date.now() - T0) / 1000).toFixed(1);
console.log(`\n== ${done ? 'DONE' : 'TIMEOUT'} in ${secs}s · ${errors.length} errors · ${warns.length} warnings`);
for (const e of errors.slice(0, 40)) console.log('ERROR: ' + e);
await browser.close();
process.exit(done && !errors.length ? 0 : 1);
