/*
 * UK page shell. The UK section targets a different country from the US site,
 * so each page declares GB-specific signals: en-GB language, UK address and
 * phone in schema, areaServed GB, and hreflang pairing with its US counterpart
 * so neither version cannibalises the other in search.
 */
const UK_PHONE = '+44-1895-695970';
const UK_EMAIL = 'info@existlysvc.co.uk';
const SITE = 'https://existlysvc.com';

// Organisation node, UK-facing. Kept at the same @id as the US node: it is the
// same legal entity, and splitting the id would fracture the entity graph.
function orgNode() {
  return {
    '@type': 'ProfessionalService',
    '@id': SITE + '/#organization',
    name: 'Existly Services',
    url: SITE + '/uk/',
    logo: SITE + '/assets/images/logo.png',
    description: 'Remote property and facilities operations for UK landlords, letting agents and FM businesses.',
    email: UK_EMAIL,
    telephone: UK_PHONE,
    address: {
      '@type': 'PostalAddress',
      streetAddress: '3 Zeus Court',
      addressLocality: 'West Drayton',
      addressRegion: 'London',
      postalCode: 'UB7 8FD',
      addressCountry: 'GB'
    },
    areaServed: { '@type': 'Country', name: 'United Kingdom' },
    sameAs: ['https://www.linkedin.com/company/existlyservices', 'https://www.instagram.com/existlysvc']
  };
}

function ld(extra) {
  const graph = [orgNode()].concat(extra || []);
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2)
    .replace(/</g, '\u003c');
}

/**
 * @param {object} o  slug, title, description, usCounterpart, schema[], body
 */
function page(o) {
  const url = `${SITE}/uk/${o.slug === 'index' ? '' : o.slug}`;
  const altUS = o.usCounterpart ? `
  <link rel="alternate" hreflang="en-US" href="${SITE}${o.usCounterpart}">
  <link rel="alternate" hreflang="en-GB" href="${url}">
  <link rel="alternate" hreflang="x-default" href="${SITE}${o.usCounterpart}">` : '';

  return `<!DOCTYPE html>
<html lang="en-GB">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${o.title}</title>
  <meta name="description" content="${o.description}">
  <link rel="stylesheet" href="/style.css">
  <link rel="icon" href="/assets/images/tab_logo.png?v=2" type="image/png">

  <link rel="canonical" href="${url}">${altUS}
  <meta property="og:title" content="${o.title}">
  <meta property="og:description" content="${o.description}">
  <meta property="og:url" content="${url}">
  <meta property="og:type" content="website">
  <meta property="og:image" content="${SITE}/assets/images/logo.png">
  <meta property="og:site_name" content="Existly Services">
  <meta property="og:locale" content="en_GB">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${o.title}">
  <meta name="twitter:description" content="${o.description}">
  <meta name="twitter:image" content="${SITE}/assets/images/logo.png">
  <script type="application/ld+json">
${ld(o.schema)}
  </script>
</head>
<body>

  <header class="header"></header>

${o.body}

  <footer class="footer"></footer>

  <script src="/assets/js/lenis.min.js"></script>
  <script src="/main.js"></script>
  <script src="/consent.js"></script>
</body>
</html>
`;
}

module.exports = { page, SITE, UK_PHONE, UK_EMAIL };
