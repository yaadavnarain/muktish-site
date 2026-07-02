# BUILD-REPORT — redesign-motion (overnight autonomous run, 2026-07-02)

Branch: `redesign-motion` (from `main`). No pushes, no deploys, `main` untouched, nothing under `public/` modified or deleted.

## What was built

Landing page rebuilt with the premium-portfolio motion language. Page order: **Hero → Marquee → About → Pathways → Projects → Footer** (built in priority order Hero, Pathways, Projects, Marquee, About, Footer — one green `npm run build` + commit per section).

| Section | File | Motion |
|---|---|---|
| Hero | `components/redesign/hero.tsx` | FadeIn sequence (nav 0 / h1 0.15 / tagline 0.35 / CTA 0.5 / magnet 0.6, ease [0.25,0.1,0.25,1]), magnet coin (padding 150, strength 3, 0.3s ease-out in / 0.6s ease-in-out out), count-up stats |
| Marquee | `components/redesign/marquee.tsx` | Scroll-driven double row, `offset=(scrollY−sectionTop+innerHeight)*0.3`, row1 right / row2 left, tiles tripled + modulo wrap, rAF-throttled passive listener, willChange |
| About | `components/redesign/about.tsx` | Character-by-character reveal (opacity 0.2→1, `useScroll` offset ['start 0.8','end 0.2'], invisible placeholder + absolute aria-hidden animated layer), 4 corner decor x ±80 / 0.9s / staggered |
| Pathways | `components/redesign/pathways.tsx` | White #FFF rounded-t-[40/50/60px], numbered 01–04, 1px `rgba(10,10,10,0.15)` separators, staggered FadeIn i*0.1 |
| Projects | `components/redesign/projects.tsx` | Sticky-stacking cards (sticky `top-24 + i*28px`, scale `1−(total−1−i)*0.03`, border-2, rounded-[40/50/60px]), dark rounded-t overlap over white section |
| Footer | `components/site-footer.tsx` (edited) | Kept verbatim; added `id="contact"` + anonymous-message link |

Primitives: `components/redesign/fade-in.tsx`, `magnet.tsx`, `contact-button.tsx`; `lib/use-reduced-motion-safe.ts`. Kanit (300–900) loaded via `next/font` for display headings only; body stays Nunito. `.display`, `.steel-gradient-text`, `.coin-turn`, `.idle-float` added to `globals.css`. Main wrapper `overflow-x-clip`. All animation transform/opacity only; no maskImage anywhere (photo edges dissolved with overlay gradients instead).

## Content mapping (all real copy kept verbatim)

- Story, TOOSHMA testimonial → About. Pathways 01–03 → old HelpCards copy. Partnership card → old PartnerSection copy including badge and "Own shares…" line and the FSC-sensitive block, character-for-character. TikTok caption + view counts → Marquee/Projects. Footer contact block unchanged.
- Old sections removed from the page (content preserved in new homes): Hero/StatsBand, HelpCards, TikTokSection, StorySection, Testimonials, PartnerSection, Ambience, PageBubbles. Files kept on disk for easy revert.

## Assets: found vs placeholder

- **Coin**: `public/coin/rs5-back.png` (real) — rotating image inside the magnet.
- **Founder**: spec named `founder-muktish.jpeg` (absent); used existing `public/images/muktish.png`.
- **About corner decor**: real coin imagery (`coin/rs5-back.png`, `textures/rs5-front.png`, `textures/rs5-back.png`, `coin/coin-fallback.jpg`) — no REPLACE-DECOR placeholders needed.
- **Partnership card media**: `public/coin/coin-fallback.jpg` (real).
- **TikTok thumbnails**: none exist in `public/` → marquee uses the current site's gradient tiles + "REPLACE — TikTok thumbnail" placeholders + 10M+ branding tiles (14 tiles). Yealth card media is a labelled REPLACE block.

## ⚠️ Flagged for your veto

1. **Pathway 04 "Numerology Guidance — Personal readings and guidance rooted in ancient wisdom."** — the only newly-written copy on the page (spec-supplied). Delete the item in `pathways.tsx` if unwanted.
2. **Stats say "63.7K Followers"** per the mission spec, but the old StatsBand rendered suffix **"L"** (63.7L). Spec's explicit figure won; flip `suffix` in `redesign/hero.tsx` if L was intentional.
3. **TikTok "Watch" button → `#`** — no real TikTok URL exists anywhere in the codebase (all socials are `#` TODOs). Same for social icons, Terms, Learn-more targets, anonymous-message link: all kept as `#` exactly as on the current site.
4. **SiteHeader removed from layout** — the hero now owns the nav (ABOUT/PATHWAYS/CONTENT/CONTACT + wordmark). The header's socials remain in the footer; its Chat CTA lives in the hero + FloatingCTA.
5. **SplineSection (this session's earlier WIP) dropped from the page** — not part of the current-site content; component file kept.
6. **Coin = image, not the R3F scene** — the existing three.js coin is a full-viewport scene with DOF/bloom tuned as a hero backdrop; embedding it in a small magnet target would be heavy and mis-framed. Rotating `rs5-back.png` used instead (spec option 2).

## Bugs found & fixed during QA

- **React #418 hydration crash under prefers-reduced-motion** (pre-existing pattern, exposed by QA): `motion/react`'s `useReducedMotion` reads matchMedia synchronously, so the first client render disagreed with SSR HTML. Fixed with `lib/use-reduced-motion-safe.ts` (`useSyncExternalStore`, server snapshot `false`) swapped into `motion-primitives.tsx` and all redesign components; `AnimatedCounter` now always seeds `0`.
- Founder photo hard rectangle edges → overlay-gradient edge dissolve (mask-free).
- ContactButton wrapped to 3 lines at 375px → `whitespace-nowrap`.

## QA summary

- `npm run build`: ✅ zero errors (run after every section + after every fix).
- Playwright harness `qa-screens/qa.mjs` at 375/390/1440/1920: ✅ no horizontal overflow, hero + stats fit above the fold at 375, all anchors resolve, WhatsApp links well-formed (4× `wa.me/23055111364`), no console/page errors, reduced-motion emulation shows all copy at full opacity (screenshots in `qa-screens/`, incl. `reduced-motion-1440.png`).
- Full-page screenshots note: animated (non-reduced) fullPage captures needed a pre-scroll pass so `whileInView` entrances fire — that's a screenshot-tooling artifact, not a site bug.
- qa-tester agent: **PASS** (cycle 1) — build clean; harness clean; nav anchors scroll to real sections; 5× wa.me + mailto + yealth.mu CTAs present; all 14 required copy strings verbatim; Pathways heading rgb(10,10,10) on rgb(255,255,255); 3 sticky cards inside the 375px viewport; zero console/page errors at 375+1440, normal and reduced-motion.
- code-reviewer agent (cycle 1): **FIX FIRST** → fixed in commit `aa23c47`: magnet rewritten (useSyncExternalStore pointer probe + rAF direct-DOM writes, no per-event re-renders), About char indexing made pure (React Compiler lint), Projects depth scale md:-only (mobile card no longer 94%), nav/stat text ≥11px/9.6px + py-3 tap areas, fetchPriority on hero LCP image, marquee layout metrics cached, ContactButton focus ring. Reviewer items intentionally NOT changed (spec-mandated): REPLACE placeholder tiles, `#` link targets, framer-motion/Spline deps + components/ui files (user-requested earlier the same session), Kanit 300–900 weights, committed qa-screens PNGs.
- qa-tester agent (cycle 2): **PASS** — build + harness green; magnet pull/release verified live (`translate3d(20px,13.19px,0)` → identity); card scale 0.94@1440 / none@375; anchors scroll in all 4 configs; zero errors; all copy present.
- code-reviewer agent (cycle 2): **PASS** — fix commit verified end-to-end; no new defects. Its 6 non-blocking polish notes: #1 About overlay line-wrap drift → **fixed** (spaces now between word spans); #4 hero founder img fetchPriority → **fixed** (high kept on coin only); #2 stray qa-temp script → **deleted**; #3 this report line → filled; #5 ContactButton UA-outline stacking → left (the inline decorative `outline` always wins the cascade, so no double indicator actually renders; revisit if the white outline moves to a pseudo-element); #6 STACK_SCALE hardcoded to 3 entries → documented constraint in `projects.tsx` (extend the array when adding a 4th card).

## Suggested polish (not done)

- Real TikTok thumbnails + profile URL; real Yealth card photo; real social URLs.
- Consider `IntersectionObserver`-gating the marquee updates entirely offscreen.
- Kanit 300–900 is 7 weights; trimming to 400/700/900 would cut ~100KB of font payload.
- Delete unused legacy components (`hero.tsx`, `hero-scene.tsx`, `help-cards.tsx`, …) once the redesign is accepted, and drop `three`/`@react-three/*` from deps for a much lighter bundle.
