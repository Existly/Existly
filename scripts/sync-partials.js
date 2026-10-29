#!/usr/bin/env node
/*
 * Writes the shared navbar and footer into every page from a single source.
 *
 * Why this exists: the nav and footer were copy-pasted into every file, and had
 * already drifted into 8 navbar and 6 footer variants across 17 pages. With a
 * US and a UK nav across ~25 pages, hand-maintaining them is not viable.
 *
 * Pages keep being plain static HTML — Vercel still serves them as-is, there is
 * no build step in the deploy. Run this whenever a partial changes:
 *
 *     npm run sync
 *
 * Region matching is on the <header class="header"> and <footer class="footer">
 * wrappers, so no marker comments are needed in the pages.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const P = (f) => fs.readFileSync(path.join(ROOT, 'partials', f), 'utf8').replace(/\s*$/, '');

const NAV_US = P('nav-us.html');
const NAV_UK = P('nav-uk.html');
const FOOT_US = P('footer-us.html');
const FOOT_UK = P('footer-uk.html');

const HEADER_RE = /[ \t]*<header class="header">[\s\S]*?<\/header>/;
const FOOTER_RE = /[ \t]*<footer class="footer">[\s\S]*?<\/footer>/;

// Collect pages: root *.html plus uk/*.html
const pages = [];
for (const f of fs.readdirSync(ROOT)) {
  if (f.endsWith('.html')) pages.push({ file: f, uk: false });
}
const ukDir = path.join(ROOT, 'uk');
if (fs.existsSync(ukDir)) {
  for (const f of fs.readdirSync(ukDir)) {
    if (f.endsWith('.html')) pages.push({ file: path.join('uk', f), uk: true });
  }
}

/* Mark the nav link matching this page as active. The URL a page answers to is
 * its path without .html, with index -> its directory root. */
function markActive(nav, file, isUk) {
  const base = path.basename(file, '.html');
  const self = base === 'index' ? (isUk ? '/uk/' : '/') : `/${isUk ? 'uk/' : ''}${base}`;
  return nav.replace(
    new RegExp(`(<a href="${self.replace(/[/]/g, '\/')}" class="(?:nav-link|dropdown-link))"`),
    '$1 active"'
  );
}

let changed = 0, skipped = [];
for (const { file, uk } of pages) {
  const full = path.join(ROOT, file);
  let html = fs.readFileSync(full, 'utf8');
  const before = html;

  if (!HEADER_RE.test(html) || !FOOTER_RE.test(html)) {
    skipped.push(file + (HEADER_RE.test(html) ? ' (no footer)' : ' (no header)'));
    continue;
  }

  html = html.replace(HEADER_RE, markActive(uk ? NAV_UK : NAV_US, file, uk));
  html = html.replace(FOOTER_RE, uk ? FOOT_UK : FOOT_US);

  if (html !== before) { fs.writeFileSync(full, html, 'utf8'); changed++; }
}

console.log(`synced ${pages.length} pages, ${changed} updated`);
if (skipped.length) console.log('skipped (missing region):\n  ' + skipped.join('\n  '));
