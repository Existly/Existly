/* ==========================================================================
   Cookie consent + Google Analytics 4
   --------------------------------------------------------------------------
   GA4 sets cookies, so under UK GDPR / PECR it must not run until the visitor
   opts in. This file implements Google Consent Mode v2: consent defaults to
   denied, gtag.js is not loaded at all until the visitor accepts, and the
   choice is remembered in localStorage.

   >>> BEFORE GOING LIVE: replace GA4_MEASUREMENT_ID with the real ID from
   >>> Google Analytics (Admin -> Data Streams -> Web). It looks like G-ABC123XYZ.
   >>> Until then nothing is sent anywhere.
   ========================================================================== */

(function () {
  'use strict';

  var GA4_PLACEHOLDER = 'G-XXXXXXXXXX';
  var GA4_MEASUREMENT_ID = 'G-B3024JNEKD';
  var STORAGE_KEY = 'existly_cookie_consent';
  var CONSENT_VERSION = 1; // bump to re-ask everyone after a policy change

  // --- Consent Mode defaults: deny everything until told otherwise ----------
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;

  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    functionality_storage: 'granted', // strictly necessary only
    security_storage: 'granted',
    wait_for_update: 500
  });

  function readChoice() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var saved = JSON.parse(raw);
      return saved.version === CONSENT_VERSION ? saved : null;
    } catch (e) {
      return null;
    }
  }

  function saveChoice(analytics) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        version: CONSENT_VERSION,
        analytics: analytics,
        decidedAt: new Date().toISOString()
      }));
    } catch (e) { /* private mode — the banner simply reappears next visit */ }
  }

  var gaLoaded = false;

  // True once a real GA4 ID has been pasted in above.
  // Until then the site sets no analytics cookies at all, so there is nothing
  // to ask consent for — and a banner asking about cookies that do not exist
  // would cost conversions for no reason. The banner therefore stays dormant
  // and switches itself on automatically the moment the ID is filled in.
  // Compared against the placeholder explicitly — a pattern test alone is not
  // enough, since "G-XXXXXXXXXX" is itself a well-formed-looking id.
  function analyticsConfigured() {
    return GA4_MEASUREMENT_ID !== GA4_PLACEHOLDER &&
           /^G-[A-Z0-9]{4,}$/.test(GA4_MEASUREMENT_ID);
  }

  function loadAnalytics() {
    if (gaLoaded) return;
    if (!analyticsConfigured()) {
      console.info('[consent] Analytics accepted, but GA4_MEASUREMENT_ID is still the placeholder — nothing loaded.');
      return;
    }
    gaLoaded = true;

    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA4_MEASUREMENT_ID;
    document.head.appendChild(s);

    gtag('js', new Date());
    gtag('config', GA4_MEASUREMENT_ID, { anonymize_ip: true });
  }

  function applyChoice(analytics) {
    gtag('consent', 'update', {
      analytics_storage: analytics ? 'granted' : 'denied'
    });
    if (analytics) loadAnalytics();
  }

  // --- Conversion tracking -------------------------------------------------
  // No-ops until consent is granted, so it is always safe to call.
  window.existlyTrack = function (eventName, params) {
    gtag('event', eventName, params || {});
  };

  // --- Banner --------------------------------------------------------------
  function buildBanner() {
    var banner = document.createElement('div');
    banner.className = 'cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-live', 'polite');
    banner.setAttribute('aria-label', 'Cookie choices');

    banner.innerHTML =
      '<div class="cookie-banner-inner">' +
        '<div class="cookie-banner-text">' +
          '<h2 class="cookie-banner-title">We use cookies</h2>' +
          '<p>Some are needed to make the site work. We would also like to set optional analytics ' +
          'cookies to understand how visitors use the site. We only set these if you accept. ' +
          'Read our <a href="privacy-policy.html">Privacy Policy</a>.</p>' +
        '</div>' +
        '<div class="cookie-banner-actions">' +
          '<button type="button" class="btn btn-outline-dark" data-consent="reject">Reject optional</button>' +
          '<button type="button" class="btn btn-primary" data-consent="accept">Accept all</button>' +
        '</div>' +
      '</div>';

    banner.querySelector('[data-consent="accept"]').addEventListener('click', function () {
      saveChoice(true); applyChoice(true); closeBanner(banner);
    });
    banner.querySelector('[data-consent="reject"]').addEventListener('click', function () {
      saveChoice(false); applyChoice(false); closeBanner(banner);
    });

    return banner;
  }

  // The chat widget is fixed to the bottom-right at a higher z-index than the
  // banner, so while the banner is up the two sit on top of each other. Rather
  // than guess a clearance, measure the banner and publish its height so the
  // stylesheet can lift the chat by exactly that much.
  function setChatClearance(banner) {
    var h = banner ? Math.ceil(banner.getBoundingClientRect().height) : 0;
    // Guard against a bad measurement: a NaN or negative value would make the
    // stylesheet's calc() invalid at computed-value time, which drops the
    // declaration entirely and would leave the chat unpositioned.
    if (!isFinite(h) || h < 0) h = 0;
    document.documentElement.style.setProperty('--cookie-banner-h', h + 'px');
  }

  function closeBanner(banner) {
    banner.classList.remove('is-visible');
    setChatClearance(null);
    if (banner.__ro) { banner.__ro.disconnect(); banner.__ro = null; }
    setTimeout(function () { banner.remove(); }, 300);
  }

  function showBanner() {
    if (document.querySelector('.cookie-banner')) return;
    var banner = buildBanner();
    document.body.appendChild(banner);
    // Force a reflow so the browser registers the starting transform before we
    // flip the class — the slide-up transition then runs. Deliberately not
    // requestAnimationFrame: that never fires in a background tab, which would
    // leave the banner appended but permanently off-screen.
    void banner.offsetHeight;
    banner.classList.add('is-visible');
    setChatClearance(banner);

    // The banner reflows at narrow widths (the actions stack), so its height
    // changes. Re-measure while it is on screen.
    if (window.ResizeObserver) {
      var ro = new ResizeObserver(function () { setChatClearance(banner); });
      ro.observe(banner);
      banner.__ro = ro;
    } else {
      window.addEventListener('resize', function onResize() {
        if (!document.body.contains(banner)) {
          window.removeEventListener('resize', onResize);
          return;
        }
        setChatClearance(banner);
      });
    }
  }

  // Lets the footer "Cookie settings" link reopen the choice at any time.
  window.existlyOpenCookieSettings = showBanner;

  document.addEventListener('DOMContentLoaded', function () {
    var choice = readChoice();
    if (choice) {
      applyChoice(choice.analytics === true);
    } else if (analyticsConfigured()) {
      showBanner();
    }
    // No auto-banner while unconfigured. The footer "Cookie Settings" link
    // still opens it, so the control is never orphaned.

    document.addEventListener('click', function (e) {
      var trigger = e.target.closest('[data-cookie-settings]');
      if (trigger) { e.preventDefault(); showBanner(); }
    });
  });
})();
