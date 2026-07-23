const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { firstName, lastName, email, phone, subject, message } = req.body;

    const name = `${firstName} ${lastName}`.trim();
    const context = `Subject: ${subject || 'No Subject'}\nMessage: ${message || 'No Message'}`;

    // 1. Send Email via Resend
    try {
      await resend.emails.send({
        from: 'Existly Contact Form <onboarding@resend.dev>', // Update to a verified domain when ready
        to: 'info@existlysvc.com',
        subject: `🚨 New Contact Form Submission: ${subject || 'No Subject'}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong><br>${message.replace(/\n/g, '<br>')}</p>
        `
      });
    } catch (emailErr) {
      console.error("Failed to send email:", emailErr);
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
          Name: name,
          Email: email,
          Phone: "'" + phone,
          Context: context
        });
      } catch (sheetErr) {
        console.error("Failed to update Google Sheet:", sheetErr);
      }
    }

    res.status(200).json({ success: true, message: "Successfully submitted" });

  } catch (error) {
    console.error("Submit API Error:", error);
    res.status(500).json({ error: "Sorry, I encountered an error processing your request." });
  }
};