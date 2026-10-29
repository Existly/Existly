/*
 * Generates the /uk section.
 *
 * Content follows the Existly UK Website Blueprint (16 Oct 2026), scoped to
 * "lettings + FM only": Landlords, Letting Agents, FM Businesses, plus How It
 * Works, About and Contact. Short lets and accounting are one-card mentions
 * that link back to the US pages rather than full UK pages.
 *
 * Tenancy wording follows the post-Renters'-Rights-Act regime. Section 21 and
 * assured shorthold tenancies are deliberately NOT marketed: the reforms took
 * effect on 1 May 2026, Section 21 was abolished and existing ASTs converted
 * to assured periodic tenancies. Claims are phrased as "supports compliance",
 * never "legally compliant", and no legal advice is offered.
 */
const fs = require('fs');
const path = require('path');
const { page } = require('./_uk-template');
const { CTA, SOFTWARE, faqBlock, steps, serviceRows } = require('./uk-shared');

const OUT = path.join(__dirname, '..', 'uk');
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT);

const hero = (tag, thin, bold, desc, primary) => `
  <section class="subpage-hero">
    <div class="hero-gradient"></div>
    <div class="container subpage-hero-container animate-on-scroll">
      <span class="section-subtitle">${tag}</span>
      <h1 class="subpage-hero-title"><span class="w-thin">${thin}</span> <span class="w-bold">${bold}</span></h1>
      <p class="subpage-hero-desc">${desc}</p>
      <div style="margin-top:30px;display:flex;gap:12px;flex-wrap:wrap">
        <a href="/uk/contact" class="btn btn-primary">${primary || 'Book a Consultation'}</a>
        <a href="/uk/how-it-works" class="btn btn-outline-white">How it works</a>
      </div>
    </div>
  </section>`;

const written = [];
const write = (slug, html) => {
  fs.writeFileSync(path.join(OUT, slug + '.html'), html, 'utf8');
  written.push('uk/' + slug + '.html');
};

/* ============================================================ HOME ===== */
const homeFaq = faqBlock([
  ['Do you work with landlords directly, or only through agents?',
   'Both. Private landlords use us as the operation behind their portfolio, and letting agents and FM firms use us as a white-label back office that never contacts their clients under our own name.'],
  ['Do I have to change my software?',
   'No. We work inside the system you already run, whether that is AppFolio, Buildium, Rentvine, Yardi, Xero or a spreadsheet. There is nothing to buy and nothing to migrate.'],
  ['How does the Renters&rsquo; Rights Act change what you do?',
   'The reforms that took effect on 1 May 2026 ended assured shorthold tenancies and no-fault Section 21 notices, and converted existing tenancies to assured periodic tenancies. We keep tenancy records, notices and certificates current against the rules as they now stand, and we coordinate anything contentious through your solicitor. We support your compliance; we are not a law firm and do not give legal advice.'],
  ['What is the smallest portfolio you take on?',
   'There is no minimum. Landlords start with as few as five properties, and agencies bring us several hundred.'],
  ['Who holds the client money?',
   'You do. We work inside your accounts and your banking, and we reconcile and report on them. We do not hold client money on your behalf.'],
  ['How quickly do you respond?',
   'Maintenance tickets are triaged around the clock. Routine queries are answered within the working day, and reconciliations are turned around within one business day.']
], ['Questions', 'we get asked']);

write('index', page({
  slug: 'index',
  title: 'Remote Property & Facilities Operations for UK Landlords and Letting Agents | Existly Services',
  description: 'Existly Services runs lettings, maintenance, rent collection, tenancy records and property accounting for UK landlords, letting agents and FM businesses. Your systems, our team, nothing new to buy.',
  usCounterpart: '/property-management',
  schema: [
    { '@type': 'WebSite', '@id': 'https://existlysvc.com/uk/#website', url: 'https://existlysvc.com/uk/',
      name: 'Existly Services UK', publisher: { '@id': 'https://existlysvc.com/#organization' } },
    Object.assign({ '@id': 'https://existlysvc.com/uk/#faq' }, homeFaq.schema)
  ],
  body: `${hero('United Kingdom',
    'Remote property and facilities operations for',
    'UK landlords, letting agents and FM businesses',
    'Your systems, our team, nothing new to buy. We run the lettings, maintenance, rent and reporting work behind your portfolio, so your week is not spent on admin.')}

  <section class="section-padding">
    <div class="container">
      <div class="section-header animate-on-scroll">
        <span class="section-subtitle">What you get</span>
        <h2 class="section-title"><span class="w-thin">Three things we</span> <span class="w-bold">take off your desk</span></h2>
      </div>
      <div class="value-props-grid">
        <div class="value-card no-icon animate-on-scroll"><div><h3>Hassle-free lettings</h3><p>Listings, referencing, tenancy paperwork and check-ins handled end to end, so a property goes from empty to occupied without you chasing anyone.</p></div></div>
        <div class="value-card no-icon animate-on-scroll"><div><h3>Proactive maintenance</h3><p>Round-the-clock ticket triage, vetted local contractors, photo evidence before and after, and the annual safety renewals tracked before they lapse.</p></div></div>
        <div class="value-card no-icon animate-on-scroll"><div><h3>Transparent reporting</h3><p>Itemised landlord statements, monthly profit and loss, and a year-end summary your accountant can use for Self Assessment without rebuilding it.</p></div></div>
      </div>
    </div>
  </section>

  <section class="section-padding" style="background: var(--color-bg-alt)">
    <div class="container">
      <div class="section-header animate-on-scroll">
        <span class="section-subtitle">Who we help</span>
        <h2 class="section-title"><span class="w-thin">Three kinds of</span> <span class="w-bold">UK property business</span></h2>
      </div>
      <div class="featured-grid">
        <a href="/uk/landlords" class="card featured-card animate-on-scroll">
          <div class="featured-card-header">
            <div class="featured-icon-box"><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg></div>
            <h3 class="featured-card-title">Landlords</h3>
            <p class="featured-card-desc">Private landlords and portfolio owners who want the property run properly without employing anyone.</p>
          </div>
          <span class="btn-link">Landlord services &rarr;</span>
        </a>
        <a href="/uk/letting-agents" class="card featured-card animate-on-scroll delay-100">
          <div class="featured-card-header">
            <div class="featured-icon-box"><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path></svg></div>
            <h3 class="featured-card-title">Letting agents</h3>
            <p class="featured-card-desc">A white-label back office working under your brand, so your team stays client-facing.</p>
          </div>
          <span class="btn-link">Agency back office &rarr;</span>
        </a>
        <a href="/uk/fm-businesses" class="card featured-card animate-on-scroll delay-200">
          <div class="featured-card-header">
            <div class="featured-icon-box"><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg></div>
            <h3 class="featured-card-title">FM businesses</h3>
            <p class="featured-card-desc">Job intake, engineer allocation, SLA tracking and invoice administration for facilities firms.</p>
          </div>
          <span class="btn-link">Facilities support &rarr;</span>
        </a>
      </div>
    </div>
  </section>

  <section class="section-padding">
    <div class="container">
      <div class="section-header animate-on-scroll">
        <span class="section-subtitle">How rent reaches you</span>
        <h2 class="section-title"><span class="w-thin">Four steps, every</span> <span class="w-bold">single month</span></h2>
        <p class="section-desc">The same cycle runs on every property, so you always know where the money is.</p>
      </div>
${steps([
    ['Invoice raised', 'Rent demands are generated on schedule against the tenancy record.'],
    ['Tenant notified', 'Reminders go by email, SMS and phone before the due date, not after it.'],
    ['Payment taken', 'Bank transfer, standing order, Direct Debit or card, into your account.'],
    ['Reconciled and paid out', 'Matched, reconciled and disbursed with an itemised statement.']
  ])}
    </div>
  </section>

  <section class="section-padding" style="background: var(--color-bg-alt)">
    <div class="container">
      <div class="section-header animate-on-scroll">
        <span class="section-subtitle">Compliance</span>
        <h2 class="section-title"><span class="w-thin">The paperwork that cannot</span> <span class="w-bold">be allowed to lapse</span></h2>
        <p class="section-desc">We track these dates and chase the certificates. We support your compliance obligations; we are not a law firm and do not give legal advice.</p>
      </div>
      <div class="value-props-grid">
        <div class="value-card no-icon animate-on-scroll"><div><h3>Deposit protection</h3><p>Registered with an approved scheme, with prescribed information issued and recorded.</p></div></div>
        <div class="value-card no-icon animate-on-scroll"><div><h3>Gas safety (CP12)</h3><p>Annual renewal tracked and the certificate served to the tenant.</p></div></div>
        <div class="value-card no-icon animate-on-scroll"><div><h3>EICR and EPC</h3><p>Electrical and energy certificates diarised well before expiry.</p></div></div>
        <div class="value-card no-icon animate-on-scroll"><div><h3>Smoke and CO alarms</h3><p>Checked at the start of a tenancy and logged with photo evidence.</p></div></div>
        <div class="value-card no-icon animate-on-scroll"><div><h3>Right to Rent</h3><p>Checks completed and the evidence stored against the tenancy file.</p></div></div>
        <div class="value-card no-icon animate-on-scroll"><div><h3>Tenancy records</h3><p>Agreements, notices and the How to Rent guide kept current under the Renters&rsquo; Rights Act.</p></div></div>
      </div>
    </div>
  </section>
${SOFTWARE}
${homeFaq.html}
${CTA('Tell us what', 'is eating your week', 'A short call, an honest look at your current setup, and a clear answer on what we would take over first.')}`
}));

/* ======================================================== LANDLORDS ===== */
write('landlords', page({
  slug: 'landlords',
  title: 'Property Management for UK Landlords | Lettings, Rent and Maintenance | Existly Services',
  description: 'Full lettings and property management for UK landlords: Rightmove and Zoopla listings, tenant referencing, tenancy coordination, rent collection, 24/7 maintenance and itemised statements.',
  schema: [{
    '@type': 'Service', '@id': 'https://existlysvc.com/uk/landlords#service',
    name: 'Property Management for UK Landlords',
    description: 'Lettings, tenant referencing, tenancy coordination, rent collection, maintenance coordination and property accounting for UK landlords.',
    provider: { '@id': 'https://existlysvc.com/#organization' },
    areaServed: { '@type': 'Country', name: 'United Kingdom' },
    url: 'https://existlysvc.com/uk/landlords'
  }],
  body: `${hero('For landlords',
    'Hassle-free lettings, steady rental income,',
    'none of the day-to-day',
    'Everything between an empty property and a paid, reconciled month, handled remotely by a team that works inside your systems.')}

  <section class="section-padding">
    <div class="container">
      <div class="section-header animate-on-scroll">
        <span class="section-subtitle">Turnkey overview</span>
        <h2 class="section-title"><span class="w-thin">What a managed</span> <span class="w-bold">portfolio looks like</span></h2>
        <p class="section-desc">Referencing, tenancy administration, rent, maintenance and reporting, run as one operation rather than five separate chores.</p>
      </div>
    </div>
  </section>
${serviceRows([
    { id: 'marketing', tag: 'Letting the property', thin: 'Marketing', bold: 'and listings',
      intro: 'Getting the property seen by the right tenants, quickly, on the portals that matter in the UK.',
      items: [
        ['Portal listings', 'Rightmove, Zoopla and OnTheMarket, with the listing kept accurate while it is live.'],
        ['Written for search', 'Titles and descriptions written so the listing surfaces for the searches that matter.'],
        ['Local advertising', 'Targeted local digital adverts where portal reach is not enough.'],
        ['Viewings and floorplans', 'Virtual viewings and floorplans so applicants self-qualify before they visit.']
      ] },
    { id: 'referencing', tag: 'Choosing the tenant', thin: 'Tenant referencing', bold: 'and placement',
      intro: 'The checks that decide whether the next twelve months are quiet or expensive.',
      items: [
        ['Credit checks', 'Run and recorded against the application.'],
        ['Employment and landlord references', 'Taken up directly, not accepted at face value.'],
        ['Affordability assessment', 'Income tested against the rent before an offer is accepted.'],
        ['Right to Rent', 'Checks completed and evidence stored on the tenancy file.']
      ] },
    { id: 'tenancy', tag: 'Paperwork', thin: 'Tenancy', bold: 'coordination',
      intro: 'Tenancy records kept current under the Renters&rsquo; Rights Act, which replaced assured shorthold tenancies with assured periodic tenancies from 1 May 2026.',
      items: [
        ['Agreements and e-signature', 'Drafted, issued and signed digitally, with copies filed.'],
        ['Prescribed information', 'Deposit paperwork and the How to Rent guide served and logged.'],
        ['Inventory and check-in', 'Independent inventory and schedule of condition, scheduled and recorded.'],
        ['Renewals and rent reviews', 'Diarised ahead of time, with notices prepared to the current rules.']
      ] },
    { id: 'rent', tag: 'Getting paid', thin: 'Rent collection', bold: 'and arrears',
      intro: 'Rent chased before it is late, and escalated properly when it is.',
      items: [
        ['Automated invoicing', 'Demands raised on schedule, with reminders by email, SMS and phone.'],
        ['Flexible payment', 'Bank transfer, standing order, Direct Debit or card.'],
        ['Arrears escalation', 'Reminders, then formal notices and payment plans, coordinated with your solicitor where needed.'],
        ['Itemised statements', 'Every month, showing what came in, what went out and what is owed.']
      ] },
    { id: 'maintenance', tag: 'Keeping it standing', thin: 'Maintenance', bold: 'coordination',
      intro: 'Reported, triaged, attended and evidenced, without the landlord becoming the switchboard.',
      items: [
        ['24/7 ticket triage', 'Logged the moment it arrives, assessed against your spend threshold.'],
        ['Vetted local contractors', 'Dispatched from your approved list, with access arranged with the tenant.'],
        ['Photo evidence', 'Before-and-after inspections attached to the job record.'],
        ['Planned renewals', 'Gas safety, EICR and PAT where required, tracked before expiry.']
      ] }
  ])}
${SOFTWARE}
${CTA('Send us a property', 'and we will tell you what we would do', 'No obligation. We will look at how the property is let, priced and maintained, and say plainly where the time and money are going.')}`
}));

console.log('UK pages written:');
written.forEach(w => console.log('  ' + w));
