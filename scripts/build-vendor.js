/*
 * /vendor-coordination — US only.
 *
 * Follows the Vendor Coordination Page Flow Blueprint (16 Oct 2026). Prices are
 * published ($500 / $599 / $700 per month) because specific figures are what
 * buyers and AI answer engines quote; "contact us for pricing" is unquotable.
 *
 * Two wording decisions carried from the blueprint's "Points to Confirm":
 *  - "calls answered and quotes sent in English" is rephrased. On a public page
 *    it raises a doubt about the team rather than settling one; the substance
 *    (US business-hours phone cover) is stated instead.
 *  - "inventory purchasing through Home Depot" is kept as written, per the
 *    client's instruction.
 *
 * Testimonials are deliberately omitted: the blueprint flags that permission to
 * name the five vendor companies is unconfirmed, and naming clients without it
 * is not something to guess at.
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SITE = 'https://existlysvc.com';

const PLANS = [
  { name: 'Vendor Coordination', price: 500, badge: null,
    items: ['Jobs coordinated from first call to payment',
            'Phone cover during US business hours, quotes sent same day',
            'New work sourced from PM and FM accounts',
            'Google Business Profile and website',
            'Social media and Meta ads',
            'Invoicing, collections and follow-up',
            'Bookkeeping kept current'] },
  { name: 'Coordination + Job Map', price: 599, badge: null,
    items: ['Everything in Vendor Coordination',
            'Full accounting: inventory purchasing through Home Depot, maintenance markup, accounts receivable and payable, reconciliation',
            'The job map: the day&rsquo;s jobs on one map with the schedule attached',
            'Map kept updated by Existly, setup and training included'] },
  { name: 'Full Service + Job Management Software', price: 700, badge: 'Most Complete',
    items: ['Everything in Coordination + Job Map',
            'Job management software: work orders, calendar, dispatch and invoices in one system',
            'Every job tracked from request to payment',
            'Setup and training included'] }
];

const FAQS = [
  ['What kinds of vendors do you work with?',
   'Handyman, HVAC, plumbing, roofing and other trades. If the work is dispatched to a crew and invoiced to a property manager, it fits.'],
  ['How do you find new work for me?',
   'We build a target list of facilities management and property management companies in your service area, reach out on your behalf, and qualify the job before it reaches you. What lands on your calendar is scheduled and ready to start.'],
  ['Do I have to change my software?',
   'No. We work inside what you already use. On the $700 plan we can set up job management software and train your crew on it, but that is an option rather than a requirement.'],
  ['How fast are invoices sent?',
   'Same day in the format each client expects. Vendors lose money when invoices sit for two weeks, so clearing any existing backlog is part of onboarding.'],
  ['What is not included in the monthly fee?',
   'Meta ad budget is paid by you and billed separately, and domain and hosting are billed at cost. There is no hourly billing and no per-invoice charge.'],
  ['How do I get started?',
   'A discovery call, then setup, then your first coordinated jobs. There is no separate onboarding fee.']
];

const org = {
  '@type': 'ProfessionalService', '@id': SITE + '/#organization',
  name: 'Existly Services', url: SITE + '/',
  telephone: '+1-786-220-2634', email: 'info@existlysvc.com',
  areaServed: { '@type': 'Country', name: 'United States' }
};

const schema = {
  '@context': 'https://schema.org',
  '@graph': [org,
    { '@type': 'Service', '@id': SITE + '/vendor-coordination#service',
      name: 'Vendor Coordination for Trade Contractors',
      description: 'Back-office coordination for trade vendors: new work sourced from property and facilities management accounts, job management from first call to sign-off, and invoicing sent on time.',
      provider: { '@id': SITE + '/#organization' },
      areaServed: { '@type': 'Country', name: 'United States' },
      url: SITE + '/vendor-coordination',
      offers: PLANS.map(p => ({
        '@type': 'Offer', name: p.name, price: String(p.price), priceCurrency: 'USD',
        priceSpecification: {
          '@type': 'UnitPriceSpecification', price: String(p.price),
          priceCurrency: 'USD', unitText: 'MONTH'
        }
      })) },
    { '@type': 'FAQPage', '@id': SITE + '/vendor-coordination#faq',
      mainEntity: FAQS.map(([q, a]) => ({
        '@type': 'Question', name: q,
        acceptedAnswer: { '@type': 'Answer', text: a.replace(/<[^>]*>/g, '') } })) }
  ]
};

const TITLE = 'Vendor Coordination for Trade Contractors | Existly Services';
const DESC = 'Back-office coordination for trade vendors: we bring in new work from property and facilities management accounts, keep every job moving, and send every invoice on time. Plans from $500 per month.';

const serviceBlock = (tag, thin, bold, lead, items) => `
  <section class="service-block">
    <div class="container">
      <div class="section-header animate-on-scroll" style="margin-bottom:28px">
        <span class="service-capsule">${tag}</span>
        <h2 class="section-title"><span class="w-thin">${thin}</span> <span class="w-bold">${bold}</span></h2>
        <p class="section-desc">${lead}</p>
      </div>
      <div class="value-props-grid">
${items.map(i => `        <div class="value-card animate-on-scroll">
          <svg class="value-icon" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>
          <div><h3>${i[0]}</h3><p>${i[1]}</p></div>
        </div>`).join('\n')}
      </div>
    </div>
  </section>`;

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${TITLE}</title>
  <meta name="description" content="${DESC}">
  <link rel="stylesheet" href="/style.css">
  <link rel="icon" href="/assets/images/tab_logo.png?v=2" type="image/png">

  <link rel="canonical" href="${SITE}/vendor-coordination">
  <meta property="og:title" content="${TITLE}">
  <meta property="og:description" content="${DESC}">
  <meta property="og:url" content="${SITE}/vendor-coordination">
  <meta property="og:type" content="website">
  <meta property="og:image" content="${SITE}/assets/images/logo.png">
  <meta property="og:site_name" content="Existly Services">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${TITLE}">
  <meta name="twitter:description" content="${DESC}">
  <meta name="twitter:image" content="${SITE}/assets/images/logo.png">
  <script type="application/ld+json">
${JSON.stringify(schema, null, 2).replace(/</g, '\\u003c')}
  </script>
</head>
<body>

  <header class="header"></header>

  <section class="subpage-hero">
    <div class="hero-gradient"></div>
    <div class="container subpage-hero-container animate-on-scroll">
      <span class="section-subtitle">Vendor Coordination</span>
      <h1 class="subpage-hero-title"><span class="w-thin">We run the back office so you can</span> <span class="w-bold">stay on site and run the jobs</span></h1>
      <p class="subpage-hero-desc">Vendors lose money on missed callbacks, slipping jobs and unsent invoices. We bring in the work, keep it moving, and make sure every invoice goes out on time.</p>
      <div style="margin-top:30px;display:flex;gap:12px;flex-wrap:wrap">
        <a href="/#contact" class="btn btn-primary">Book a Consultation</a>
        <a href="/assets/Maintenance Portfolio.pdf" class="btn btn-outline-white">Download Portfolio</a>
      </div>
    </div>
  </section>

  <section class="section-padding">
    <div class="container">
      <div class="section-header animate-on-scroll">
        <span class="section-subtitle">What changes</span>
        <h2 class="section-title"><span class="w-thin">More work in, less lost to</span> <span class="w-bold">poor follow-up</span></h2>
        <p class="section-desc">One team and one point of contact. Money in on time. Found and trusted online. No in-house admin to hire.</p>
      </div>
      <div class="value-props-grid">
        <div class="value-card no-icon animate-on-scroll"><div><h3>One point of contact</h3><p>A named team that knows your jobs, your clients and your crew.</p></div></div>
        <div class="value-card no-icon animate-on-scroll"><div><h3>Money in on time</h3><p>Invoices out the same day, payments tracked, overdue accounts chased.</p></div></div>
        <div class="value-card no-icon animate-on-scroll"><div><h3>Found and trusted online</h3><p>A working website, a maintained Google Business Profile and an account that looks alive.</p></div></div>
      </div>
    </div>
  </section>
${serviceBlock('Core service', 'Bringing in', 'new work',
  'Most vendors wait for the phone to ring. We go and find the work instead.',
  [['Target list built', 'FM and PM companies in your service area that need reliable trade partners.'],
   ['Outreach on your behalf', 'Introductions made in your name, not ours.'],
   ['Jobs qualified first', 'Scope and expectations checked before the job reaches you.'],
   ['Ready to start', 'Work arrives scheduled, not as a voicemail to return.']])}
${serviceBlock('Core service', 'Job', 'management',
  'Winning work is half of it. The other half is not dropping it. Every job runs the same way, whether it is new or already on the books.',
  [['Logged and qualified', 'New jobs captured the moment they arrive.'],
   ['Work orders tracked', 'Existing jobs followed through rather than forgotten.'],
   ['Dispatched correctly', 'Sent to the right person with the detail they need.'],
   ['Straight onto the calendar', 'As soon as the tenant confirms a time the job is booked, with no round of confirmation calls. Your crew sees it immediately.'],
   ['Clients and tenants updated', 'Kept informed without you doing it.'],
   ['Followed to sign-off', 'Closed properly, with evidence attached.']])}
${serviceBlock('Core service', 'Invoicing', 'and billing',
  'Vendors lose money when invoices take two weeks to go out. Every invoice goes out on time, in the format each client expects.',
  [['Prepared to client requirements', 'Each account has its own format. We use theirs.'],
   ['Sent on time', 'Same day, not at the end of the month.'],
   ['Payments tracked', 'Overdue accounts chased without you making the call.'],
   ['Backlog cleared', 'Existing unsent invoices dealt with during onboarding.']])}

  <section class="section-padding" style="background: var(--color-bg-alt)">
    <div class="container">
      <div class="section-header animate-on-scroll">
        <span class="section-subtitle">Growth services</span>
        <h2 class="section-title"><span class="w-thin">On top of the coordination:</span> <span class="w-bold">easier to find, harder to doubt</span></h2>
      </div>
      <div class="featured-grid">
        <div class="card featured-card animate-on-scroll">
          <div class="featured-card-header">
            <div class="featured-icon-box"></div>
            <h3 class="featured-card-title">Google Business Profile</h3>
            <p class="featured-card-desc">Often the first thing a customer sees. Cleaned up and optimised, with photos, service details and business information, then managed ongoing with review replies and local search ranking work.</p>
          </div>
        </div>
        <div class="card featured-card animate-on-scroll delay-100">
          <div class="featured-card-header">
            <div class="featured-icon-box"></div>
            <h3 class="featured-card-title">Website creation</h3>
            <p class="featured-card-desc">A vendor without a working website loses trust the moment a client checks them out. New build or repair of an existing site, mobile-friendly and fast, with clear services, coverage and contact details.</p>
          </div>
        </div>
        <div class="card featured-card animate-on-scroll delay-200">
          <div class="featured-card-header">
            <div class="featured-icon-box"></div>
            <h3 class="featured-card-title">Social media</h3>
            <p class="featured-card-desc">An empty account reads as a business that is not quite real. Setup from scratch or takeover, consistent posting, and content showing the work you have actually completed.</p>
          </div>
        </div>
      </div>
      <p class="section-desc" style="margin-top:22px">Meta ads on Facebook and Instagram are included from the first plan down in <a href="#pricing">pricing</a>.</p>
    </div>
  </section>

  <section class="section-padding" id="pricing">
    <div class="container">
      <div class="section-header animate-on-scroll">
        <span class="section-subtitle">Simple pricing</span>
        <h2 class="section-title"><span class="w-thin">One flat monthly fee,</span> <span class="w-bold">no hourly billing</span></h2>
        <p class="section-desc">No per-invoice charges and no in-house admin to hire.</p>
      </div>
      <div class="pricing-grid">
${PLANS.map((p, i) => `        <div class="card featured-card${p.badge ? ' is-featured' : ''} animate-on-scroll${i ? ' delay-' + i + '00' : ''}">
          <div class="featured-card-header">
            ${p.badge ? '<span class="service-capsule">' + p.badge + '</span>' : ''}
            <h3 class="featured-card-title">${p.name}</h3>
            <p style="font-family:var(--font-heading);font-weight:800;font-size:2.4rem;letter-spacing:-0.03em;line-height:1;margin:10px 0 4px">$${p.price}</p>
            <p class="featured-card-desc" style="margin-bottom:16px">per month</p>
            <ul style="list-style:none;padding:0;margin:0">
${p.items.map(it => `              <li style="display:flex;gap:10px;align-items:flex-start;margin-bottom:10px;font-size:0.9rem;color:var(--text-dark-secondary)"><span style="color:var(--color-accent);font-weight:700">+</span><span>${it}</span></li>`).join('\n')}
            </ul>
          </div>
          <a href="/#contact" class="btn-link">Start with this plan</a>
        </div>`).join('\n')}
      </div>
      <p class="body-s" style="margin-top:20px;color:var(--text-dark-muted);font-size:0.85rem">Meta ad budget is paid by the vendor and billed separately. Domain and hosting are billed at cost.</p>
    </div>
  </section>

  <section class="section-padding" style="background: var(--color-bg-alt)">
    <div class="container">
      <div class="section-header animate-on-scroll">
        <span class="section-subtitle">Coverage</span>
        <h2 class="section-title"><span class="w-thin">USA-wide,</span> <span class="w-bold">with depth in fifteen cities</span></h2>
        <p class="section-desc">We coordinate vendors nationwide and hold the deepest property and facilities management relationships in the major metros.</p>
      </div>
    </div>
  </section>

  <section class="section-padding">
    <div class="container">
      <div class="section-header animate-on-scroll">
        <span class="section-subtitle">FAQ</span>
        <h2 class="section-title"><span class="w-thin">Questions</span> <span class="w-bold">vendors ask</span></h2>
      </div>
      <div class="faq-container">
${FAQS.map(([q, a]) => `        <div class="faq-item-box animate-on-scroll">
          <div class="faq-header">
            <span class="faq-question">${q}</span>
            <svg class="faq-toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </div>
          <div class="faq-body"><div class="faq-content">${a}</div></div>
        </div>`).join('\n')}
      </div>
    </div>
  </section>

  <section class="middle-promo-banner">
    <div class="container">
      <h2 class="section-title"><span class="w-thin">Tell us where the jobs</span> <span class="w-bold">are slipping</span></h2>
      <p class="section-desc">A short call, an honest look at how work reaches you now, and a clear answer on what we would take over first.</p>
      <div style="margin-top:28px;display:flex;gap:12px;flex-wrap:wrap">
        <a href="/#contact" class="btn btn-primary">Book a Consultation</a>
        <a href="tel:+17862202634" class="btn btn-outline-white">+1 (786) 220 2634</a>
      </div>
    </div>
  </section>

  <footer class="footer"></footer>

  <script src="/assets/js/lenis.min.js"></script>
  <script src="/main.js"></script>
  <script src="/consent.js"></script>
</body>
</html>
`;

fs.writeFileSync(path.join(ROOT, 'vendor-coordination.html'), html, 'utf8');
console.log('wrote vendor-coordination.html');
