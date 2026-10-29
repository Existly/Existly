/* Shared section builders for the UK pages. */

const CTA = (thin, bold, sub) => `
  <section class="middle-promo-banner">
    <div class="container">
      <h2 class="section-title"><span class="w-thin">${thin}</span> <span class="w-bold">${bold}</span></h2>
      <p class="section-desc">${sub}</p>
      <div style="margin-top:28px;display:flex;gap:12px;flex-wrap:wrap">
        <a href="/uk/contact" class="btn btn-primary">Book a Consultation</a>
        <a href="/uk/how-it-works" class="btn btn-outline-white">See how it works</a>
      </div>
    </div>
  </section>`;

const LOGOS = [
  ['appfolio.webp', 'AppFolio'], ['buildium.webp', 'Buildium'], ['rentvine.webp', 'Rentvine'],
  ['yardi.webp', 'Yardi'], ['guesty.png', 'Guesty'], ['hostaway.webp', 'Hostaway'],
  ['xero.webp', 'Xero'], ['quickbooks.webp', 'QuickBooks'], ['zoho-books.png', 'Zoho Books']
];

const SOFTWARE = `
  <section class="section-padding">
    <div class="container">
      <div class="section-header animate-on-scroll">
        <span class="section-subtitle">Your systems</span>
        <h2 class="section-title"><span class="w-thin">We work inside</span> <span class="w-bold">your existing software</span></h2>
        <p class="section-desc">Nothing new to buy and nothing to migrate. Our team logs into the system you already run and works there. AppFolio, Buildium, Rentvine, Yardi, Guesty, Hostaway, Xero, QuickBooks and Zoho Books are all systems we work in daily.</p>
      </div>
      <div class="software-grid animate-on-scroll">
${LOGOS.map(([f, n]) => `        <div class="software-tile"><img width="200" height="80" loading="lazy" decoding="async" src="/assets/images/software/${f}" alt="${n}"></div>`).join('\n')}
        <div class="software-tile">&hellip;and yours</div>
      </div>
    </div>
  </section>`;

/* An accordion plus the matching FAQPage nodes, so the visible text and the
   structured data can never drift apart. */
function faqBlock(faqs, heading) {
  const html = `
  <section class="section-padding" style="background: var(--color-bg-alt)">
    <div class="container">
      <div class="section-header animate-on-scroll">
        <span class="section-subtitle">FAQ</span>
        <h2 class="section-title"><span class="w-thin">${heading[0]}</span> <span class="w-bold">${heading[1]}</span></h2>
      </div>
      <div class="faq-container">
${faqs.map(([q, a]) => `        <div class="faq-item-box animate-on-scroll">
          <div class="faq-header">
            <span class="faq-question">${q}</span>
            <svg class="faq-toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </div>
          <div class="faq-body"><div class="faq-content">${a}</div></div>
        </div>`).join('\n')}
      </div>
    </div>
  </section>`;

  const schema = {
    '@type': 'FAQPage',
    mainEntity: faqs.map(([q, a]) => ({
      '@type': 'Question', name: q,
      acceptedAnswer: { '@type': 'Answer', text: a.replace(/<[^>]*>/g, '') }
    }))
  };
  return { html, schema };
}

/* Numbered rows, the pattern already used on the US service pages. */
function steps(items) {
  return `
      <div class="value-props-grid">
${items.map((it, i) => `        <div class="value-card no-icon animate-on-scroll">
          <span style="font-family:var(--font-heading);font-weight:200;font-size:22px;color:var(--text-dark-muted)">${String(i + 1).padStart(2, '0')}</span>
          <div><h3>${it[0]}</h3><p>${it[1]}</p></div>
        </div>`).join('\n')}
      </div>`;
}

/* Service rows: name plus what is actually included. */
function serviceRows(rows) {
  return rows.map((r, i) => `
  <section class="service-block${i % 2 ? '' : ''}" id="${r.id}"${i % 2 ? ' style="background: var(--color-bg-alt)"' : ''}>
    <div class="container">
      <div class="section-header animate-on-scroll" style="margin-bottom:28px">
        <span class="service-capsule">${r.tag}</span>
        <h2 class="section-title"><span class="w-thin">${r.thin}</span> <span class="w-bold">${r.bold}</span></h2>
        <p class="section-desc">${r.intro}</p>
      </div>
      <div class="value-props-grid">
${r.items.map(it => `        <div class="value-card animate-on-scroll">
          <svg class="value-icon" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>
          <div><h3>${it[0]}</h3><p>${it[1]}</p></div>
        </div>`).join('\n')}
      </div>
    </div>
  </section>`).join('\n');
}

module.exports = { CTA, SOFTWARE, faqBlock, steps, serviceRows };
