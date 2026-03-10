# CLAUDE.md — SAM Camp Glamping Website

## Project Overview

This is a static marketing and booking website for **САМ CAMP** — a glamping resort on Lake Ladoga in Karelia, Russia. The site serves as both a marketing landing page and a fully functional booking system.

**Live URL:** https://samcamp.ru/
**Business:** Glamping resort, 7,000 ₽/night, minimum 2 nights, season May–October
**Location:** 61.4818° N, 30.2179° E (Лахденпохья, Карелия)

---

## Architecture

### Technology Stack

- **Frontend:** Pure HTML5 + CSS3 + Vanilla JavaScript (ES6+)
- **No build tools, no package manager, no frameworks** — static files served directly
- **Font:** Space Grotesk via Google Fonts
- **Backend:** Google Apps Script (serverless) → Google Sheets (data storage)
- **Notifications:** Telegram Bot API (real-time booking alerts)
- **Maps:** Yandex Maps (external link)
- **Analytics:** Yandex.Metrika (ID: 107136989)

### File Structure

```
SAM/
├── index.html          # Single-page app — all markup lives here
├── css/
│   └── style.css       # All styles (1,953 lines) — dark theme, responsive
├── js/
│   └── main.js         # All JavaScript (592 lines) — booking logic + UX
├── img/                # WebP images + SVG logo + OG image
│   ├── hero.webp
│   ├── tent1/2/3.webp  # Accommodation gallery
│   ├── Fishing.webp, Rock.webp, banya.webp, forest.webp, SUP.webp
│   ├── ladoga.webp, map-small.webp
│   ├── og-image.png/webp
│   └── logo.svg
├── fonts/              # Empty — local font fallback directory (currently unused)
├── favicon.ico
├── sitemap.xml
├── robots.txt
└── SETUP_INSTRUCTIONS.md  # (excluded from git — Google Apps Script setup guide)
```

---

## Page Structure

`index.html` is a single-page application with six full-page sections (`section.page`):

| Section ID | Content |
|---|---|
| `#glavnaya` | Hero — tagline, price, CTA, coordinates |
| `#mesto` | Location — map pin, description, Yandex Maps link |
| `#ustrojstvo` | Amenities — Sleep, Fire, Utilities, Mountains cards |
| `#domik` | Accommodation gallery (3 photos) |
| `#chto-delat` | Activities — Fishing, Rock, Sauna, Forest, SUP |
| `#priehat` | Pricing, directions, contacts |
| `#bronirovat` | Booking — calendar + form |

---

## JavaScript Architecture (`js/main.js`)

The entire JS is wrapped in a single **IIFE** (Immediately Invoked Function Expression) — no modules, no imports/exports.

### Key Components

#### Booking State (`bkState`)
```js
const bkState = {
  year, month,          // Currently displayed calendar month
  start, end,           // Selected date range (Date objects)
  picking,              // 'start' | 'end' — which date is being selected
  hover,                // Hovered date for range preview
  bookedDates,          // Array loaded from Google Sheets
  isSwiping             // Touch detection flag
};
```

#### Google Apps Script Integration
```js
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby.../exec';
```
- **GET** request on page load → fetches occupied dates as JSON (`{ dates: [...] }`)
- **POST** request on form submit → sends booking data as `FormData`

#### Occupied Dates Format
Dates from Google Sheets arrive as an array of strings, either:
- Single date: `"25.12.2025"` (DD.MM.YYYY)
- Range: `"20.06.2025-28.06.2025"` (DD.MM.YYYY-DD.MM.YYYY)

#### Booking Rules
- Minimum 2 nights enforced in `bkSelectDate()`
- Booked ranges block entire selection (cannot select across booked dates)
- Past dates are always non-selectable
- Price: `nights × 7000 ₽` calculated in real-time

#### Functions
| Function | Purpose |
|---|---|
| `bkFetchBookedDates()` | Async fetch occupied dates from Google Script |
| `isDateBooked(dateObj)` | Checks if a date is in any booked range |
| `bkRender()` | Re-renders entire calendar grid |
| `bkApplyHoverRange()` | Updates hover preview across all cells |
| `bkSelectDate(date)` | Handles click on a calendar date |
| `bkUpdateUI()` | Updates dates/price/button state after selection |
| `bkSubmitBooking(isPay)` | Submits form to Google Script via POST |
| `bkFmtDate(d)` | Formats Date → `DD.MM.YYYY` |
| `bkFmtPrice(n)` | Formats number → `7 000` (space as thousands separator) |
| `bkNightWord(n)` | Russian grammatical plural: ночь/ночи/ночей |
| `copyCoords(el)` | Copies `61.4818, 30.2179` to clipboard |
| `closeMobile()` | Closes hamburger menu |
| `hideLoader()` | Hides page loader (with 3s failsafe) |

#### Scroll Handler (rAF-throttled)
- Progress bar width (`#progressBar`)
- Navbar compact state (`.scrolled` at 50px scroll)
- Parallax on hero and "mesto" backgrounds (desktop only, `> 768px`)
- Sticky CTA visibility (mobile only, between hero bottom and booking section)

#### Phone Mask
Input `#bkPhone` gets auto-formatted to `+7 (XXX) XXX-XX-XX`. Normalizes leading `8` to `7`.

---

## CSS Architecture (`css/style.css`)

### Design Tokens
```css
Background:   #080808  (near-black)
Accent:       #C17B2F  (amber/gold)
Text muted:   rgba(255,255,255,0.5)
Text dim:     rgba(255,255,255,0.25)
Font:         'Space Grotesk', sans-serif
```

### Key Patterns
- **Sections** use class `.page` with `min-height: 100vh`
- **Fade-in animations** use class `.fade-in` + `.visible` (added by IntersectionObserver) with `delay-1` through `delay-5` modifier classes
- **Parallax** backgrounds are positioned `div` elements with `background-size: cover`
- **Calendar cells** are styled via inline JS (not classes) for performance
- **Versioning:** CSS loaded with `?v=1.3`, JS with `?v=1.4` (manual cache-busting)

### Responsive Breakpoints
- Mobile breakpoint: `768px` (hamburger menu, sticky CTA, parallax disabled)
- CSS is written desktop-first but adapts for mobile

---

## Backend: Google Apps Script

The backend is a deployed Google Apps Script web app that handles two endpoints:

### GET `/exec`
Returns occupied dates from Google Sheets:
```json
{ "dates": ["25.12.2025", "20.06.2025-28.06.2025"] }
```

### POST `/exec`
Receives `FormData` with fields: `name`, `phone`, `start`, `end`, `nights`, `guests`, `price`, `comment`

On success:
1. Writes row to Google Sheets
2. Sends Telegram notification to admin
3. Returns `{ "result": "success" }`

On failure: Returns `{ "result": "error", "error": "..." }`

> **Note:** The Google Script URL is hardcoded in `main.js:80`. If the script needs to be redeployed, update this constant.

---

## Development Workflow

### No Build Process
There is no build step. Edit files directly and test in a browser.

### Local Development
Open `index.html` directly in a browser or use any static file server:
```bash
# Python (quick local server)
python3 -m http.server 8080

# Node.js alternative
npx serve .
```

### Deployment
Copy all files to the web host. The `.gitignore` excludes:
- `SETUP_INSTRUCTIONS.md` (internal setup guide)
- `favicon.zip`
- `.DS_Store`, `.vscode/`, `.idea/`

### Cache Busting
When updating CSS or JS, increment the version query parameter in `index.html`:
```html
<link rel="stylesheet" href="css/style.css?v=1.4" />   <!-- was 1.3 -->
<script src="js/main.js?v=1.5" defer></script>          <!-- was 1.4 -->
```

---

## Key Conventions

### Language
All user-facing content and comments in source code are in **Russian**. Git commit messages are also in Russian. This is expected and intentional.

### JavaScript Style
- Single IIFE wrapper — no global leakage except explicitly exposed functions (`window.bkSubmitBooking`, `window.closeMobile`, `window.copyCoords`)
- No semicolons omitted — standard JS semicolon style used
- Inline styles used directly on calendar cells for performance (avoiding class toggling on many elements during hover)
- `requestAnimationFrame` used for scroll handler throttling

### HTML Style
- All sections have Russian comments above them (e.g., `<!-- ===== СТРАНИЦА 2: МЕСТО ===== -->`)
- IDs use Russian transliteration: `#glavnaya`, `#mesto`, `#ustrojstvo`, `#bronirovat`
- ARIA labels and `tabIndex` added to interactive calendar cells for accessibility
- `loading="lazy"` on all below-fold images

### CSS Style
- BEM-like class naming: `.bk-price-row`, `.priehat-card--large`, `.btn-main--hero`
- Section-specific prefixes: `bk-` (booking), `priehat-` (arrival section), `cal-` (calendar)
- No CSS variables (custom properties) — colors are hardcoded throughout

---

## Contacts & Business Info

| Field | Value |
|---|---|
| Phone | +7 950 047 44 55 |
| Email | info@samcamp.ru |
| Telegram (public) | @samcamp_ru |
| Telegram (admin) | @Maksimenko_Dmitry |
| VKontakte | vk.com/sam_glamping |
| Coordinates | 61.4818° N, 30.2179° E |
| Address | Лахденпохья, Республика Карелия |

---

## Common Tasks

### Add a new section
1. Add `<section class="page" id="new-section-id">` in `index.html`
2. Add navigation link in both `.nav-links` and `.mobile-menu`
3. Style in `css/style.css`

### Update pricing
Search for `7000` and `7 000` in both `main.js` and `index.html` — price appears in multiple places.

### Block specific dates manually
Edit the Google Sheets spreadsheet directly — dates added there will be fetched on next page load.

### Change Google Apps Script endpoint
Update `GOOGLE_SCRIPT_URL` at `js/main.js:80`.

### Add new images
- Convert to WebP for performance
- Use `loading="lazy"` on `<img>` tags
- Place in `img/` directory
