# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Static HTML/CSS/vanilla JS (no framework, no build step), deployed on Vercel. Two serverless functions under `api/` (`clash.js`, `youtube.js`) proxy live Clash Royale stats and a YouTube Music playlist. `supabase/` backs the anonymous notes wall. Existing codebase; not a greenfield choice.

## Users

Anyone who ends up with the link — friends, family, recruiters, strangers who stumble in. No single target audience; the site is written to work as a personality piece for whoever opens it, not a funnel for one kind of visitor.

## Product Purpose

Martin Tiwari's personal site: a "corner of the internet," explicitly **not** a CV or portfolio. It exists to let a visitor spend a few minutes getting a real sense of who Martin is — family, cat, humor, taste in music, daily life in Kathmandu — through scroll-driven storytelling and small interactive bits, not a resume format.

## Positioning

Deliberately anti-CV: no grades, no "passionate self-starter" copy, no corporate portfolio conventions. The mechanism a generic portfolio template can't copy is that it behaves like a physical object (arrives "as mail," has tactile photo-wall/card/badge interactions) and it's funny — sarcastic, deadpan, self-aware copy throughout, not polished marketing voice.

## Operating Context

Single static page, scroll-driven, no login. Real interactive surfaces: an HTML canvas whiteboard visitors can draw on, an anonymous notes wall backed by Supabase, a flip-card "rapid fire" stack, a lightbox photo wall, a draggable ID badge, and a live now-playing/Clash Royale stats strip fed by the two serverless endpoints. A cat mascot (HARU) roams the page as an animated element. Session-scoped intro (an "envelope" opening animation) gates first visit only.

## Capabilities and Constraints

- No backend beyond the two `api/` proxies and Supabase for notes — no user accounts, no CMS.
- Real personal photos and family members are named and pictured (mom, two sisters, saili maiju, dad running a running joke about being an unphotographed "cryptid," girlfriend deliberately kept anonymous/sealed).
- HARU is a real cat (ginger tabby), birthday Dec 24 — established personal facts, not placeholder content.
- Copy is a first-person, sarcastic-deadpan voice throughout; this voice is a product fact, not a styling choice, and should be treated as content to preserve or rewrite deliberately, not to be replaced with generic marketing tone.
- Which specific sections/copy may be cut or rewritten during the redesign is **not yet decided** — confirm scope with the user section-by-section as the new-work pass reaches them, rather than assuming everything ships as-is or assuming anything is free to cut.

## Brand Commitments

- Name/domain: Martin Tiwari, martintiwari.com.np.
- HARU the cat is a recurring, load-bearing character (site mascot, "head of security," roams the page).
- Voice: sarcastic, warm, self-deprecating, Nepali-English code-switching (chiya, saachi, la, Dashain, hamro patro dates) — this is Martin's actual voice, not a bit invented for the site, and is a binding constraint on any copy rewrites.

## Evidence on Hand

Real assets exist in `assets/`: family and personal photos (martin-cutout, haru, graduation, sis-big/small, maiju, dad-topi, chiya, rooftop, kids-cutout, etc.), a signature image, and a badge photo. No stock photography is used anywhere; do not introduce any. No testimonials, pricing, or case studies apply — this is not that kind of product.

## Product Principles

1. Personality over presentation-of-achievement — the site is evidence of a person, not a resume.
2. Physical-object metaphor: interactions should feel like handling real paper/objects, not clicking abstract UI (this is a principle to preserve even if the specific paper-and-ink execution is replaced).
3. Real content only — real family, real cat, real photos, real handles. Never fabricate people, quotes, or stats.
4. Humor and voice are the product, not decoration on top of it — copy carries as much weight as visuals.
5. Works for a cold, undirected visitor — no login, no context needed, scroll-driven and self-explanatory.

## Accessibility & Inclusion

No formally required standard confirmed. `prefers-reduced-motion` is already respected throughout the current implementation (animations disabled/shortened); preserve that behavior in any redesign.
