/*
 * Two changes the user asked for:
 *   1. The US site goes back to how it was, keeping Vendor Coordination.
 *   2. The UK comes off the US site entirely and lives only at /uk/,
 *      reachable through one footer link that mirrors the "Existly US"
 *      link the UK footer already carries.
 *
 *   node 18-separate.js            -> writes _preview/, touches nothing live
 *   node 18-separate.js --apply    -> edits the real files
 *
 * Run order matters on apply: index.html is restored first, then the
 * partials are edited, then `npm run sync` stamps the new nav and footer
 * onto all 24 pages. Sync last, or it gets overwritten.
 */
const fs = require('fs');
const path = require('path');
const ROOT = 'C:/Users/DELL/OneDrive/Desktop/website redeisgn/existly/';
const APPLY = process.argv.includes('--apply');

let fail = 0;
const ok = (l, x) => console.log('  ok    ' + l + (x ? '  ' + x : ''));
const miss = l => { console.log('  MISS  ' + l); fail++; };

/* In preview mode every write lands in _preview/ under the same relative
   path, so the preview server serves it from a parallel tree. */
function out(rel, text) {
  const p = APPLY ? ROOT + rel : ROOT + '_preview/' + rel;
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, text, 'utf8');
}
const read = rel => fs.readFileSync(ROOT + rel, 'utf8');

/* -------------------------------------------------------------- partials */
console.log('\nPARTIALS');

/* The dropdown was reordered in an earlier pass. Rather than unpick that
   with index arithmetic, sort by the order the site originally had and
   drop anything not on the list, which is how /uk/ leaves. */
const CANON = ['/branding', '/property-management', '/short-term-rental',
               '/accounting', '/vendor-coordination'];
let nav = read('partials/nav-us.html');
{
  const OPEN = '<div class="dropdown-menu">';
  const i = nav.indexOf(OPEN);
  const j = i < 0 ? -1 : nav.indexOf('</div>', i + OPEN.length);
  if (i < 0 || j < 0) miss('nav dropdown bounds');
  else {
    const links = nav.slice(i + OPEN.length, j).split(/(?=<a href=)/).filter(s => s.trim());
    const href = s => (s.match(/href="([^"]*)"/) || [, ''])[1];
    const kept = CANON.map(h => links.find(s => href(s) === h));
    if (kept.some(s => !s)) miss('nav: missing ' + CANON.filter((h, k) => !kept[k]).join(', '));
    else if (!links.some(s => href(s) === '/uk/')) miss('nav: no /uk/ link to remove');
    else {
      const name = s => (s.match(/>\s*([A-Z][^<]*?)\s*<\/a>/) || [, '?'])[1];
      nav = nav.slice(0, i + OPEN.length) + kept.join('') + nav.slice(j);
      ok('nav-us dropdown', links.length + ' -> ' + kept.length + ':  ' + kept.map(name).join(', '));
      out('partials/nav-us.html', nav);
    }
  }
}

let foot = read('partials/footer-us.html');
{
  const UK_SERVICE = '\n            <li><a href="/uk/" class="footer-link">Property Management UK</a></li>';
  if (!foot.includes(UK_SERVICE)) miss('footer: UK service link not found');
  else { foot = foot.replace(UK_SERVICE, ''); ok('footer-us: UK out of Services list'); }

  /* The mirror of the UK footer's own "Existly US" link, same column,
     same position, same markup. Nothing new to style. */
  const LEGAL = '            <li><a href="/privacy-policy" class="footer-link">Privacy Policy</a></li>\n';
  const ADD = '            <li><a href="/uk/" class="footer-link">Existly UK</a></li>\n';
  if (foot.includes(ADD)) ok('footer-us: Existly UK link already present');
  else if (!foot.includes(LEGAL)) miss('footer: Legal column not found');
  else { foot = foot.replace(LEGAL, LEGAL + ADD); ok('footer-us: Existly UK link added to Legal'); }
  out('partials/footer-us.html', foot);
}

/* ------------------------------------------------------------ US schema */
/* Every US page carries an Organization block listing a US and a GB address
   and serving both countries. On a US-only site it should describe the US
   business; the /uk/ pages already carry a GB-only copy of their own. */
function stripSchemaUK(h, label) {
  const ADDR = /"address": \[\s*\{([\s\S]*?"addressCountry": "US"\s*)\},\s*\{[\s\S]*?"addressCountry": "GB"\s*\}\s*\]/;
  const AREA = /"areaServed": \[\s*\{\s*"@type": "Country",\s*"name": "United States"\s*\},\s*\{\s*"@type": "Country",\s*"name": "United Kingdom"\s*\}\s*\]/;
  let n = 0;
  if (ADDR.test(h)) { h = h.replace(ADDR, (m, us) => '"address": {' + us + '}'); n++; }
  if (AREA.test(h)) {
    h = h.replace(AREA, '"areaServed": {\n        "@type": "Country",\n        "name": "United States"\n      }');
    n++;
  }
  if (n !== 2) miss('schema ' + label + ' (' + n + '/2)');
  return h;
}

/* ------------------------------------------------------------ home page */
console.log('\nHOME');
/* Restored from the pre-niche archive: the hero, the ten industries and the
   original copy all come back. Vendor Coordination was already card 6 there,
   so it survives the revert untouched. */
let h = read('_archive/index.pre-niche.html');
{
  const C5 = '        <!-- Card 5 -->', C6 = '        <!-- Card 6 -->';
  const a = h.indexOf(C5), b = h.indexOf(C6);
  if (a < 0 || b < 0) miss('card bounds');
  else if (!h.slice(a, b).includes('Property Management UK')) miss('card 5 is not the UK card');
  else {
    /* Six cards become five. style.css:773 already centres the last two
       under the first three, and the 01..05 numbers are a CSS counter,
       so neither the grid nor the numbering needs touching. */
    h = h.slice(0, a) + h.slice(b);
    h = h.replace(C6, C5).replace(
      '        <!-- Card 5 -->\n        <div class="card featured-card animate-on-scroll">',
      '        <!-- Card 5 -->\n        <div class="card featured-card animate-on-scroll delay-400">');
    ok('UK service card removed', '6 cards -> 5');
  }
  h = stripSchemaUK(h, 'index');
  /* In preview the page is standalone, so the nav and footer have to be
     patched into it directly. On apply, `npm run sync` does that instead. */
  if (!APPLY) {
    h = h.replace(/\n\s*<li><a href="\/uk\/" class="footer-link">[^<]*<\/a><\/li>/, '')
         .replace(/(\n\s*<li><a href="\/privacy-policy"[^\n]*\n)/,
                  '$1            <li><a href="/uk/" class="footer-link">Existly UK</a></li>\n');
    const OPEN = '<div class="dropdown-menu">';
    const i = h.indexOf(OPEN), j = h.indexOf('</div>', i + OPEN.length);
    const links = h.slice(i + OPEN.length, j).split(/(?=<a href=)/).filter(s => s.trim());
    h = h.slice(0, i + OPEN.length)
      + links.filter(s => !/href="\/uk\//.test(s)).join('') + h.slice(j);
  }
  const left = [...new Set(h.match(/United Kingdom|West Drayton|UB7 8FD|Zeus Court|Property Management UK/g) || [])];
  if (left.length) miss('UK traces on home: ' + left.join(', '));
  else ok('no UK traces on home');
  out('index.html', h);
}

/* ------------------------------------------------- schema on every other US page */
console.log('\nSCHEMA, REMAINING US PAGES');
{
  const pages = fs.readdirSync(ROOT).filter(f => f.endsWith('.html') && f !== 'index.html');
  let n = 0;
  for (const f of pages) {
    const src = read(f);
    if (!/"addressCountry": "GB"/.test(src)) continue;
    out(f, stripSchemaUK(src, f));
    n++;
  }
  ok('GB address + UK areaServed removed', 'from ' + n + ' pages');
}

/* ----------------------------------------------------------- book-online */
console.log('\nBOOKING');
{
  /* The page asks "UK or another country?" before showing any calendar.
     With the UK on its own site that question belongs on /uk/contact, so
     the US page opens straight onto the US calendar. */
  let b = read('book-online.html');
  const PICK = '        <div id="location-selection"';
  const a = b.indexOf(PICK);
  const z = b.indexOf('</div>\n\n        <!-- Calendly widget wrapper -->', a);
  if (a < 0 || z < 0) miss('picker bounds');
  else { b = b.slice(0, a) + b.slice(z + 6).replace(/^\n\n/, '\n'); ok('country picker removed'); }

  b = b.replace('<div id="calendly-widget-wrapper" style="display: none;',
                '<div id="calendly-widget-wrapper" style="display: block;');
  if (!b.includes('function loadCalendly')) miss('loadCalendly definition');
  else if (b.includes("loadCalendly('us');\n        </script>")) ok('US calendar already auto-loads');
  else {
    b = b.replace('</script>\n      </div>', "  loadCalendly('us');\n        </script>\n      </div>");
    ok('US calendar loads on open');
  }
  /* loadCalendly still reads a hidden element the picker owned. */
  b = b.replace("document.getElementById('location-selection').style.display = 'none';",
                "var sel = document.getElementById('location-selection');\n            if (sel) sel.style.display = 'none';");
  b = stripSchemaUK(b, 'book-online');
  out('book-online.html', b);
}

/* ------------------------------------------------- UK keeps its own calendar */
console.log('\nUK');
{
  /* The UK Calendly link lives only on the US booking page today, so moving
     the picker off it would leave UK visitors with no calendar at all. */
  let c = read('uk/contact.html');
  if (c.includes('existlysvc-info-i5fb')) ok('uk/contact already has the UK calendar');
  else {
    const anchor = '<form id="contact-form" novalidate>';
    if (!c.includes(anchor)) miss('uk/contact form anchor');
    else {
      const BLOCK = [
        '<div class="calendly-container" style="margin-bottom:40px">',
        '          <div class="calendly-inline-widget" data-url="https://calendly.com/existlysvc-info-i5fb/30min?hide_event_type_details=1&amp;hide_gdpr_banner=1" style="min-width:320px;height:750px"></div>',
        '          <script type="text/javascript" src="https://assets.calendly.com/assets/external/widget.js" async></script>',
        '        </div>',
        '        '
      ].join('\n');
      /* Sits above the message form, so booking is the first option. */
      c = c.replace('        ' + anchor, '        ' + BLOCK + anchor);
      ok('uk/contact: UK calendar added above the form');
    }
  }
  out('uk/contact.html', c);

  /* The UK blueprint: "US office -> Remove from the main UK flow." */
  let a = read('uk/about.html');
  const SUBS = [
    ['from offices in West Drayton, London and the United States.',
     'from our office in West Drayton, London.'],
    ['Existly Services runs the operational work behind portfolios in the UK and the United States, with a team of more than forty people.',
     'Existly Services runs the operational work behind property portfolios, with a team of more than forty people.'],
    ['<h3>5+ years</h3><p>Running property back-office operations across the UK and the US.</p>',
     '<h3>5+ years</h3><p>Running back-office operations for property businesses.</p>'],
    ['<h3>Two offices</h3><p>West Drayton, London and Sugar Land, Texas.</p>',
     '<h3>Our office</h3><p>3 Zeus Court, West Drayton, London UB7 8FD.</p>']
  ];
  for (const [o, n] of SUBS) {
    const c2 = a.split(o).length - 1;
    if (!c2) miss('uk/about: ' + o.slice(0, 44) + '...');
    else { a = a.split(o).join(n); ok('uk/about', '"' + o.slice(0, 38) + '..."' + (c2 > 1 ? ' (x' + c2 + ')' : '')); }
  }
  /* Prose only. The hreflang="en-US" tag and the "Existly US" footer link
     are both deliberate and stay. */
  const usLeft = [...new Set(a.match(/United States|Sugar Land|Texas/g) || [])];
  if (usLeft.length) miss('uk/about still names the US: ' + usLeft.join(', '));
  else ok('uk/about: no US references in the copy');
  out('uk/about.html', a);
}

console.log('\n' + (fail ? fail + ' PROBLEM(S) — not applying' : 'clean')
  + '  |  mode: ' + (APPLY ? 'APPLIED IN PLACE' : 'preview only (_preview/)'));
process.exitCode = fail ? 1 : 0;
