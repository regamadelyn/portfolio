// Post-build checks on dist/:
//  1. No bracketed placeholder text in the HTML.
//  2. None of the NDA terms appear in the output (HTML, JS, CSS, XML, TXT, JSON; the CV PDFs are exempt).
//     Terms are read from a local, git-ignored file `.nda-terms` (one per line) or the NDA_TERMS
//     environment variable (comma-separated). They are never stored in the repo.
import fs from 'node:fs';
import path from 'node:path';

const DIST = path.resolve('dist');
const TEXT = /\.(html|js|css|xml|txt|json|svg|webmanifest)$/i;

const files = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (TEXT.test(e.name)) files.push(p);
  }
})(DIST);

let failed = false;
const rel = (p) => path.relative(DIST, p);

// 1. placeholders: text nodes or attribute values that start with "["
const ph = /(>\s*|=")\[[A-Za-z][^\]<"]{1,200}\]/;
for (const f of files.filter((f) => f.endsWith('.html'))) {
  const html = fs.readFileSync(f, 'utf8').replace(/<script[\s\S]*?<\/script>/g, '');
  const m = html.match(ph);
  if (m) { failed = true; console.error(`✗ placeholder text in ${rel(f)}: ${m[0]}`); }
}

// 2. NDA terms
let terms = [];
if (fs.existsSync('.nda-terms')) terms = fs.readFileSync('.nda-terms', 'utf8').split(/\r?\n/);
if (process.env.NDA_TERMS) terms.push(...process.env.NDA_TERMS.split(','));
terms = terms.map((t) => t.trim()).filter((t) => t && !t.startsWith('#'));
if (!terms.length) {
  console.warn('! NDA check skipped: no terms (add a local .nda-terms file or set NDA_TERMS).');
} else {
  for (const f of files) {
    const text = fs.readFileSync(f, 'utf8').toLowerCase();
    terms.forEach((t, i) => {
      if (text.includes(t.toLowerCase())) { failed = true; console.error(`✗ NDA term #${i + 1} found in ${rel(f)}`); }
    });
  }
}

if (failed) process.exit(1);
console.log(`✓ build checks passed (${files.length} files scanned${terms.length ? `, ${terms.length} NDA term(s)` : ''})`);
