// Splits ref/rue.html into ref/rue/NN-name.js fragments at top-level "// ====" markers (reference only).
import fs from 'fs';
const src = fs.readFileSync('ref/rue.html', 'utf8').split('\n');
fs.mkdirSync('ref/rue', { recursive: true });
let start = src.findIndex((l) => l.startsWith('// ============================================================'));
const parts = [{ name: 'head', from: 0, to: start }];
for (let i = start; i < src.length; i++) {
  if (src[i].startsWith('// ============================================================')) {
    if (parts.length) parts[parts.length - 1].to = i;
    const nm = src[i].replace(/^\/\/ =+\s*/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
    parts.push({ name: nm, from: i });
  }
}
parts[parts.length - 1].to = src.length;
parts.forEach((p, k) => {
  const fn = `ref/rue/${String(k).padStart(2, '0')}-${p.name}.${k === 0 ? 'html' : 'js'}`;
  fs.writeFileSync(fn, src.slice(p.from, p.to).join('\n') + '\n');
  console.log(fn, p.to - p.from);
});
