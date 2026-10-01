// Concatenates src/ fragments (sorted by filename) into one self-contained HTML file.
// Engine fragments (00–09, 30–39, 99) share one module scope. Leaf fragments (10–29 sets, 40–59 minigames,
// 60–89 content) must only register into the registries; each is syntax-checked and wrapped in try/catch so one
// broken leaf can't take the whole game down.
// Usage: node tools/build.mjs [--out two.html] [--strict] [--quiet] [--mine 31-ui.js,00-head.html,...]
//   --mine: isolation for parallel work. Only the listed fragments (and any leaf fragment not tracked by git) are read
//   from the working tree; every other tracked fragment is read from the last commit (git HEAD), so someone else's
//   half-finished edit can't break your build. Other people's untracked dev scenes (89-content-dev-*) are left out.
import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { execSync } from 'child_process';
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const strict = args.includes('--strict'), quiet = args.includes('--quiet');
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const out = path.resolve(opt('out', path.join(root, 'two.html')));
const srcDir = path.join(root, 'src');
const mineArg = opt('mine', null), mine = mineArg ? new Set(mineArg.split(',').map((x) => x.trim().replace(/^src\//, ''))) : null;
let tracked = new Set(), headFiles = [];
try { headFiles = execSync('git ls-tree --name-only HEAD src/', { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] }).toString().split('\n').filter(Boolean).map((x) => x.replace(/^src\//, '')); tracked = new Set(headFiles); } catch (e) { /* no git */ }
let files = fs.readdirSync(srcDir).filter((f) => /^\d\d-.*\.(js|html)$/.test(f));
if (mine) {
  for (const f of headFiles) if (!files.includes(f) && /^\d\d-.*\.(js|html)$/.test(f)) files.push(f);   // deleted locally by someone else: keep HEAD's
  files = files.filter((f) => mine.has(f) || tracked.has(f) || !/^89-content-dev-/.test(f));
}
files.sort();
const read = (f) => {
  if (!mine || mine.has(f) || !tracked.has(f)) return fs.readFileSync(path.join(srcDir, f), 'utf8');
  return execSync(`git show HEAD:src/${f}`, { cwd: root, maxBuffer: 64 << 20 }).toString();
};
const isLeaf = (f) => { const n = +f.slice(0, 2); return (n >= 10 && n <= 29) || (n >= 40 && n <= 89); };
let html = '', bad = 0;
for (const f of files) {
  let code = read(f);
  if (f.endsWith('.html')) { html += code; continue; }
  try { new vm.Script(isLeaf(f) ? `{${code}\n}` : code, { filename: f }); }
  catch (e) {
    bad++;
    const msg = `build: ${f}: ${e.message}`;
    if (strict || !isLeaf(f)) { console.error(msg + (e.stack ? '\n' + e.stack.split('\n').slice(0, 3).join('\n') : '')); if (strict || !isLeaf(f)) { if (!isLeaf(f)) process.exit(2); } }
    else { console.warn(msg + ' — SKIPPED'); continue; }
  }
  if (isLeaf(f)) code = `// ---- ${f}\ntry {\n${code}\n} catch (e) { console.error('TWO: fragment ${f} failed', e); }\n`;
  html += (html.endsWith('\n') ? '' : '\n') + code;
}
html += (html.endsWith('\n') ? '' : '\n') + '</script></body></html>\n';
if (strict && bad) process.exit(2);
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, html);
if (!quiet) console.log(`build: ${files.length} fragments -> ${path.relative(process.cwd(), out)} (${(html.length / 1024).toFixed(0)} KB)${bad ? ` · ${bad} skipped` : ''}`);
