// Script fidelity checker: every quoted line in BUILD_PROMPT sections 8–13 must appear verbatim in src/.
// Usage: node tools/check-lines.mjs [--scene 1.1] [--all] [--sections 8] [--json]
// Normalises curly quotes/apostrophes, whitespace and spacing around ^ on both sides, then substring-matches
// each “…” segment against every string literal in src/*.js (joined). Reports missing segments by scene.
import fs from 'fs';
import path from 'path';
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const md = fs.readFileSync(path.join(root, 'docs/BUILD_PROMPT.md'), 'utf8').split('\n');
const norm = (s) => s.replace(/\\([_\[\]*])/g, '$1').replace(/[’‘]/g, "'").replace(/[“”]/g, '"').replace(/\s*\^\s*/g, ' ^ ')
  .replace(/\s+/g, ' ').trim();
// prose quotes in the spec that are not lines
const IGNORE = new Set(['best', 'two (2026)', 'two (2026–2040)', 'Hold this', 'modern', 'Quiet', 'Keep.', 'Again.', 'Role Play', 'Line.', 'hugs', 'hugged', 'feature', 'drone ports']);
// ---- 1. collect segments from the spec
const want = [];
let sec = 0, scene = '?';
for (let i = 0; i < md.length; i++) {
  const l = md[i];
  const h2 = l.match(/^## (\d+)/); if (h2) sec = +h2[1];
  if (/^## 8 \(continued\)/.test(l)) sec = 8;
  if (sec < 8 || sec > 13) continue;
  const h3 = l.match(/^#{3,4} (?:ENDING [AB] — )?([A-Z0-9.]+|PROLOGUE|L\d\d)\b/); if (h3) { scene = h3[1] === 'PROLOGUE' ? 'P' : h3[1]; continue; }
  if (/^\|/.test(l)) continue;   // tables (the endings comparison) quote lines that live in their own scenes
  if (/^#/.test(l) || /Cutscene\s+—\s+“/.test(l) && !/\*\*[A-Z]/.test(l.replace(/\*\*Cutscene[^*]*\*\*/, ''))) continue;
  const segs = [...l.matchAll(/“([^”]+)”/g)].map((m) => m[1]);
  for (const s of segs) {
    if (/^\d\.\d+\\?_/.test(s) || /^[0-9.]+_[a-z]/.test(s.replace(/\\_/g, '_'))) continue; // cutscene ids like 1.1_open
    const n = norm(s).replace(/,$/, '').replace(/(\s*\[(?:YES|NO)\])+$/, '');   // engine yes/no asks show their buttons as buttons
    if (n.length < 2 || IGNORE.has(n)) continue;
    want.push({ scene, sec, line: i + 1, text: n });
  }
}
// ---- 2. collect string literals from src
const lits = [];
for (const f of fs.readdirSync(path.join(root, 'src')).filter((f) => f.endsWith('.js'))) {
  const c = fs.readFileSync(path.join(root, 'src', f), 'utf8');
  let k = 0;
  while (k < c.length) {
    const ch = c[k];
    if (ch === '/' && c[k + 1] === '/') { k = c.indexOf('\n', k); if (k < 0) break; continue; }
    if (ch === '/' && c[k + 1] === '*') { k = c.indexOf('*/', k + 2); if (k < 0) break; k += 2; continue; }
    if (ch === '"' || ch === "'" || ch === '`') {
      let s = '', j = k + 1;
      for (; j < c.length && c[j] !== ch; j++) {
        if (c[j] === '\\') { const e = c[++j]; s += e === 'n' ? '\n' : e === 'u' ? String.fromCharCode(parseInt(c.substr(j + 1, 4), 16)) + ((j += 4), '') : e; }
        else s += c[j];
      }
      lits.push(s); k = j + 1; continue;
    }
    k++;
  }
}
const hay = lits.map(norm).join('\n');
// ---- 3. report
const filt = opt('scene', null), all = args.includes('--all'), secMax = +opt('sections', 13);
const rows = want.filter((w) => (!filt || w.scene === filt) && w.sec <= secMax);
const missing = rows.filter((w) => !hay.includes(w.text));
if (args.includes('--json')) { fs.mkdirSync(path.join(root, 'out'), { recursive: true }); fs.writeFileSync(path.join(root, 'out/lines.json'), JSON.stringify({ total: rows.length, missing }, null, 1)); }
if (args.includes('--counts')) {
  const c = {};
  for (const w of rows) { c[w.scene] ||= [0, 0]; c[w.scene][0]++; if (!hay.includes(w.text)) c[w.scene][1]++; }
  for (const s in c) console.log(s.padEnd(6), 'total', String(c[s][0]).padStart(4), 'missing', String(c[s][1]).padStart(4));
  process.exit(0);
}
const by = {};
for (const m of missing) (by[m.scene] ||= []).push(m);
for (const s in by) {
  console.log(`\n[${s}] ${by[s].length} missing`);
  for (const m of all ? by[s] : by[s].slice(0, 12)) console.log(`  L${m.line}: ${m.text}`);
  if (!all && by[s].length > 12) console.log(`  … ${by[s].length - 12} more (use --all)`);
}
console.log(`\nlines: ${rows.length - missing.length}/${rows.length} present (${missing.length} missing)`);
process.exit(missing.length ? 1 : 0);
