# Existly — Project Documentation

Marketing website for **Existly Services**, an outsourced back-office and digital-growth agency.

- **Live:** https://existly.com
- **Repo:** https://github.com/Alii-Gitt/existly-proj
- **Hosting:** Vercel (auto-deploys on push)
- **Domain/DNS:** Wix (DNS only — Wix does not serve the site)

---

## 1. What it is

A hand-written static website — no framework, no build step, no bundler. 17 standalone HTML pages
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
| Styling | Single `style.css` (4714 lines), CSS custom properties, no preprocessor |
| Client JS | Single `main.js` (931 lines), vanilla — no jQuery, no framework |
| Fonts | Archivo (display) + Inter (body) via Google Fonts `@import` in `style.css` |
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
├── privacy-policy.html         Privacy policy + cookie information
│
├── style.css                   All styles
├── main.js                     All client-side behaviour
├── consent.js                  Cookie consent gate + GA4 (Consent Mode v2)
│
├── api/
│   ├── chat.js                 POST /api/chat   — Gemini chatbot + lead capture
│   ├── submit.js               POST /api/submit — contact form handler
│   └── _lib/                   NOT routes — Vercel skips underscore-prefixed
│       ├── knowledge_base.js   ~220 Q&A pairs fed to the chatbot as its system prompt
│       └── security.js         Escaping, rate limiting, origin checks, lazy clients
│
├── assets/
│   ├── images/                 WebP served; _source/ holds the PNG/JPEG masters (not deployed)
│   ├── video1–7.mp4            Hero background videos
│   └── *.pdf                   Downloadable portfolios
│
├── robots.txt                  Allows all, disallows /api/, points at the sitemap
├── sitemap.xml                 All 17 pages, extensionless URLs
├── server.js                   Local dev server
├── vercel.json                 cleanUrls + legacy redirects
└── package.json
```

> **Naming note:** `facilities-support.html` now serves the **UK Property Management** page and the
> nav label reads "Property Management UK". The filename and URL were deliberately left unchanged so
> existing links keep working. Renaming the file would require updating the nav in all 17 pages plus
> adding a redirect in `vercel.json`.

---

## 4. The most important thing to know

**The navbar, footer, and chat widget are copy-pasted into all 17 HTML files.** There is no
templating, no includes, no partials.

| Change type | Files to edit |
| --- | --- |
| Text on one page | 1 file |
| Navbar, footer, or chat widget | **All 17 files** |

Because these blocks are maintained by hand in 17 places, they drift. The footer heading had split
into "Our Services" on 7 pages and "Services" on the other 10 before being normalised to "Services"
on 2026-08-16. When editing a shared block, change every copy or the drift comes back.

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

Recorded from a full read of the codebase. See §11 for what the 2026-08-16 pass fixed.

### ✅ Fixed 2026-08-16

1. ~~Contact-form phone numbers submit without their country code.~~ `main.js` now uses
   `window.intlTelInput.getInstance()`, the v20+ API matching the v23.0.4 the site loads.
2. ~~An empty message silently loses the lead.~~ Every field is normalised to a trimmed,
   length-capped string before use, so nothing can be handed `undefined`.
3. ~~Empty chat reply on unexpected tool calls.~~ Unrecognised tool names now fall back to the
   model text, and an empty reply gets a generic rephrase prompt.
4. ~~`api/knowledge_base.js` is published as a route.~~ Moved to `api/_lib/`. Vercel does not
   route underscore-prefixed paths, and `api/` is not static-served — so it is neither a
   function nor downloadable. `server.js` blocks GETs under `/api/` to match locally.
7. ~~DOM XSS in the chat transcript.~~ `appendMessage` builds DOM nodes; all non-link text goes
   in as text nodes, and link hrefs are restricted to `http(s)` via the URL parser. Verified by
   replaying `<img onerror>`, `javascript:` and `data:` payloads from `sessionStorage`.
8. ~~Google Sheets formula injection.~~ `Name`, `Email` and `Context` now go through `sheetSafe()`.
9. ~~Both endpoints unauthenticated and unthrottled.~~ Both now have an origin check, a per-IP
   rate limit (submit 5/10 min, chat 30/5 min), and field validation. `/api/chat` caps history at
   40 turns and 4,000 chars per turn. The contact form has a honeypot field.
12. ~~Canonical URLs point at `.html`.~~ All 16 canonicals and `og:url`s are extensionless and
    match `sitemap.xml`.
13. ~~No `sitemap.xml`, no `robots.txt`.~~ Both added. JSON-LD and Twitter Cards still outstanding.

Also fixed, not previously listed: the dev server crashed at startup without `RESEND_API_KEY`
(`new Resend()` throws on construction). API clients are now built lazily, so `npm start` works
with no secrets and the endpoints degrade with a logged warning instead.

### Outstanding — bugs

5. **`google-auth-library` is imported but not declared** in `package.json` — it only resolves
   transitively via `@google/genai`.
6. **Unused dependencies:** `cors`, `pdf-parse`, `xlsx`, `puppeteer` are declared but never imported.

### Outstanding — security

10. **Emails send from `onboarding@resend.dev`**, Resend's shared sandbox sender. Hurts
    deliverability and is trivially spoofable. Moving to `info@existlysvc.com` still uses Resend
    but needs SPF/DKIM DNS records, and DNS is on Wix — **deferred until that access exists.**

    The rate limiter is in-memory, so each Vercel instance counts separately. It brakes casual
    abuse; it is not an edge rate limiter.

### ✅ Also fixed 2026-08-16 (SEO sweep)

13b. ~~No structured data.~~ JSON-LD on all 17 pages, validated as parseable:
     `ProfessionalService` everywhere (both offices, both phone numbers, `sameAs`), plus
     `WebSite` + `FAQPage` (8 questions parsed from the live markup, so it cannot drift from
     what visitors see) on the homepage, `Service` on the 5 service pages, `BlogPosting` on the
     6 articles, and `Blog` on the index. Twitter Cards added to all 17.
14. ~~Two orphaned blog posts.~~ Each article's "Recent Posts" now follows a fixed rotation —
    every post links to the next three, wrapping around, so all six receive exactly three
    inbound links. Those thumbnails also gained `loading="lazy"`.
15. ~~`careers.html` og:description mangled tail.~~ Removed.
    Blog `og:image` also switched from the logo to each article's own thumbnail.
    Footer heading normalised to "Services" on all 17 pages (was 7 "Our Services" / 10 "Services").

### ✅ Also fixed earlier on 2026-08-16

11. ~~UK contact links contradict their display text.~~ `facilities-support.html` now links
    `mailto:info@existlysvc.co.uk` and `tel:+441895695970`, matching what it displays.
16. ~~Footer says `© 2026`, hardcoded.~~ Now a `.footer-year` span filled at runtime by `main.js`.
18. ~~No analytics.~~ GA4 `G-B3024JNEKD` behind Consent Mode v2.

### Outstanding — content & SEO

- **Terms of service page does not exist.** The privacy policy is live; terms are not.
- **The privacy policy needs a solicitor's review.** Its retention periods are deliberately
  non-specific ("as long as needed") until the business sets real ones, and the registered
  company name/number and ICO registration were left out rather than guessed.
- **Blog posts carry no publication date** anywhere in the markup, so `BlogPosting` has no
  `datePublished`. Google's article rich results want one. Dates were not invented — the
  business needs to supply them.
- **`og:image` is the logo on the 11 non-blog pages.** Blog posts now use their own artwork,
  but the rest still share a plain logo card, which previews poorly. Proper share images are
  design work and belong with the redesign.
- **GA4 undercounts.** Only consenting visitors are measured, so sessions will read lower than
  reality. Fine as a baseline provided before/after are compared on the same basis.

---

## 11. Change log

### 2026-10-24 — Two locales: US at the root, UK at /uk

The site is now two locales rather than one blended site, built from the Existly UK Website
Blueprint and the Vendor Coordination Page Flow Blueprint (both 16 Oct 2026).

**Scope decisions taken with the client:** UK covers lettings and FM only (short lets and
accounting stay US-side); vendor prices are published; the "quotes sent in English" line was
rephrased; the Home Depot wording was kept as written.

**Foundation.** Every relative path became root-relative and extensionless — 248 asset refs,
341 internal links, 139 `index.html` → `/`, 4 `url()` in CSS. **This was mandatory**: a page
at `/uk/landlords` resolves `style.css` as `/uk/style.css` and 404s. `server.js` gained
`express.static(..., { extensions: ['html'] })` so local dev resolves extensionless URLs the
way Vercel's `cleanUrls` does in production.

**Shared blocks are now generated.** The navbar and footer had drifted into **8 navbar and 6
footer variants across 17 pages**. `partials/` holds one source each for US and UK;
`scripts/sync-partials.js` (`npm run sync`) writes them into every page and sets the active
nav item. Pages remain plain static HTML and the Vercel deploy is unchanged — this is a
local step, not a build. Re-run it after editing a partial. Result: 1 navbar and 1 footer
variant per locale.

**New: /uk (7 pages).** Home, Landlords, Letting Agents, FM Businesses, How It Works, About,
Contact. `en-GB`, UK address and phone in schema, `areaServed: GB`, and reciprocal hreflang
with the US counterparts (hreflang is ignored unless both sides declare it, so three US pages
were tagged too). `facilities-support.html` is superseded: archived to `_archive/` and
301'd to `/uk/`.

**Renters' Rights Act.** The old UK page marketed ASTs and Section 21. Those ended on
1 May 2026. No page now presents them as current; tenancy copy describes assured periodic
tenancies, and claims are phrased as "supports compliance", never "legally compliant".

**New: /vendor-coordination (US).** Published pricing — $500 / $599 / $700 per month — carried
in `Offer` schema with `UnitPriceSpecification`. Specific figures are what buyers and AI
answer engines quote; "contact us for pricing" is unquotable. Testimonials were left out: the
blueprint flags that permission to name the five vendor companies is unconfirmed.

**Five bugs found and fixed while verifying:**

1. `.subpage-hero-container` was still centred, so **every** service-page hero on both sites
   was centred white-on-dark — the composition the earlier de-centring pass was meant to end.
   That pass changed `.section-header` and the video hero and missed this rule.
2. `.btn-primary`, `.filter-btn.active`, `.testimonial-avatar`, `.social-icon-link:hover`,
   `.industry-card:hover` and `.fact-num` still used gradients, including clipped-gradient
   text on the stat digits. Flattened. `.who-we-are` keeps its gradient deliberately: it is a
   section ground, not a control.
3. `.featured-card-title` / `-desc` were hard-coded to the light-on-dark palette because the
   component had only ever lived in the dark homepage band. On the new light-section cards the
   titles rendered white on white. Defaulted to ink, with the light treatment scoped to dark
   sections.
4. `.value-card` is a grid whose first track is the icon column, with
   `> div { display: contents }`. Cards written without an icon put the heading into that
   30–36px track. 46 such cards tagged `.no-icon`, which drops the track. An explicit class
   rather than `:has()`, so there is no browser-support question.
5. `/accounting` scrolled horizontally on mobile, from two causes: `grid-template-columns: 1fr`
   means `minmax(auto, 1fr)`, so a wide min-content forced a 424px track inside a 371px
   container (now `minmax(0, 1fr)` plus `overflow-wrap`); and three service headings carried
   an inline `display: flex` left over from the circled icon removed earlier, which stopped
   the two weight spans from wrapping.

Also: the footer "Contact Us" link was a bare `#contact`, so it did nothing on every page
except the homepage. Now `/#contact`. The homepage `.featured-grid` had a 6-column desktop
layout with nth-child spans written for exactly 5 cards; with a 6th it rebalances to 3 + 3.

**Verified:** 24 pages, 24/24 valid JSON-LD, 81/81 internal targets return 200, no horizontal
overflow and no clipped headings at 1440 or 375, 1 navbar and 1 footer variant per locale,
7/7 UK pages carrying UK phone and `addressCountry: GB`.

**Still open:** UK company number, registered office and any CMP/redress membership for the
legal footer; whether coverage is England only or also Scotland and Wales; which statistics
and testimonials have permission; and a UK edition of the portfolio PDF (the download still
points at `Maintenance Portfolio.pdf`).


### 2026-08-16 — Chat widget and cookie banner no longer overlap

Both are fixed to the bottom-right. `#existly-chat-widget` sits at `z-index: 9999` and the
banner at `9500`, so the chat button and its floating prompt covered the banner's Accept and
Reject buttons. Measured overlap on a 1280x800 viewport: **-119px of clearance**.

Fix: the widget's offset now reads a custom property that `consent.js` maintains.

- `style.css` — `#existly-chat-widget` is `bottom: calc(24px + var(--cookie-banner-h, 0px))`,
  and the `max-width: 480px` override is `calc(16px + var(--cookie-banner-h, 0px))` so the chat
  does not drop back over the banner on phones. `#chat-window` caps its height against the
  same property, since the 500px panel grows upward and could otherwise run off the top.
  A `transition: bottom` makes it slide rather than jump.
- `consent.js` — `setChatClearance()` measures the banner and publishes its height, resetting
  to `0px` on close. A `ResizeObserver` re-measures while the banner is open, because the
  banner reflows taller at narrow widths when its actions stack (143px desktop, ~218px mobile);
  the observer is disconnected on close. Non-finite or negative measurements are clamped to 0.

**Deliberately folded into the base rule rather than added as a class-gated second rule.**
One declaration means no specificity contest and no dependence on a class toggle triggering a
style recalculation. With no banner the property is unset and `calc(24px + 0px)` leaves the
widget exactly where it was, so nothing changes for visitors who have already chosen.

⚠️ **Verification note.** This could not be confirmed visually in the Browser pane. The pane's
document timeline is frozen (measured: 0ms advanced against 1612ms of wall clock), so CSS
transitions never run and, critically, **pre-existing elements are not re-styled when a custom
property changes**. The control test that settles it: injecting a brand-new element with the
identical rule resolves to `168px`, while the already-present widget still reports `24px`.
The rule and the variable are correct; the pane is stale. Confirm in a real browser.

### 2026-08-16 — Mixed-weight headlines site-wide; hero corner tags removed

**Corner tags removed.** The two micro-labels bracketing the homepage hero read as floating
debris against the navbar rather than as anchors. Markup and CSS both deleted; zero references
remain.

**Mixed-weight rolled out to all 17 pages — 62 headings.** Previously homepage-only.

- Every `.subpage-hero-title`, `.section-title` and `.service-block-title` now splits the
  qualifier (Archivo 200) against the subject (800).
- Most markup already wrapped its accent word in a `<span>`, so the split mapped onto existing
  structure. Redundant inline `color` declarations were dropped so the stylesheet governs
  light and dark sections.
- Two headings flip the weights because their accent span is the qualifier rather than the
  subject, e.g. "Maximize Your Rental Revenue," bold against "Effortlessly" thin. Branding's
  hero had the span leading instead of trailing and was handled explicitly.
- Page titles on `our-team` and `book-online` were treated too. The latter's inline
  `font-size: 2rem` was dropped so the new fluid rule applies.

**Deliberately NOT treated:** blog article titles (`.post-title`), in-article `h2`s, and the
numbered legal headings in `privacy-policy`. Splitting editorial or legal text into thin and
bold puts emphasis on words the author never emphasised. These instead received the site's
tight tracking and fluid scale, so the voice matches without the weight split.

**Three circled-chevron icon badges removed** from service-block headings on accounting,
branding and short-term-rental, the same circular-icon signal removed from the featured cards.

Two gotchas worth remembering. One heading carried `class="section-title why-choose-title"`,
so an exact `class="section-title"` match skipped it: always match the class anywhere in the
attribute. And the `our-team` and `book-online` page titles had different inner markup than
assumed, so the first pass reported MISS rather than silently doing nothing.

Verified: 62 headings treated with none missed across 10 pages fetched and parsed; no overflow
and no clipped text at 1440 and 375 on index, facilities-support, short-term-rental, our-team
and book-online.

### 2026-08-16 — Capsule sweep + service panels replace stock illustrations

**Capsules.** The 36 `.service-capsule` tags were pastel pills in six arbitrary colours (23
inline styles stripped). Now one voice everywhere: bordered uppercase micro-label in brand
colour, light tint on dark grounds. `.hero-badge`, `.upwork-badge`, `.filter-btn` squared into
the same system (Upwork badge keeps its green — that is Upwork's real brand, not an arbitrary
pastel). `.btn-nav-book` was a **gradient pill** — both banned signals in the most visible
element on the site — now flat accent, square, label voice. `.lang-toggle-btn` still has a pill
radius but is dead code with no HTML.

**Service panels.** The 29 stock illustrations on the five service pages (five unrelated
palettes, none brand) are replaced by generated panels: ink ground, 5% blueprint grid, accent
tick, giant ghost index number, service name, and the block's first four `.service-bullet-item
h4` deliverables as `+` chips. Built by `main.js` at load from content already in each block —
**if JS fails the original image simply remains**, so there is never an empty column. Also cuts
~29 image requests from service pages. Some blocks have no bullets and show number+name only.

Verified: 10 panels on facilities-support, 6 on short-term-rental, zero leftover imgs in
blocks, no content overflow in panels at 1440/375, one capsule style site-wide.

### 2026-08-16 — De-centering, flat accents, button voice, corner tags

Visual template-signals removed after comparing against non-generated reference sites. All
verified at 880 and 375 with no clipping or overflow.

- **Everything was centered.** `.section-header` centered every section on every page, and the
  hero was centered white type over video — the most recognisable template hero there is. Both
  are now hard left. Three separate rules had to change: the base `.section-header`, the
  `.video-hero .hero-container` flex centering, and a **≤1024px media query that re-centered
  the hero on mobile** (which is most visitors — easy to miss, since desktop measured fine).
- **Gradient-clipped accent words** in section titles (the banned "blue-gradient SaaS look")
  are now flat brand colour, with a light-tint override on dark sections.
- **Buttons** are now the landing page's voice: 12px Archivo 800, uppercase, .07em tracking.
  Hover stays a colour swap.
- **Hero corner tags** added — two micro-labels bracketing the hero width ("Back-office &
  digital operations" / locations), the landing page's device for anchoring a full-bleed hero
  without centering it. The lone hero CTA's inline sizing overrides were dropped so it matches
  the button system.
- Homepage section headlines rewritten reader-first ("You grow the portfolio. We run what's
  behind it." / "One partner, not five vendors" / "The same back office, ten industries deep")
  and the "525 Cups of Coffee" stat replaced with the sourced "25% Occupancy Lift, Clemons
  Hospitality" — a joke metric beside real numbers invited discounting all four.

### 2026-08-16 — Illustration blending, real colour-blocking, grain

**Outline fix.** 11 illustrations ship with a white background baked into the file, which
produced a box-within-a-box inside the new 4:3 frames (page ground → border → the image's own
white padding). Fix: `mix-blend-mode: multiply` on `.service-image-wrapper img` — white pixels
take on the section ground, so the illustration sits directly on the page on white AND bg-alt
sections. The frame border was then removed (it would have outlined an empty box). Verified no
wrapper sits inside a dark section — **multiply on a dark ground would wreck the image, and it
must never be applied to photos of people.**

**Colour-blocking.** `--color-bg-alt` deepened `#F3F4F6` → `#E9EAF0` (cool blue-grey on the
logo's own hue). The old value was 3% from white, so alternating sections read as one
continuous grey; now the rhythm registers.

**Grain.** feTurbulence noise overlay (opacity .38, blend overlay, pointer-events none) on
`.hero`, `.subpage-hero`, `.featured-services`, `.who-we-are`, `.middle-promo-banner` via
existing classes — zero HTML changes. Verified buttons underneath remain clickable.

### 2026-08-16 — Service pages: imagery system + rows (significa-inspired)

Patterns reimplemented from significa.co — **as thinking only; that codebase is AGPL and its
code must never be copied into this repo.**

**Imagery.** The supplied service images range from 0.91 to 1.84 in aspect ratio, so every
service block was a different shape — the main reason those pages read as assembled. All
`.service-image-wrapper` frames are now a uniform 4:3 with `object-fit: cover`, hairline
border, no shadow, no radius. 4:3 was chosen as the closest ratio to the mean of the existing
images (least cropping). Five inline `object-fit: contain` overrides on individual imgs were
stripped — they were beating the system and letterboxing.

Measured crop cost: most images lose 11-27% at the edges; `cleaning_coordination` (0.91,
portrait) loses 32% top/bottom. **If any image loses something important, the fix is
`object-position` on that img, not turning the system off.**

**Value props.** The three shadowed tiles atop each service page are now full-width rows
divided by hairline rules — icon / title / description columns, whole-row tint + indent on
hover, stacking to two columns on mobile. `.value-card > div { display: contents }` lets the
existing markup feed the new grid without touching 17 files.

Body measure on service blocks is now capped at 62ch.

### 2026-08-16 — Type scale, tracking, and de-templating

The typeface swap alone did not close the gap to the reference landing page. Measured, the
real difference was scale contrast, not the cards:

| | Before | After | Landing page |
| --- | --- | --- | --- |
| Hero heading | 56px fixed | clamp 36-76px | up to 104px |
| Section heading | 40px fixed | clamp 32-60px | up to 72-88px |
| Heading line-height | 1.25 | 0.95 | 0.82-0.95 |
| Heading tracking | none | -0.035em | -0.035em |
| Eyebrow label | 17.6px (inline override) | 14px | 10.5px |

Headings were roughly half the size and 35% looser than the reference. Tight huge type against
small wide-tracked labels is the whole device and neither half works alone.

- `.hero-title`, `.section-title`, `.subpage-hero-title` are now fluid `clamp()` with crushed
  leading and negative tracking. **The fixed font-size overrides in the 768px and 480px media
  queries were deleted** - clamp()'s minimum handles small screens, and a later fixed value
  would simply beat the fluid one.
- Radius tokens flattened (`8/16/24px` -> `2/2/3px`). These feed 39 rules, so one edit squares
  every card, button and panel. Circles use `border-radius: 50%` and are untouched.
- Featured cards: shadow and rounded corners gone, pastel per-card icon chips removed (5 inline
  styles), one icon colour, and `01-05` numbers from a CSS counter so reordering needs no markup.
- `.btn-link` is now an uppercase micro-label rather than a sentence-case link.
- Two inline `section-subtitle` overrides removed. One was only setting a colour for a dark
  hero, so that is now a proper rule covering **every** dark section, not just the one page that
  had the inline fix.

Still different from the reference and not attempted: no global container (it uses full-bleed
sections), hard tonal colour-blocking between sections, film grain / blueprint-grid textures,
and desaturated photography.

### 2026-08-16 — Typeface swap

Outfit + Plus Jakarta Sans replaced with **Archivo (display) + Inter (body)**, matching the
Rene landing page. The `@import` request is byte-identical to that page's, including Archivo
200 and 900 which the current rules do not use: the wide weight range is the point of the
pairing, since a headline can set 200 against 800 and get the contrast a second typeface would
normally provide. An identical request also shares a font cache entry between the two sites.

Only `--font-heading` and `--font-body` changed. Every rule that references them was left
alone. One hardcoded `'Outfit'` in the success modal (`main.js`) now points at
`var(--font-heading)` so it cannot drift again.

Checked afterwards at 1440 and 375: no page overflow and no text clipping its container, which
was the risk since Archivo sets wider than Outfit.

### 2026-08-16 — Copy pass (AI-writing patterns)

Rewrote the marketing prose against the Wikipedia "Signs of AI writing" patterns. **No claim
was changed and no layout moved** — only how sentences are built.

Two hard rules held throughout:
- **Client testimonials and Upwork reviews were not touched.** They are real people's words;
  editing them would be fabrication.
- Every rewrite keeps the original claim. If the copy said 24/7 guest communication, it still does.

| Tell | Before | After |
| --- | --- | --- |
| Curly quotes | 44 | 0 |
| Em/en dashes | 21 | 0 |
| "ensure/ensuring" | 27 | 20 |
| "streamline" | 14 | 10 |
| others (seamless, tailored, comprehensive, unique, flawless, "peace of mind", "stands out", "pride ourselves", "cutting-edge", "robust", "what matters most") | 50 | 33 |
| **Total** | **156** | **63 (60% fewer)** |

Rewritten in full: the homepage "Why choose Existly" block (copula avoidance, a negative
parallelism, three rule-of-three stacks, a false range and a generic upbeat closer in three
paragraphs), "Who we are", the industries lead-in, the Upwork subhead, four FAQ answers, the
branding service card, and formulaic lines on `facilities-support.html` and two blog posts.

The remaining 63 are deliberate. "Comprehensive tenant referencing" and "end-to-end repair
management" are how the industry talks, and the same guide warns against gutting legitimate
prose to hit a number.

⚠️ **The FAQ text exists in two places** — the visible accordion and the `FAQPage` JSON-LD.
The rewrites were applied as whole-sentence replacements so both copies changed together;
verified afterwards that all 8 answers match exactly. Google penalises structured data that
does not match the visible page, so any future FAQ edit must update both.

### 2026-08-16 — Performance + smooth scrolling (no visual change)

The look is deliberately unchanged. The existing design is Existly's identity; this pass only
made it lighter and smoother.

**Images — 25.6 MB → 3.3 MB (87% smaller).**
- All 69 PNG/JPEGs converted to WebP with `sharp` (q82, alphaQuality 100). Two were kept as
  PNG because WebP came out larger (`guesty`, `zoho-books`).
- All 153 `<img>` tags now carry intrinsic `width`/`height`, which stops layout shift. This is
  safe only because `style.css` already sets `img { max-width:100%; height:auto }` — without
  that, adding the attributes would distort every image.
- 101 below-the-fold images gained `loading="lazy" decoding="async"`. The first two per page
  stay eager so the header logo and lead image are never deferred.
- Four `url()` references in `style.css` repointed (`hero_bg` 725 KB → 89 KB).
- **`og:image` and the favicon deliberately still point at PNG** — social scrapers handle WebP
  badly, so those eight originals stay in place.
- The other 59 originals moved to `assets/images/_source/` and excluded via a new
  `.vercelignore`. Deployed image weight is now 7.8 MB.

**Smooth scrolling — Lenis 1.3.26, self-hosted** at `assets/js/lenis.min.js` (19 KB) rather
than a CDN, so there is no third-party dependency on page load.
- Initialised at the top of `main.js`, guarded: if the script fails to load, or the visitor
  has `prefers-reduced-motion`, it returns early and native scrolling takes over unchanged.
- `style.css` gained the `.lenis` classes. Native `scroll-behavior: smooth` stays as the
  fallback but is switched to `auto` once Lenis attaches — both animating the same scroll
  makes anchor jumps fight and stutter.
- The service-page filter chips now scroll through `lenis.scrollTo()`, with the original
  `window.scrollTo` retained as the fallback path.
- Exposed as `window.existlyLenis`.

Verified: all 153 image references resolve, no page overflow at 1440/375, Lenis eases
(0 → 330 → 418 → 448 → 450 against a 450 target) rather than jumping.

⚠️ **Videos are untouched — still 21.2 MB across 7 files**, autoplaying on every page. This is
now the single heaviest thing on the site by a wide margin. Re-encoding needs `ffmpeg`, which
is not installed. Note that `C:\WINDOWS\system32\convert.exe` is the drive-format utility, not
ImageMagick — do not invoke `convert` here.



### 2026-08-16 — Phase 0 of the redesign (security, correctness, SEO foundations)

First phase of the site redesign: fix what damages credibility before changing any pixels.
**No visual change was made.** Full plan at `~/.claude/plans/i-want-to-redesign-giggly-barto.md`.

**New:** `api/_lib/security.js` — escaping, formula-injection guard, in-memory per-IP rate
limiter, origin allow-list, and lazy API-client construction, shared by both endpoints.

- `main.js` — chat transcript renders via DOM nodes instead of `innerHTML`; link hrefs
  restricted to `http(s)`. Contact form uses the v23 `intlTelInput.getInstance()` API so the
  country code is no longer dropped, and sends the honeypot field.
- `api/submit.js` — field normalisation and validation, honeypot, rate limit, origin check,
  HTML-escaped email body, `sheetSafe()` on all text columns, `replyTo` set to the lead.
- `api/chat.js` — history capped at 40 turns / 4,000 chars, rate limit, origin check, empty-reply
  fallback, escaped email body, `sheetSafe()` columns, graceful 503 when `GEMINI_API_KEY` is absent.
- `api/knowledge_base.js` → `api/_lib/knowledge_base.js`; `server.js` blocks GETs under `/api/`.
- All 16 pages — canonical and `og:url` switched to the extensionless form.
- Added `robots.txt` and `sitemap.xml`; added the `.hp-field` honeypot style to `style.css`.
- Deleted `Existly - Property Management (UK).pdf` from the web root (it was publicly
  downloadable). The source document remains at `C:\Users\DELL\Desktop\existly\`.
- Added `.claude/launch.json` at the workspace root so the dev server can be started for preview.

Verified locally: 22 unit assertions on the security helpers; XSS payloads replayed from
`sessionStorage` render as inert text while the Calendly link still works; endpoint matrix
(403 / 400 / 429 / 200) confirmed by curl; all source paths under `/api/` return 404 while the
site, `robots.txt` and `sitemap.xml` return 200.

**Then, analytics + legal (approved by the client before rollout):**

- **New page `privacy-policy.html`** — 11 sections written from the data flows that actually
  exist in the code (Resend, Gemini, Sheets, Forms, Calendly, ipapi.co, jsDelivr, Google Fonts,
  Vercel), including a transfers section and UK GDPR rights. Added to `sitemap.xml` (17 URLs).
- **New `consent.js`** — Google Consent Mode v2. Everything denied by default; `gtag.js` is not
  requested until the visitor accepts; choice stored in `localStorage` under a version key so a
  future policy change can re-ask. Exposes `window.existlyTrack()` for conversion events and
  `window.existlyOpenCookieSettings()` for the footer link.
- **GA4 `G-B3024JNEKD`.** The banner stays dormant unless a real ID is present — with the
  placeholder it does not show at all, since no analytics cookies exist to consent to.
- **All 17 pages** gained a fourth footer column (Privacy Policy · Cookie Settings), a
  `.footer-year` span, and the `consent.js` tag.
- **`style.css`** — `.footer-top` widened from 3 to 4 columns with a 2-column tablet step;
  cookie-banner and legal-page styles appended (~240 lines).

Verified in-browser: no cookies and no Google request before consent; `page_view` reaches
`google-analytics.com` with the correct `tid` after accepting; footer renders 4-across at 1440,
2×2 at ~960, stacked at 375, with no horizontal overflow; all 17 sitemap URLs resolve.

⚠️ Two traps found during this work, worth remembering:
1. Moving `knowledge_base.js` to a plain `lib/` folder did **not** hide it — Vercel stopped
   routing it as a function, but it was still served as a static asset. `api/_lib/` is the fix.
2. The footer columns carry `animate-on-scroll` + `delay-*`, and those classes are defined in a
   `<style>` block **injected by `main.js`** (around line 443), not in `style.css`. Grepping the
   stylesheet for them finds nothing. Any new footer column must carry the same classes or it
   renders 25px out of alignment with the rest.

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
