# Existly — Project Documentation

Marketing website for **Existly Services**, an outsourced back-office and digital-growth agency.

- **Live:** https://existly.com
- **Repo:** https://github.com/Alii-Gitt/existly-proj
- **Hosting:** Vercel (auto-deploys on push)
- **Domain/DNS:** Wix (DNS only — Wix does not serve the site)

---

## 1. What it is

A hand-written static website — no framework, no build step, no bundler. 16 standalone HTML pages
share one stylesheet and one JavaScript file, plus two serverless functions for the contact form and
the AI chat widget.

**Services sold:** Branding & Digital Presence · Property Management · Short-Term Rentals ·
Accounting & Bookkeeping · Property Management UK (facilities/FM back-office).

**Contact:** info@existlysvc.com · +1 (786) 220 2634 · 13500 W Airport Blvd, Sugar Land, TX
**UK contact** (on the UK page): 01895 695970 · 3 Zeus Court, West Drayton, London UB7 8FD

---

## 2. Tech stack

| Layer | What's used |
| --- | --- |
| Pages | Plain HTML5, one file per page |
| Styling | Single `style.css` (4,369 lines), CSS custom properties, no preprocessor |
| Client JS | Single `main.js` (871 lines), vanilla — no jQuery, no framework |
| Fonts | Outfit + Plus Jakarta Sans via Google Fonts `@import` in `style.css` |
| Phone inputs | intl-tel-input 23.0.4 via jsDelivr CDN |
| Booking | Calendly inline widget (`book-online.html` only) |
| Chat AI | Google Gemini via `@google/genai` |
| Email | Resend |
| Lead storage | Google Sheets via `google-spreadsheet` |
| Local dev | Express (`server.js`) |
| Deploy | Vercel serverless functions + static hosting |

---

## 3. File layout

```
existly/
├── index.html                  Homepage
├── branding.html               Service: Branding & Digital Presence
├── property-management.html    Service: Property Management (US)
├── short-term-rental.html      Service: Short-Term Rentals
├── accounting.html             Service: Accounting & Bookkeeping
├── facilities-support.html     Service: Property Management UK  ← see note below
├── our-team.html               Leadership profiles
├── careers.html                Careers → external Google Form
├── book-online.html            Calendly booking (UK / US / Other)
├── blog.html                   Blog index
├── blog-*.html                 6 blog articles
│
├── style.css                   All styles
├── main.js                     All client-side behaviour
│
├── api/
│   ├── chat.js                 POST /api/chat   — Gemini chatbot + lead capture
│   ├── submit.js               POST /api/submit — contact form handler
│   └── knowledge_base.js       ~220 Q&A pairs fed to the chatbot as its system prompt
│
├── assets/
│   ├── images/                 ~50 images (logo, illustrations, team photos)
│   ├── video1–7.mp4            Hero background videos
│   └── *.pdf                   Downloadable portfolios
│
├── server.js                   Local dev server
├── vercel.json                 cleanUrls + legacy redirects
└── package.json
```

> **Naming note:** `facilities-support.html` now serves the **UK Property Management** page and the
> nav label reads "Property Management UK". The filename and URL were deliberately left unchanged so
> existing links keep working. Renaming the file would require updating the nav in all 16 pages plus
> adding a redirect in `vercel.json`.

---

## 4. The most important thing to know

**The navbar, footer, and chat widget are copy-pasted into all 16 HTML files.** There is no
templating, no includes, no partials.

| Change type | Files to edit |
| --- | --- |
| Text on one page | 1 file |
| Navbar, footer, or chat widget | **All 16 files** |

Because these blocks are maintained by hand in 16 places, they have already drifted — the footer
heading reads "Our Services" on 6 pages and "Services" on the other 10. When editing a shared block,
change every copy or the drift gets worse.

---

## 5. Page anatomy

Service pages all follow the same shape:

1. **Hero** — background `<video>`, `<h1>` with a coloured `<span>`, CTA button
2. **Value cards** — three `.value-card` tiles
3. **Filter chips** — `.filter-btn` with `data-target="#section-id"`
4. **Service blocks** — `<section class="service-block" id="...">` alternating normal / `.reverse`
   layout and alternating `var(--color-bg-alt)` backgrounds
5. **Promo banner** — `.middle-promo-banner`
6. **Contact form** *(homepage and the UK page only)*
7. **Footer + chat widget**

⚠️ **Filter chips must appear in the same order as their sections in the HTML.** The scrollspy in
`main.js` highlights chips by comparing scroll position against section offsets, so a chip whose
section sits out of order will highlight incorrectly.

---

## 6. `main.js` modules

| Lines | Module |
| --- | --- |
| 8–27 | Injects an SVG chroma-key filter (used by the chat avatar) |
| 43–57 | Sticky header on scroll |
| 62–133 | Mobile menu, nav dropdowns |
| 138–159 | FAQ accordion |
| 164–192 | Scroll reveal animations (`IntersectionObserver`) |
| 199–253 | Service-page filter nav + scrollspy |
| 258–337 | Contact form validation and submit |
| 375–422 | Success modal (built in JS, not in the HTML) |
| 458–557 | Testimonial slider (homepage) |
| 562–679 | Upwork reviews carousel (homepage) |
| 682–699 | Phone input init (intl-tel-input + ipapi.co geolocation) |
| 702–870 | Chat widget |

---

## 7. Backend

### `POST /api/submit` — contact form
Sends an email via Resend to `info@existlysvc.com`, then appends a row to Google Sheets
(Date / Name / Email / Phone / Context). The Sheets step is skipped if its env vars are absent.

### `POST /api/chat` — AI chat widget
Request: `{ history: [{role, content}], message }` → Response: `{ reply }`

Calls Gemini (`gemini-3.1-flash-lite`, non-streaming) with `knowledge_base.js` inlined into the
system prompt on **every request**. Exposes a `save_lead` tool that writes to the same email +
Sheets sinks. A `[PHONE_INPUT]` marker in the reply tells the frontend to swap the text box for a
phone input.

### Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `GEMINI_API_KEY` | Yes | Gemini API access |
| `RESEND_API_KEY` | Yes | Transactional email |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Optional | Google Sheets auth |
| `GOOGLE_PRIVATE_KEY` | Optional | Google Sheets auth |
| `GOOGLE_SHEET_ID` | Optional | Target spreadsheet |
| `PORT` | No | Local dev port (default 8000) |

Set these in the Vercel dashboard for production, and in a local `.env` for development.
`.gitignore` excludes all `.env*` files — never commit secrets.

---

## 8. Local development

```bash
npm install
npm start
```

Serves at `http://localhost:8000`. `server.js` mounts `/api/chat` and `/api/submit` so the
serverless functions can be tested locally. Without real env vars, the pages render fine but the
form and chatbot will error.

---

## 9. Deployment

Vercel watches the GitHub repo and redeploys on every push to the production branch. There is no
build step — HTML/CSS/JS are served as-is and `api/*.js` become serverless functions. A deploy
takes about a minute.

**Nothing needs doing on Wix.** It only holds the DNS record pointing at Vercel.

`vercel.json` sets `cleanUrls: true` (so `/accounting` works without `.html`) and holds ten
permanent redirects from old capitalised URLs.

### ⚠️ This working folder is not a git clone

`C:\Users\DELL\Desktop\existly` has no `.git` directory, so it has no link to the repo and no way to
tell whether it is behind what is already on GitHub.

**Upload only the specific files you changed.** Never bulk-upload the whole folder — if anyone has
pushed to the repo since this copy was made, a bulk upload silently reverts their work. Also keep
these out of any upload: `node_modules`, `.claude/`, `.env*`, and any source PDFs sitting in the
root (they would become publicly downloadable).

---

## 10. Known issues

Recorded from a full read of the codebase. None are currently fixed.

### Bugs

1. **Contact-form phone numbers submit without their country code.** `main.js:299` calls
   `window.intlTelInputGlobals`, which was removed in intl-tel-input v20 — the site loads v23.0.4,
   so the guard is always false. Fix: `window.intlTelInput.getInstance(phoneInput)`. The chat widget
   is unaffected (it holds a direct `iti` reference).
2. **An empty message silently loses the lead.** `api/submit.js:28` calls `message.replace()` on an
   optional field. The throw is swallowed and the endpoint still returns `{ success: true }`.
3. **Empty chat reply on unexpected tool calls.** `api/chat.js` leaves `replyText` as `""` if a
   function call arrives whose name isn't `save_lead`, so the user sees a generic error.
4. **`api/knowledge_base.js` is published as a route.** Anything in `api/` becomes a serverless
   function on Vercel, but this file exports a string, not a handler. It belongs in a `lib/` folder.
5. **`google-auth-library` is imported but not declared** in `package.json` — it only resolves
   transitively via `@google/genai`.
6. **Unused dependencies:** `cors`, `pdf-parse`, `xlsx`, `puppeteer` are declared but never imported.

### Security

7. **DOM XSS in the chat transcript.** `main.js:741` assigns model output to `innerHTML`, and the
   markdown-link regex puts unsanitised text into `href`. Reachable via prompt injection, and
   replayed from `sessionStorage` on reload.
8. **Google Sheets formula injection.** Only `Phone` is escaped with a leading `'`. `Name`, `Email`
   and `Context` are written raw, so `=HYPERLINK(...)` executes in the staff sheet.
9. **Both endpoints are unauthenticated and unthrottled** — no validation, rate limit, CAPTCHA,
   honeypot, or origin check. `/api/chat` accepts an unbounded caller-supplied `history`, which is a
   paid-token amplification risk.
10. **Emails send from `onboarding@resend.dev`**, Resend's shared sandbox sender. Hurts
    deliverability and is trivially spoofable. Move to a verified domain.

### Content & SEO

11. **UK contact links contradict their display text** on `facilities-support.html`: shows
    `Info@existlysvc.co.uk` but links to `.com`; shows `01895 695970` but dials `+1 786 220 2634`.
12. **Canonical URLs point at `.html`** while `cleanUrls` serves extensionless URLs and the redirect
    map targets the extensionless form. Both URLs are live and self-canonicalise inconsistently.
13. **No structured data at all** — no JSON-LD (`Organization`, `FAQPage`, `BlogPosting`), no Twitter
    Cards, no `sitemap.xml`, no `robots.txt`.
14. **Two orphaned blog posts** — `blog-losing-money.html` and `blog-minimizing-vacancy.html` are
    linked only from `blog.html`, never from another article's "Recent Posts".
15. **`careers.html:23`** — the `og:description` has a mangled tail pasted in from `book-online.html`.
16. **Footer says `© 2026`**, hardcoded in all 16 files.

---

## 11. Change log

### 2026-08-07

**Removed false remote-work claims.** The careers page advertised "Remote-First Flexibility" while
the chatbot correctly answered that there are no remote openings. The company works from a physical
office.
- `careers.html` — "Remote-First Flexibility" → "On-Site Collaboration", with new body copy;
  "remote-first team" → "in-office team"
- `api/knowledge_base.js` — "Our team operates remotely…" → "Our team works on-site from our
  offices…"

Mentions of *remote service delivery* ("remote property operations") were left alone — those
describe how the service is delivered to clients and remain accurate.

**Rebuilt `facilities-support.html` as the UK Property Management page**, from the
*Existly - Property Management (UK)* source document. Eleven sections: intro, Lettings Coordination,
Short-Term & Holiday Lets, Marketing & Listings, Tenancy Coordination, Maintenance Coordination,
Facilities Operations Support, Rent Collection (+ 4-step process), Check-In / Check-Out, Property
Accounting & Arrears, and Landlord & Tenant Communication. UK spelling and terminology throughout
(Rightmove/Zoopla/OnTheMarket, AST, Right to Rent, CP12, EICR, EPC, Section 8/21). The navbar,
footer, chat widget and UK contact block were preserved unchanged.

**Renamed the nav service label** from "Facilities Support" to "Property Management UK" across all
16 pages. Label text only — every `href` still points to `facilities-support.html`, and the homepage
service card and footer link were deliberately left as they were.
