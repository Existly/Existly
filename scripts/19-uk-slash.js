/*
 * Fixes an infinite redirect loop that made /uk unreachable in production:
 *
 *   /uk/  -> 308 -> /uk     Vercel's own trailing-slash normalisation
 *   /uk   -> 308 -> /uk/    the "/uk" redirect in vercel.json
 *
 * Vercel serves this project with cleanUrls and the default
 * trailingSlash:false, so the canonical address of the UK home is /uk with
 * no slash, exactly like /uk/landlords and every US page. The redirect was
 * fighting that. Setting trailingSlash:true would end the loop the other
 * way, but it applies site-wide and would move every US URL too, so the
 * slash comes off instead.
 */
const fs = require('fs');
const path = require('path');
const ROOT = 'C:/Users/DELL/OneDrive/Desktop/website redeisgn/existly/';

let fail = 0, touched = 0;
const ok = (l, x) => console.log('  ok    ' + l + (x ? '  ' + x : ''));
const miss = l => { console.log('  MISS  ' + l); fail++; };

/* Only the bare index URL. /uk/landlords and friends already have no
   trailing slash and must not be touched. */
const SUBS = [
  ['href="/uk/"', 'href="/uk"'],
  ['https://existlysvc.com/uk/"', 'https://existlysvc.com/uk"'],
  ['<loc>https://existlysvc.com/uk/</loc>', '<loc>https://existlysvc.com/uk</loc>']
];

/* _archive is a historical backup and is never served, so it keeps the
   URLs it was saved with. node_modules is not ours. */
const SKIP = new Set(['node_modules', '_archive', '_preview', '.git']);

function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { walk(p); continue; }
    if (!/\.(html|xml)$/.test(e.name)) continue;
    let h = fs.readFileSync(p, 'utf8'), n = 0;
    for (const [o, nu] of SUBS) {
      const c = h.split(o).length - 1;
      if (c) { h = h.split(o).join(nu); n += c; }
    }
    if (n) { fs.writeFileSync(p, h, 'utf8'); touched++; console.log('  ' + String(n).padStart(2) + '  ' + path.relative(ROOT, p).replace(/\\/g, '/')); }
  }
}

console.log('\nREWRITING /uk/ -> /uk');
walk(ROOT);
ok('files touched', String(touched));

console.log('\nVERCEL.JSON');
const V = ROOT + 'vercel.json';
const v = JSON.parse(fs.readFileSync(V, 'utf8'));
const before = v.redirects.length;

/* The rule that closes the loop. */
v.redirects = v.redirects.filter(r => !(r.source === '/uk' && String(r.destination).replace(/\/$/, '') === '/uk'));
if (v.redirects.length === before) miss('/uk -> /uk/ redirect not found');
else ok('removed the /uk -> /uk/ redirect', before + ' -> ' + v.redirects.length);

/* Everything that pointed at the slashed form now points at the real one,
   so no redirect lands on another redirect. */
let d = 0;
for (const r of v.redirects) {
  if (typeof r.destination === 'string' && /\/uk\/$/.test(r.destination)) {
    r.destination = r.destination.replace(/\/uk\/$/, '/uk');
    d++;
  }
}
ok('destinations rewritten to /uk', String(d));
fs.writeFileSync(V, JSON.stringify(v, null, 2) + '\n', 'utf8');

/* Nothing anywhere should still address the UK home with a slash. */
console.log('\nCHECK');
let left = 0;
(function scan(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { scan(p); continue; }
    if (!/\.(html|xml|json)$/.test(e.name)) continue;
    const h = fs.readFileSync(p, 'utf8');
    for (const pat of ['href="/uk/"', 'existlysvc.com/uk/"', '>https://existlysvc.com/uk/<', '"/uk/"']) {
      const c = h.split(pat).length - 1;
      if (c) { console.log('  LEFT  ' + path.relative(ROOT, p).replace(/\\/g, '/') + '  ' + pat + ' x' + c); left += c; }
    }
  }
})(ROOT);
if (left) miss(left + ' reference(s) still use /uk/');
else ok('no reference addresses the UK home with a trailing slash');

console.log('\n' + (fail ? fail + ' PROBLEM(S)' : 'clean'));
process.exitCode = fail ? 1 : 0;
