# Mochiko Website — Agent Guide

This repository is the production source for Mochiko’s personal VTuber website. Treat it as a designed character site, not a generic creator template.

## Stack and deployment

- Astro with TypeScript and the Vercel adapter.
- Tailwind utilities are available, but the visual system primarily lives in `src/styles/global.css`.
- Phosphor Icons is the only icon library. Use `ph`, `ph-fill`, and the appropriate icon class.
- Production deploys from the `main` branch through Vercel.
- `vercel.json` contains deployment configuration and must remain compatible with Astro’s server output.

## Important files

- `src/layouts/BaseLayout.astro`: global metadata, fonts, transition router, and page transition behavior.
- `src/components/SiteHeader.astro`: navigation and live-state treatment.
- `src/components/SiteFooter.astro`: footer navigation, social links, legal links, and sitting character artwork.
- `src/components/PrivacyConsent.astro`: consent gate for optional third-party content.
- `src/data/site.ts`: navigation, social links, favorite games, music, and reusable site content.
- `src/pages/index.astro`: home page.
- `src/pages/about.astro`: biography, personal details, games, music, and Jannik section.
- `src/pages/content.astro`: Twitch player/status/VOD and latest YouTube uploads.
- `src/pages/schedule.astro`: Twitch schedule.
- `src/pages/privacy.astro`: formal GDPR/privacy information.
- `src/pages/404.astro`: full-viewport custom not-found page.
- `src/pages/api/`: credential-free server endpoints/proxies for public Twitch and YouTube information.
- `public/assets/`: all artwork served locally by Vercel.

## Design direction

The target is soft, bubbly, girly, playful, and custom-made. It should feel polished enough to be commissioned work, while still feeling like Mochiko decorated it herself.

- Use rounded asymmetric cards, thick dark outlines, pink/lilac/paper backgrounds, stickers, dots, grids, bows, and small computer UI references.
- Avoid generic SaaS layouts, harsh rectangular grids, empty white sections, or repeating the same image-left/text-right arrangement.
- Do not add glow effects.
- Do not use floating, bouncing, or scroll-triggered fade-in animation.
- Motion should use clipping, wipes, snapping panels, short rotations, stepped UI movement, or direct transforms.
- Page transitions should be obvious, playful, and respect `prefers-reduced-motion`.
- Decorative character artwork should interact with the layout: sit on boundaries, peek from corners, overlap a card, or anchor a section. Do not scatter tiny disconnected stickers everywhere.
- Use different artwork across sections and pages. Do not turn a single page into a dump of every new asset.
- Emotion artwork is functional UI. Use it for live, offline, loading, error, privacy, and missing-page states, and keep it large enough to read clearly on desktop.
- Keep mobile layouts intentional. Character art must remain visible, uncropped at important facial/body details, and must not create horizontal scrolling.

## Artwork rules

- Always use optimized WebP assets in `public/assets`; do not ship source PNGs or ZIP files.
- Preserve transparent backgrounds.
- Add meaningful alt text when an image communicates content. Use empty alt text for purely decorative images.
- Provide explicit width and height attributes to reduce layout shift.
- Use `fetchpriority="high"` only for the main above-the-fold image. Lazy-load lower-page artwork.
- Reuse is allowed when the pose genuinely fits the composition, but avoid showing the same pose repeatedly on adjacent pages.
- `public/assets/emotions/` contains state illustrations, not a general gallery.
- `public/assets/outfits/` contains alternate full-body looks. Distribute selected looks across the site where they support the section.
- `headphones-sitting.webp` and other sitting poses work best resting on a section edge, card, or footer rather than hovering in empty space.
- `acrobat.webp` is a sideways action pose and works best in dynamic or error compositions.

## Voice and copy

Write in Mochiko’s first-person voice: short, direct, silly, cute, and natural.

- Prefer lowercase for playful UI copy.
- Keep jokes specific to games, outfits, buttons, files, PCs, saving, loading, and getting distracted.
- A little retro-computer language is good. Do not put `.exe`, fake system text, or data jokes on every section.
- Do not describe Mochiko as “child-like” or a “catgirl.”
- Do not mention age regression or Mochiko’s age.
- Do not say she sings or imply singing content.
- Do not list birthday, languages, fan names, or hashtags.
- Avoid stock creator phrases such as “cozy streams,” “lots of yapping,” “cute moments,” “safe space,” or “make the internet softer.”
- Avoid repeating “cozy,” “cute,” “comfy,” “games and giggles,” and heart symbols in every paragraph.
- Do not write instructions about how the visitor should feel. Show personality through details instead.
- References to Jannik should say they are friends who often play/stream together. One small “don’t ship us” line on About is enough; do not repeat it elsewhere.
- Privacy/legal copy must stay clear and formal. The consent popup may contain one small joke, such as “data is not tasty anyway.”

## Page-specific expectations

### Home

- Introduce Mochiko immediately with strong character art and two obvious actions.
- Show live Twitch status only after consent.
- Include compact previews of About, Jannik, favorite games/music, content, and social links.
- Use character decoration on section boundaries to connect long sections visually.

### About

- Keep the pronunciation `ˈmɔtʃiːˌkoː` near Mochiko’s name.
- Make it personal and visual, not a résumé or database.
- Include favorite games, favorite artist/song, interests, and the small Jannik note.
- Do not build an outfit selector, closet app, or gallery containing every outfit.
- Use one or two strong character images per major composition and vary alignment.

### Content

- Show the current Twitch stream when live, otherwise a useful offline state.
- Autoplay the Twitch embed muted after consent.
- Show the latest four YouTube videos and newest Twitch VOD through the local API routes.
- Keep loaders seamless and replace them with clear fallbacks when upstream data fails.

### Schedule

- Fetch schedule information through the local Twitch API route after consent.
- Display times in the visitor’s timezone.
- Use a tall outfit/pose that balances the schedule list; do not use the sideways acrobat pose here.

### Privacy and consent

- No optional Twitch/YouTube/DecAPI browser resources before consent.
- Store the privacy choice in `localStorage` under `mochiko_privacy_choice` without an automatic expiry.
- A visitor who declines must still be able to use every local page and direct external link.
- Keep the complete provider list accurate whenever an external service changes.

### 404

- Must fill the viewport and never scroll.
- Must have obvious Home and Content exits.
- Use a strong visual joke/composition, not a normal content card centered in empty space.

## Implementation conventions

- Prefer semantic Astro markup and CSS over client JavaScript.
- Add JavaScript only for data fetching, consent behavior, navigation state, or meaningful interaction.
- Reinitialize page-specific client behavior after `astro:page-load` when needed because Astro view transitions preserve navigation.
- Guard initialization to prevent duplicate event listeners.
- Keep external embeds and network calls behind the privacy preference.
- Never add secrets, API keys, tracking, analytics, advertising pixels, or contact forms.
- Do not hotlink artwork that can legally and practically be stored locally.
- Keep routes multipage; do not turn the project into a single-page app.

## Before committing

- Confirm the requested images are actually used and not merely copied into `public/assets`.
- Confirm no original ZIP/PNG upload was committed when an optimized WebP exists.
- Check desktop and narrow mobile composition when the request allows checks.
- Run `npm run build` unless the user explicitly asks to skip builds/checks.
- Commit only task-related files and preserve unrelated user changes.
- Push to `main` only when the user requests a direct production update.
