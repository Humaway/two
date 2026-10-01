// Concatenates src/ fragments (sorted by filename) into one self-contained HTML file.
// Engine fragments (00–09, 30–39, 99) share one module scope. Leaf fragments (10–29 sets, 40–59 minigames,
// 60–89 content) must only register into the registries; each is syntax-checked and wrapped in try/catch so one
// broken leaf can't take the whole game down.
// Usage: node tools/build.mjs [--out two.html] [--strict] [--only 10-set-reddy26.js,...] [--quiet]
import fs from 'fs';
import path from 'path';
import vm from 'vm';
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const strict = args.includes('--strict'), quiet = args.includes('--quiet');
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const out = path.resolve(opt('out', path.join(root, 'two.html')));
const srcDir = path.join(root, 'src');
const files = fs.readdirSync(srcDir).filter((f) => /^\d\d-.*\.(js|html)$/.test(f)).sort();
const isLeaf = (f) => { const n = +f.slice(0, 2); return (n >= 10 && n <= 29) || (n >= 40 && n <= 89); };
let html = '', bad = 0;
for (const f of files) {
  let code = fs.readFileSync(path.join(srcDir, f), 'utf8');
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
fs.writeFileSync(out, html);
if (!quiet) console.log(`build: ${files.length} fragments -> ${path.relative(process.cwd(), out)} (${(html.length / 1024).toFixed(0)} KB)${bad ? ` · ${bad} skipped` : ''}`);
