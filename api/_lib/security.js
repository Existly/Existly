// Shared hardening helpers for the two public API endpoints.
// Kept in lib/ rather than api/ — anything inside api/ becomes a live
// serverless route on Vercel, and these are not request handlers.

// Google Sheets treats a leading =, +, -, @, tab or CR as the start of a formula,
// so an attacker-supplied "=HYPERLINK(...)" would execute inside the staff sheet.
// Prefixing with an apostrophe forces the cell to be stored as literal text.
function sheetSafe(value) {
  const str = value == null ? '' : String(value);
  return /^[=+\-@\t\r]/.test(str) ? "'" + str : str;
}

// Escapes values interpolated into notification email HTML.
function escapeHtml(value) {
  const str = value == null ? '' : String(value);
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// As escapeHtml, but keeps line breaks readable in the email body.
function escapeHtmlMultiline(value) {
  return escapeHtml(value).replace(/\r?\n/g, '<br>');
}

// Best-effort in-memory rate limiter.
//
// Caveat worth knowing: Vercel gives each serverless instance its own memory,
// so a caller spread across instances gets a higher effective limit than the
// number below. This is a cheap brake on casual abuse and runaway scripts, not
// a substitute for a real edge rate limiter or CAPTCHA.
const buckets = new Map();
const MAX_TRACKED_KEYS = 5000;

function rateLimit(key, limit, windowMs) {
  const now = Date.now();

  // Drop expired buckets so the map cannot grow without bound.
  if (buckets.size > MAX_TRACKED_KEYS) {
    for (const [k, v] of buckets) {
      if (now - v.start >= windowMs) buckets.delete(k);
    }
  }

  const bucket = buckets.get(key);

  if (!bucket || now - bucket.start >= windowMs) {
    buckets.set(key, { start: now, count: 1 });
    return { allowed: true, retryAfter: 0 };
  }

  bucket.count += 1;

  if (bucket.count > limit) {
    return {
      allowed: false,
      retryAfter: Math.ceil((bucket.start + windowMs - now) / 1000)
    };
  }

  return { allowed: true, retryAfter: 0 };
}

// Vercel puts the real caller first in x-forwarded-for.
function clientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length) {
    return forwarded.split(',')[0].trim();
  }
  return req.headers['x-real-ip'] || req.socket?.remoteAddress || 'unknown';
}

// Rejects requests whose Origin is neither absent (curl, same-origin form posts)
// nor one of ours. Cheap defence against third-party sites driving our endpoints.
//
// The live site is served from existlysvc.com (and existlysvc.co.uk for the UK
// page). existly.com is NOT ours — it currently redirects to a domain-sale
// listing on atom.com — so it must not be trusted here. Getting this list wrong
// silently rejects every real contact-form and chat request with a 403.
const ALLOWED_HOSTS = [
  'existlysvc.com',
  'www.existlysvc.com',
  'existlysvc.co.uk',
  'www.existlysvc.co.uk',
  'localhost:8000',
  '127.0.0.1:8000'
];

function originAllowed(req) {
  const origin = req.headers.origin;
  if (!origin) return true; // no Origin header — not a cross-site browser request

  try {
    return ALLOWED_HOSTS.includes(new URL(origin).host);
  } catch (e) {
    return false;
  }
}

// Lazily construct a client only when its key is present.
//
// Both the Resend and Gemini SDKs are unhappy at construction time without a
// key — Resend throws outright, which used to crash `npm start` before the
// server could listen. Deferring construction lets the site run locally for
// design work with no secrets; the endpoints then degrade with a logged
// warning instead of taking the whole process down.
function lazyClient(envVar, construct) {
  let instance = null;
  return function get() {
    if (!process.env[envVar]) return null;
    if (!instance) instance = construct(process.env[envVar]);
    return instance;
  };
}

module.exports = {
  lazyClient,
  sheetSafe,
  escapeHtml,
  escapeHtmlMultiline,
  rateLimit,
  clientIp,
  originAllowed,
  ALLOWED_HOSTS
};
