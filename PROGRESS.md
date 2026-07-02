# redesign-motion — progress

Build order: 1 Hero ✅ → 2 Pathways → 3 Projects → 4 Marquee → 5 About → 6 Footer polish → QA gates.

## Done
1. **Hero** (`components/redesign/hero.tsx` + `fade-in.tsx`, `magnet.tsx`, `contact-button.tsx`)
   - Kanit added in `layout.tsx`; SiteHeader removed from layout (hero now carries the nav — judgment, see BUILD-REPORT).
   - `.display`, `.steel-gradient-text`, `.coin-turn`, `.idle-float` added to `globals.css`.
   - Coin = rotating `public/coin/rs5-back.png` image (R3F scene judged too heavy/mis-framed for the magnet).
   - Stats moved into hero bottom band (10M+ / 63.7K / 100+). Old `StatsBand` removed from page.

## Next: Pathways
- New `components/redesign/pathways.tsx`, white #FFF rounded-t section, numbered 01–04.
- Copy 01–03 verbatim from `components/help-cards.tsx`; 04 NUMEROLOGY GUIDANCE is NEW copy → flag for veto.
- "Learn more" targets: currently `#` on the live site — keep `#`.
- After build green + commit: replace `HelpCards` in `app/page.tsx`.

## Then
- Projects: sticky cards; partnership copy VERBATIM from `partner-section.tsx` ("Own shares… Target Return: 100x over 5 years. Starting from Rs 28,000. Exclusively for GenZ & Millennials (18 to 45)."). TikTok link = `#` (flag). Venture → https://yealth.mu.
- Marquee: no thumbnails in public/ → all placeholder tiles + view counts 106.2K / 108.4K / 76.9K / 10M+ branding tiles.
- About: verbatim story from `story-section.tsx`; TOOSHMA quote from `testimonials.tsx`; decor = coin imagery (`/coin/coin-fallback.jpg`, `/textures/*`) — judge.
- Footer: keep `site-footer.tsx` content exactly; add id="contact"; page order Hero, Marquee, About, Pathways, Projects, Footer; drop Ambience/PageBubbles/old Hero deps if unused; keep FloatingCTA + sentinels.
- Known flags so far: stats say 63.7K per the mission spec but old StatsBand said "63.7L" — spec wins, flagged. SplineSection (session WIP) dropped from page (not part of current-site content) — flagged.
