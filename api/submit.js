const { Resend } = require('resend');
const {
  lazyClient,
  sheetSafe,
  escapeHtml,
  escapeHtmlMultiline,
  rateLimit,
  clientIp,
  originAllowed
} = require('./_lib/security');

const getResend = lazyClient('RESEND_API_KEY', (key) => new Resend(key));

const MAX_FIELD_LENGTH = 2000;
const RATE_LIMIT = 5;              // submissions per IP...
const RATE_WINDOW_MS = 10 * 60_000; // ...per 10 minutes

const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!originAllowed(req)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const limit = rateLimit(`submit:${clientIp(req)}`, RATE_LIMIT, RATE_WINDOW_MS);
  if (!limit.allowed) {
    res.setHeader('Retry-After', String(limit.retryAfter));
    return res.status(429).json({ error: 'Too many submissions. Please try again shortly.' });
  }

  try {
    const body = req.body || {};

    // Honeypot: a field hidden from humans. Anything that fills it is a bot.
    // Return success so the bot does not learn it was rejected.
    if (typeof body.company === 'string' && body.company.trim() !== '') {
      return res.status(200).json({ success: true, message: 'Successfully submitted' });
    }

    // Normalise every field to a trimmed, length-capped string so no later
    // step can be handed undefined (this is what silently lost leads before).
    const field = (value) =>
      (value == null ? '' : String(value)).trim().slice(0, MAX_FIELD_LENGTH);

    const firstName = field(body.firstName);
    const lastName = field(body.lastName);
    const email = field(body.email);
    const phone = field(body.phone);
    const subject = field(body.subject);
    const message = field(body.message);

    const name = `${firstName} ${lastName}`.trim();

    if (!name) {
      return res.status(400).json({ error: 'Please provide your name.' });
    }
    if (!isEmail(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    const context = `Subject: ${subject || 'No Subject'}\nMessage: ${message || 'No Message'}`;

    // 1. Send Email via Resend
    try {
      const resend = getResend();
      if (!resend) throw new Error('RESEND_API_KEY is not set');

      await resend.emails.send({
        from: 'Existly Contact Form <onboarding@resend.dev>', // Update to a verified domain when Wix DNS (SPF/DKIM) is in place
        to: 'info@existlysvc.com',
        replyTo: email,
        subject: `🚨 New Contact Form Submission: ${subject || 'No Subject'}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Phone:</strong> ${escapeHtml(phone || 'Not provided')}</p>
          <p><strong>Subject:</strong> ${escapeHtml(subject || 'No Subject')}</p>
          <p><strong>Message:</strong><br>${escapeHtmlMultiline(message || 'No Message')}</p>
        `
      });
    } catch (emailErr) {
      console.error('Failed to send email:', emailErr);
    }

    // 2. Save to Google Sheets
    if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY && process.env.GOOGLE_SHEET_ID) {
      try {
        // Use dynamic import to fix Vercel CJS/ESM compatibility issue
        const { GoogleSpreadsheet } = await import('google-spreadsheet');
        const { JWT } = await import('google-auth-library');

        const serviceAccountAuth = new JWT({
          email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
          key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);
        await doc.loadInfo();
        const sheet = doc.sheetsByIndex[0];
        await sheet.addRow({
          Date: new Date().toISOString(),
          Name: sheetSafe(name),
          Email: sheetSafe(email),
          Phone: "'" + phone,
          Context: sheetSafe(context)
        });
      } catch (sheetErr) {
        console.error('Failed to update Google Sheet:', sheetErr);
      }
    }

    res.status(200).json({ success: true, message: 'Successfully submitted' });

  } catch (error) {
    console.error('Submit API Error:', error);
    res.status(500).json({ error: 'Sorry, I encountered an error processing your request.' });
  }
};
