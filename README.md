# CGPSC MCQ Practice Booklet

Free, bilingual (Hindi/English) MCQ practice booklet for CGPSC Prelims Paper-I. 15 practice sets — previous-year papers (2020–2024) plus freshly written practice sets (2025-A through 2025-J) — 100 questions each, presented as an OMR-style quiz with answer-sheet navigator and post-submit explanations.

**Live site:** https://neetikacodes.github.io/CGPSC-MCQs/

> **This is a practice tool only — not an official CGPSC resource.** Always verify against the official CGPSC syllabus, textbooks, and answer key. See the in-page "About this booklet" / Disclaimer section for full details.

## Files
- `index.html` — app markup (cover/quiz/result screens + About/Disclaimer section, full SEO meta tags, Open Graph + Twitter Card tags, and JSON-LD structured data)
- `style.css` — all styling
- `app.js` — quiz logic
- `data.js` — question bank (15 booklets: 2020, 2021, 2022, 2023, 2024, 2025-A to 2025-J)
- `robots.txt`, `sitemap.xml` — SEO

## Before you launch — SEO / sharing checklist
1. **Add a social preview image.** `index.html` references `assets/og-image.png` (1200×630px) for link previews on WhatsApp, Facebook, Twitter/X, and LinkedIn. Create an `assets/` folder in the repo root and add `og-image.png` — a simple banner with the booklet title works well. Without this file, shared links show no preview image.
2. **Submit the sitemap** (`https://neetikacodes.github.io/CGPSC-MCQs/sitemap.xml`) to Google Search Console and Bing Webmaster Tools after launch so the site gets indexed faster.
3. **Favicon** is already handled inline (an SVG OMR-bubble mark in the site's colours) — no extra file needed.

## Deploy on GitHub Pages
1. Push all these files to the root of your `CGPSC-MCQs` repo.
2. In repo Settings → Pages, set source to the `main` branch, root folder.
3. Site is live at https://neetikacodes.github.io/CGPSC-MCQs/.
