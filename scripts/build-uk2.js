/*
 * /uk pages 3-7: Letting Agents, FM Businesses, How It Works, About, Contact.
 * Content from the Existly UK Website Blueprint (16 Oct 2026).
 */
const fs = require('fs');
const path = require('path');
const { page, UK_PHONE, UK_EMAIL } = require('./_uk-template');
const { CTA, SOFTWARE, faqBlock, steps, serviceRows } = require('./uk-shared');

const OUT = path.join(__dirname, '..', 'uk');
const written = [];
const write = (slug, html) => {
  fs.writeFileSync(path.join(OUT, slug + '.html'), html, 'utf8');
  written.push('uk/' + slug + '.html');
};

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

const svc = (id, name, desc) => ({
  '@type': 'Service', '@id': 'https://existlysvc.com/uk/' + id + '#service',
  name, description: desc,
  provider: { '@id': 'https://existlysvc.com/#organization' },
  areaServed: { '@type': 'Country', name: 'United Kingdom' },
  url: 'https://existlysvc.com/uk/' + id
});

/* =================================================== LETTING AGENTS ===== */
const agentFaq = faqBlock([
  ['Will your team contact our clients under your own name?',
   'No. We work white-label. Correspondence goes out under your brand, from your addresses, and your landlords and tenants deal with your agency throughout.'],
  ['Can you work in our CRM?',
   'Yes. We log into the system you already use and work inside it, so your records stay in one place and nothing has to be migrated.'],
  ['What happens when a member of our team is away?',
   'Cover is the usual reason agencies bring us in. Because the work runs on your system and our documented process, holidays and sick leave stop being a crisis.'],
  ['Do you handle client money?',
   'No. You hold client money and retain your CMP arrangements. We reconcile and report inside your accounts; we do not take custody of funds.']
], ['Agency', 'questions']);

write('letting-agents', page({
  slug: 'letting-agents',
  title: 'White-Label Back Office for UK Letting Agents | Existly Services',
  description: 'A white-label lettings back office for UK agencies: tenancy administration, rent and arrears, maintenance coordination and reporting, delivered under your brand and inside your CRM.',
  schema: [
    svc('letting-agents', 'White-Label Lettings Back Office',
        'Tenancy administration, rent collection and arrears, maintenance coordination and reporting for UK letting agents, delivered white-label inside the agency systems.'),
    Object.assign({ '@id': 'https://existlysvc.com/uk/letting-agents#faq' }, agentFaq.schema)
  ],
  body: `${hero('For letting agents',
    'A back office that works',
    'under your brand',
    'Your team stays client-facing. We run the administration behind them, inside your CRM, under your name.')}

  <section class="section-padding">
    <div class="container">
      <div class="section-header animate-on-scroll">
        <span class="section-subtitle">The problem</span>
        <h2 class="section-title"><span class="w-thin">Agencies rarely lose clients</span> <span class="w-bold">over strategy</span></h2>
        <p class="section-desc">They lose them over a repair nobody booked, a statement that went out late, or a renewal that was missed. That work is unglamorous, constant, and the first thing to slip when someone is on holiday or the portfolio grows faster than the team.</p>
      </div>
    </div>
  </section>
${serviceRows([
    { id: 'admin', tag: 'Day to day', thin: 'Tenancy', bold: 'administration',
      intro: 'The paperwork trail behind every managed property, kept current and filed where your team can find it.',
      items: [
        ['Agreements and renewals', 'Drafted, issued for e-signature and diarised ahead of expiry.'],
        ['Deposit administration', 'Protected with an approved scheme and the prescribed information served.'],
        ['Certificates tracked', 'Gas safety, EICR and EPC chased before they lapse, not after.'],
        ['Records kept current', 'Tenancy files maintained against the rules as they now stand following the Renters&rsquo; Rights Act.']
      ] },
    { id: 'money', tag: 'Money', thin: 'Rent, arrears', bold: 'and reporting',
      intro: 'Collected on time, chased properly, and reported in a form your landlords actually read.',
      items: [
        ['Rent demands and reminders', 'Raised on schedule, with reminders by email, SMS and phone.'],
        ['Arrears escalation', 'A documented ladder of reminders, notices and payment plans.'],
        ['Landlord statements', 'Itemised, on the same date every month.'],
        ['Reconciliation', 'Matched inside your accounts, turned around within one business day.']
      ] },
    { id: 'maintenance-agents', tag: 'Repairs', thin: 'Maintenance', bold: 'coordination',
      intro: 'A single intake point so repairs stop arriving through five different channels.',
      items: [
        ['24/7 intake and triage', 'Logged and assessed against the landlord&rsquo;s spend threshold.'],
        ['Contractor dispatch', 'From your approved list, with access arranged with the tenant.'],
        ['Evidence captured', 'Before-and-after photographs attached to the job.'],
        ['Closed properly', 'Signed off, invoiced and carried into the statement in the right month.']
      ] }
  ])}
  <section class="section-padding">
    <div class="container">
      <div class="section-header animate-on-scroll">
        <span class="section-subtitle">How it feels to your clients</span>
        <h2 class="section-title"><span class="w-thin">Invisible,</span> <span class="w-bold">by design</span></h2>
      </div>
${steps([
    ['Your brand', 'Correspondence goes out under your name, from your addresses.'],
    ['Your systems', 'We work inside your CRM and your accounts. Nothing is migrated.'],
    ['Your client money', 'You keep custody and your CMP arrangements. We reconcile and report.'],
    ['Your escalation', 'Anything contentious comes straight back to you, with the file in order.']
  ])}
    </div>
  </section>
${SOFTWARE}
${agentFaq.html}
${CTA('Send us one managed property', 'and watch how it is handled', 'The quickest way to judge a back office is to give it a single file and see what comes back.')}`
}));

/* ====================================================== FM BUSINESSES === */
const fmFaq = faqBlock([
  ['Which trades do you coordinate?',
   'Plumbing, electrical, gas, HVAC, roofing, drainage, locksmith, decorating and multi-trade. We source and screen engineers, verify compliance documentation, and build their profiles in your FM system.'],
  ['Do you replace our helpdesk?',
   'We can be the helpdesk, or sit behind it. Most FM firms start with out-of-hours and overflow intake, then hand over more of the day once the process is proven.'],
  ['Can you work to our SLAs?',
   'Yes. SLA tracking is the core of the job: jobs are logged against the client&rsquo;s agreed response and completion times, and performance is reported back to you.']
], ['Facilities', 'questions']);

write('fm-businesses', page({
  slug: 'fm-businesses',
  title: 'Back-Office Support for UK Facilities Management Companies | Existly Services',
  description: 'Remote back-office support for UK FM businesses: job intake and triage, engineer allocation, SLA tracking, contractor compliance, supplier invoice processing and reporting.',
  schema: [
    svc('fm-businesses', 'Facilities Management Back-Office Support',
        'Job intake and triage, engineer allocation and scheduling, SLA management, contractor onboarding and compliance, invoice administration and reporting for UK facilities management companies.'),
    Object.assign({ '@id': 'https://existlysvc.com/uk/fm-businesses#faq' }, fmFaq.schema)
  ],
  body: `${hero('For FM businesses',
    'Your reliable back-office partner for',
    'UK facilities management',
    'We work as an extension of your office team, shaped around your existing systems, never a template.')}

  <section class="section-padding">
    <div class="container">
      <div class="section-header animate-on-scroll">
        <span class="section-subtitle">The bottleneck</span>
        <h2 class="section-title"><span class="w-thin">Facilities management is not</span> <span class="w-bold">just dispatching engineers</span></h2>
        <p class="section-desc">It is keeping every job moving from first request to final sign-off. As volumes grow, administration becomes the thing that slows response times and frustrates clients, long before engineer capacity does.</p>
      </div>
    </div>
  </section>
${serviceRows([
    { id: 'coordination', tag: 'Operations', thin: 'Operational', bold: 'coordination',
      intro: 'One intake point, one process, one place where the status of any job can be answered.',
      items: [
        ['Request intake and logging', 'Every job captured the moment it arrives, from any channel.'],
        ['SLA management', 'Logged against the client&rsquo;s agreed response and completion times.'],
        ['Engineer allocation', 'Dispatched to the right trade and scheduled against availability.'],
        ['Work-order tracking', 'Followed through to sign-off, with the client updated as it moves.']
      ] },
    { id: 'contractors', tag: 'Supply chain', thin: 'Engineer recruitment and', bold: 'contractor onboarding',
      intro: 'Finding the trades and getting their paperwork right before they are sent to a client site.',
      items: [
        ['Sourcing and screening', 'Across plumbing, electrical, gas, HVAC, roofing, drainage, locksmith, decorating and multi-trade.'],
        ['Compliance verified', 'Insurance, qualifications and certification checked and recorded.'],
        ['Profiles created', 'Built directly in your FM system so they are ready to dispatch.'],
        ['Kept current', 'Expiring documents chased before they lapse.']
      ] },
    { id: 'compliance-fm', tag: 'Evidence', thin: 'Contractor and', bold: 'compliance management',
      intro: 'The documentation that decides whether a job can be invoiced and defended.',
      items: [
        ['Quotes and approvals', 'Raised, chased and recorded against the job.'],
        ['Follow-on works', 'Captured rather than lost at the end of a visit.'],
        ['Completion evidence', 'Reports, certificates and photographs filed to the work order.'],
        ['Health and safety', 'Documentation collected and stored with the job record.']
      ] },
    { id: 'invoices-fm', tag: 'Money', thin: 'Financial administration and', bold: 'invoice management',
      intro: 'Supplier invoices matched and job costs tracked, so margin is visible per job rather than per quarter.',
      items: [
        ['Supplier invoice processing', 'Received, checked and entered.'],
        ['Matched to work orders', 'Reconciled against the job and the purchase order.'],
        ['Job cost tracking', 'Costs held against the job so margin is visible.'],
        ['Monthly reporting', 'Job status, SLA performance and contractor performance.']
      ] }
  ])}
  <section class="section-padding">
    <div class="container">
      <div class="section-header animate-on-scroll">
        <span class="section-subtitle">Job lifecycle</span>
        <h2 class="section-title"><span class="w-thin">Every job runs</span> <span class="w-bold">the same six steps</span></h2>
      </div>
${steps([
    ['Request', 'Captured from any channel and logged immediately.'],
    ['Triage', 'Assessed for trade, priority and SLA.'],
    ['Allocation', 'Dispatched to the right engineer and scheduled.'],
    ['Attendance', 'Access arranged, client and site notified.'],
    ['Evidence', 'Report, certificate and photographs attached.'],
    ['Invoice', 'Costs matched, job closed and billed.']
  ])}
    </div>
  </section>
${SOFTWARE}
${fmFaq.html}
${CTA('Give us your out-of-hours', 'and see what comes back', 'Most FM firms start with overflow and out-of-hours intake. It is the lowest-risk way to judge whether the process holds.')}`
}));

/* ====================================================== HOW IT WORKS ==== */
write('how-it-works', page({
  slug: 'how-it-works',
  title: 'How It Works | Onboarding a UK Portfolio | Existly Services',
  description: 'How Existly Services takes on a UK portfolio: a free audit of your current setup, a documented onboarding, day-to-day management inside your systems, and monthly reporting.',
  schema: [{
    '@type': 'HowTo', '@id': 'https://existlysvc.com/uk/how-it-works#howto',
    name: 'How Existly Services takes on a UK property portfolio',
    step: [
      { '@type': 'HowToStep', name: 'Audit', text: 'A free review of how your properties are currently let, maintained, collected and reported, and where the time is going.' },
      { '@type': 'HowToStep', name: 'Onboarding', text: 'Access to your existing systems, documented processes, agreed spend thresholds and escalation routes.' },
      { '@type': 'HowToStep', name: 'Management', text: 'Day-to-day lettings, maintenance, rent and tenancy administration run inside your systems by a named team.' },
      { '@type': 'HowToStep', name: 'Reporting', text: 'Itemised monthly statements, management reporting and a year-end summary for Self Assessment.' }
    ]
  }],
  body: `${hero('How it works',
    'No migration, no new software,',
    'no long-term lock-in',
    'We start by looking at what you already have, then take over the parts that are costing you the most time.')}

  <section class="section-padding">
    <div class="container">
      <div class="section-header animate-on-scroll">
        <span class="section-subtitle">Four stages</span>
        <h2 class="section-title"><span class="w-thin">From first call</span> <span class="w-bold">to a managed month</span></h2>
      </div>
${steps([
    ['Audit', 'A free, honest review of how your properties are let, maintained, collected and reported. You get the findings whether or not you go ahead.'],
    ['Onboarding', 'Access to your systems, processes documented, spend thresholds agreed and escalation routes set. Typically a matter of days, not months.'],
    ['Management', 'A named team runs the day-to-day inside your systems. You keep visibility and the final say on anything above threshold.'],
    ['Reporting', 'Itemised statements monthly, management reporting on what moved, and a year-end summary your accountant can use.']
  ])}
    </div>
  </section>

  <section class="section-padding" style="background: var(--color-bg-alt)">
    <div class="container">
      <div class="section-header animate-on-scroll">
        <span class="section-subtitle">Commercial terms</span>
        <h2 class="section-title"><span class="w-thin">What the</span> <span class="w-bold">arrangement looks like</span></h2>
        <p class="section-desc">Plainly stated, because these are the questions everyone asks on the first call.</p>
      </div>
      <div class="value-props-grid">
        <div class="value-card no-icon animate-on-scroll"><div><h3>No setup fee</h3><p>Onboarding is not charged separately for most engagements.</p></div></div>
        <div class="value-card no-icon animate-on-scroll"><div><h3>No long-term commitment</h3><p>There is a contract, but no minimum term. Thirty days&rsquo; written notice ends it.</p></div></div>
        <div class="value-card no-icon animate-on-scroll"><div><h3>No minimum portfolio</h3><p>Landlords start with as few as five properties. Agencies bring several hundred.</p></div></div>
        <div class="value-card no-icon animate-on-scroll"><div><h3>Pilot first, if you prefer</h3><p>A single property or a single function, run properly, before anything wider.</p></div></div>
        <div class="value-card no-icon animate-on-scroll"><div><h3>Your systems</h3><p>We work in your software. Nothing to buy, nothing to migrate.</p></div></div>
        <div class="value-card no-icon animate-on-scroll"><div><h3>Your client money</h3><p>You keep custody and your own CMP arrangements. We reconcile and report.</p></div></div>
      </div>
    </div>
  </section>
${SOFTWARE}
${CTA('Start with the audit', 'it costs nothing', 'We will tell you what we would take over first, and what you should keep in house.')}`
}));

/* ============================================================= ABOUT ==== */
write('about', page({
  slug: 'about',
  title: 'About Existly Services UK | Remote Property Operations Team',
  description: 'Existly Services provides remote property and facilities operations to UK landlords, letting agents and FM businesses, from offices in West Drayton, London and the United States.',
  usCounterpart: '/our-team',
  schema: [{
    '@type': 'AboutPage', '@id': 'https://existlysvc.com/uk/about#page',
    url: 'https://existlysvc.com/uk/about',
    about: { '@id': 'https://existlysvc.com/#organization' }
  }],
  body: `${hero('About us',
    'A back office built for',
    'UK property businesses',
    'Existly Services runs the operational work behind portfolios in the UK and the United States, with a team of more than forty people.')}

  <section class="section-padding">
    <div class="container">
      <div class="section-header animate-on-scroll">
        <span class="section-subtitle">Who we are</span>
        <h2 class="section-title"><span class="w-thin">Operations people,</span> <span class="w-bold">not a marketing agency</span></h2>
        <p class="section-desc">Existly Services has spent more than five years running back-office operations for property businesses. The UK practice covers lettings and facilities management: the administration, coordination and reporting that sits behind a managed portfolio. We work inside our clients&rsquo; systems rather than asking them to adopt ours, and our team operates from our offices rather than as dispersed freelancers.</p>
      </div>
      <div class="value-props-grid">
        <div class="value-card no-icon animate-on-scroll"><div><h3>40+ people</h3><p>A team large enough to cover holidays, sickness and volume spikes.</p></div></div>
        <div class="value-card no-icon animate-on-scroll"><div><h3>5+ years</h3><p>Running property back-office operations across the UK and the US.</p></div></div>
        <div class="value-card no-icon animate-on-scroll"><div><h3>Two offices</h3><p>West Drayton, London and Sugar Land, Texas.</p></div></div>
      </div>
    </div>
  </section>

  <section class="section-padding" style="background: var(--color-bg-alt)">
    <div class="container">
      <div class="section-header animate-on-scroll">
        <span class="section-subtitle">How we handle your data</span>
        <h2 class="section-title"><span class="w-thin">Access, security</span> <span class="w-bold">and accountability</span></h2>
      </div>
      <div class="value-props-grid">
        <div class="value-card no-icon animate-on-scroll"><div><h3>Two-factor authentication</h3><p>Required on every client system we are given access to.</p></div></div>
        <div class="value-card no-icon animate-on-scroll"><div><h3>Role-based access</h3><p>People see the systems their role requires, and nothing beyond it.</p></div></div>
        <div class="value-card no-icon animate-on-scroll"><div><h3>UK GDPR</h3><p>Personal data handled under UK GDPR. See our <a href="/privacy-policy">privacy policy</a>.</p></div></div>
        <div class="value-card no-icon animate-on-scroll"><div><h3>Named contacts</h3><p>A dedicated account manager and a named delivery team, not a ticket queue.</p></div></div>
      </div>
    </div>
  </section>

  <section class="section-padding">
    <div class="container">
      <div class="section-header animate-on-scroll">
        <span class="section-subtitle">UK details</span>
        <h2 class="section-title"><span class="w-thin">Where to</span> <span class="w-bold">find us</span></h2>
      </div>
      <div class="value-props-grid">
        <div class="value-card no-icon animate-on-scroll"><div><h3>UK office</h3><p>3 Zeus Court, West Drayton, London UB7 8FD</p></div></div>
        <div class="value-card no-icon animate-on-scroll"><div><h3>Telephone</h3><p><a href="tel:${UK_PHONE.replace(/-/g, '')}">01895 695970</a></p></div></div>
        <div class="value-card no-icon animate-on-scroll"><div><h3>Email</h3><p><a href="mailto:${UK_EMAIL}">${UK_EMAIL}</a></p></div></div>
      </div>
    </div>
  </section>
${CTA('Talk to the people', 'who would actually run it', 'No sales team. The call is with someone who will be involved in the work.')}`
}));

/* =========================================================== CONTACT ==== */
write('contact', page({
  slug: 'contact',
  title: 'Book a Consultation | Existly Services UK',
  description: 'Book a consultation with Existly Services UK. Remote property and facilities operations for landlords, letting agents and FM businesses. Call 01895 695970.',
  usCounterpart: '/book-online',
  schema: [{
    '@type': 'ContactPage', '@id': 'https://existlysvc.com/uk/contact#page',
    url: 'https://existlysvc.com/uk/contact',
    about: { '@id': 'https://existlysvc.com/#organization' }
  }],
  body: `${hero('Contact',
    'Tell us what is',
    'eating your week',
    'A short call, an honest look at your current setup, and a clear answer on what we would take over first.', 'Book a Consultation')}

  <section class="section-padding" id="contact">
    <div class="container">
      <div class="contact-layout">
        <div class="contact-form-card animate-on-scroll">
          <h2 class="section-title" style="font-size:clamp(1.6rem,3vw,2.2rem)"><span class="w-thin">Send us</span> <span class="w-bold">a message</span></h2>
          <form id="contact-form" novalidate>
            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label" for="firstName">First Name</label>
                <input type="text" id="firstName" name="firstName" class="form-input" required placeholder="Jane">
              </div>
              <div class="form-group">
                <label class="form-label" for="lastName">Last Name</label>
                <input type="text" id="lastName" name="lastName" class="form-input" required placeholder="Doe">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label" for="email">Email</label>
              <input type="email" id="email" name="email" class="form-input" required placeholder="you@agency.co.uk">
            </div>
            <div class="form-group">
              <label class="form-label" for="phone">Phone</label>
              <input type="tel" id="phone" name="phone" class="form-input" required placeholder="07700 900000">
            </div>
            <div class="form-group">
              <label class="form-label" for="subject">How many properties?</label>
              <input type="text" id="subject" name="subject" class="form-input" placeholder="e.g. 12 managed, 3 let-only">
            </div>
            <div class="form-group">
              <label class="form-label" for="message">What is taking the most time right now?</label>
              <textarea id="message" name="message" class="form-input" rows="5" placeholder="Maintenance coordination, arrears, tenancy paperwork&hellip;"></textarea>
            </div>

            <!-- Honeypot: invisible to people, filled by spam bots. Do not remove. -->
            <div class="hp-field" aria-hidden="true">
              <label for="company">Company</label>
              <input type="text" id="company" name="company" tabindex="-1" autocomplete="off">
            </div>

            <button type="submit" class="btn btn-primary" style="width:100%">Send Message</button>
          </form>
        </div>

        <div class="contact-info animate-on-scroll delay-100">
          <div class="contact-info-header">
            <h2>Speak to the UK team</h2>
            <p>We will look at how your portfolio is let, maintained and reported, and tell you plainly where the time is going.</p>
          </div>
          <div class="contact-details-list">
            <div class="contact-detail-item">
              <div><div class="contact-detail-title">Email Us</div>
              <a href="mailto:${UK_EMAIL}" class="contact-detail-value">${UK_EMAIL}</a></div>
            </div>
            <div class="contact-detail-item">
              <div><div class="contact-detail-title">Call Us</div>
              <a href="tel:${UK_PHONE.replace(/-/g, '')}" class="contact-detail-value">01895 695970</a></div>
            </div>
            <div class="contact-detail-item">
              <div><div class="contact-detail-title">Visit Office</div>
              <span class="contact-detail-value">3 Zeus Court, West Drayton, London UB7 8FD</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>`
}));

console.log('UK pages written:');
written.forEach(w => console.log('  ' + w));
