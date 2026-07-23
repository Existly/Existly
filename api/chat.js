const { GoogleGenAI, Type } = require('@google/genai');
const { Resend } = require('resend');
const EXISTLY_KNOWLEDGE_BASE = require('./knowledge_base');

// Initialize APIs using Environment Variables
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const resend = new Resend(process.env.RESEND_API_KEY);

const systemPrompt = `You are a friendly, professional AI consultant for 'Existly'.

ABOUT EXISTLY:
We offer 4 core pillars:
1. Online Existence (Web design, digital marketing, local SEO)
2. Property Management (Remote operations, leasing, tenant screening)
3. Short-Term Rentals (Airbnb/VRBO optimization, dynamic pricing)
4. Accounting & Bookkeeping (Virtual bookkeeping, AP/AR)

YOUR GOAL: You are the ultimate lead capture assistant. You must guide every conversation intelligently.

INITIAL GREETING:
If the user's first message is a greeting or a general request for help, you MUST explicitly state your capabilities. Say something like: 
"👋 Hi there! Here is how I can help:
• Find the right service
• Answer your queries
• Have our team contact you
• Book a meeting

How can I help you today?"

PATH A (Contact the Team / General Inquiry):
If the user wants to contact the team or get more info, ask for their information ONE BY ONE. 
First: "Great! Can I get your full name?"
Second: "Thanks! What's the best phone number to reach you? [PHONE_INPUT]" (You MUST append [PHONE_INPUT] exactly)
Third: "Perfect. And finally, your email address?"
Once you have all 3, immediately call the "save_lead" function.

PATH B (Book a Meeting):
If the user wants to schedule/book a meeting:
First: "I'd love to help you book a meeting! To prepare your booking, can I get your full name?"
Second: "Thanks [Name]! And what is your email address?"
Third: "Almost done! Are you looking for services in the UK, US, or from another country?"
Fourth: Once you have their Name, Email, and Location (UK, US, or Other), you MUST generate the personalized Calendly link based on their answer. Output EXACTLY this format: 
If UK: "Awesome! I've prepared your booking. Please click here to pick your preferred time: [Choose Your Time](https://calendly.com/existlysvc-info-i5fb/30min?name=[ENCODED_NAME]&email=[ENCODED_EMAIL])"
If US or Other: "Awesome! I've prepared your booking. Please click here to pick your preferred time: [Choose Your Time](https://calendly.com/existlysvc-info/30min?name=[ENCODED_NAME]&email=[ENCODED_EMAIL])"
Replace [ENCODED_NAME] and [ENCODED_EMAIL] with the URL-encoded values of what they gave you. Do NOT call the save_lead function for bookings.
CRITICAL RULES:
- BE EXTREMELY CONCISE: Maximum 2 short sentences per response. 
- ONLY ask for ONE piece of info at a time. Never ask for name and email at the same time.

ANSWERING QUESTIONS:
If the user asks a question about Existly or its services, you MUST answer it using ONLY the information provided in the EXISTLY KNOWLEDGE BASE below. If the answer is not in the knowledge base, politely say you don't know and offer to have a human team member contact them. Do not hallucinate or invent answers.

${EXISTLY_KNOWLEDGE_BASE}`;

const saveLeadDeclaration = {
  name: "save_lead",
  description: "Saves a new lead's contact information and context. Call this ONLY when the user has explicitly provided their name, email, and phone number.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: "The full name of the lead" },
      email: { type: Type.STRING, description: "The email address of the lead" },
      phone: { type: Type.STRING, description: "The phone number of the lead" },
      context: { type: Type.STRING, description: "A brief summary of what the lead needs based on the chat" }
    },
    required: ["name", "email", "phone", "context"]
  }
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { history, message } = req.body;

    const formattedHistory = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: [...formattedHistory, { role: 'user', parts: [{ text: message }] }],
      config: {
        systemInstruction: systemPrompt,
        tools: [{ functionDeclarations: [saveLeadDeclaration] }]
      }
    });

    let replyText = "";
    const functionCalls = response.functionCalls;

    if (functionCalls && functionCalls.length > 0) {
      const call = functionCalls[0];
      if (call.name === 'save_lead') {
        const { name, email, phone, context } = call.args;
        
        try {
          await resend.emails.send({
            from: 'Existly Bot <onboarding@resend.dev>', // Update to a verified domain when ready
            to: 'info@existlysvc.com',
            subject: '🚨 New Lead Captured by Existly Bot!',
            html: `
              <h2>New Lead Details</h2>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Phone:</strong> ${phone}</p>
              <p><strong>Context:</strong> ${context}</p>
            `
          });
        } catch (emailErr) {
          console.error("Failed to send email:", emailErr);
        }

        // Save to Google Sheets
        if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY && process.env.GOOGLE_SHEET_ID) {
          try {
            // Use dynamic import to fix Vercel CJS/ESM compatibility issue with ky
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

        replyText = "Thank you! I've passed your information to our experts, and someone will reach out shortly. Is there anything else you're curious about in the meantime?";
      }
    } else {
      replyText = response.text;
    }

    res.status(200).json({ reply: replyText });

  } catch (error) {
    console.error("Chat API Error:", error);
    res.status(500).json({ error: "Sorry, I encountered an error processing your request." });
  }
};