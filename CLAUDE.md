# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static landing page for **САМ CAMP** — a glamping site on Lake Ladoga, Karelia, Russia. No build system, no package manager, no framework.

**Live site:** `https://samcamp.ru/`

## Structure

```
index.html          — Single-page site (all sections in one file)
css/style.css       — All styles (versioned with ?v=1.x in HTML)
js/main.js          — All JavaScript (one IIFE)
img/                — Images and SVG assets
fonts/              — Local font files
```

## Development

Open `index.html` directly in a browser, or use any static file server:

```bash
python -m http.server 8080
# or
npx serve .
```

No compilation, no linting, no tests.

When editing CSS, increment the version query string in `index.html`:
```html
<link rel="stylesheet" href="css/style.css?v=1.5" />
```

## Architecture

**Single-page scroll site** with 7 full-height sections (`section.page`), navigated by anchor links:

| Section ID | Content |
|---|---|
| `#glavnaya` | Hero with parallax background |
| `#mesto` | Location info + map |
| `#ustrojstvo` | Cards grid — what's included |
| `#domik` | Accommodation details |
| `#chto-delat` | Activities |
| `#priehat` | How to get there |
| `#bronirovat` | Booking calendar + form |

**`js/main.js`** — One IIFE containing:
- Scroll handler (progress bar, navbar compact, parallax, sticky mobile CTA)
- IntersectionObserver for active nav link highlighting
- Full booking system: interactive date-range calendar, booked-date blocking, form submission to Google Sheets

**`css/style.css`** — No preprocessor, plain CSS. Design tokens via CSS variables are not used; the amber accent `#C17B2F` and muted text `#A1A1AA` appear as literal values throughout. Dark theme base: `#080808`.

**Font:** Space Grotesk (Google Fonts CDN).

## Booking Integration

Bookings are sent via `fetch` POST to a Google Apps Script web app URL hardcoded in `js/main.js` (`GOOGLE_SCRIPT_URL`). The same URL is polled on load (GET) to retrieve booked date ranges and block them in the calendar. The Apps Script code and setup instructions are in `SETUP_INSTRUCTIONS.md`.

Booked dates format from the API: `"DD.MM.YYYY - DD.MM.YYYY"` (date ranges) or `"DD.MM.YYYY"` (single dates).

## Analytics

Yandex Metrika counter ID `107136989` is embedded in both `<head>` (script) and `<body>` (noscript fallback).
