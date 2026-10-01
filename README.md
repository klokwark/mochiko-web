# Mochiko official website

Mochiko’s creator website, adapted from [Kanade by sudoriaa](https://github.com/sudoriaa/Kanade-Astro/tree/codex/astro-theme). See [THEME-CREDITS.md](THEME-CREDITS.md) for the source snapshot and attribution.

The site keeps Kanade’s illustrated header, layered waves, pastel cards, three-column desktop layout, search, and light/dark modes. Everything is adapted into English for streams, videos, games, music, and Mochiko’s profile.

## Development

```bash
npm ci
npm run dev
npm run build
```

`npm run build` runs Astro/TypeScript checks and produces the Vercel deployment output.

## Content and design

- `src/data/site.ts`: social links, favorite games, music, and creator descriptions.
- `src/layouts/CreatorLayout.astro`: shared Kanade-inspired page shell.
- `src/components/header/Welcome.astro`: illustrated header and waves.
- `src/components/home/`: profile, favorites, music, and community sidebars.
- `src/styles/global.css`: light/dark design tokens and responsive layouts.
- `src/scripts/site.ts`: mobile navigation, search, theme, and privacy choices.
- `src/scripts/media.ts`: consent-gated feeds, player, VOD, and schedule.
- `public/assets/`: local artwork, game covers, and music images.

Routes: `/`, `/about`, `/content`, `/schedule`, `/privacy`, and the custom 404.

Search uses actual local pages, favorites, and social links; Ctrl/⌘ K opens it. Theme choice is stored as `mochiko_theme`. Native page navigation is used, so each page starts with fresh event handlers and media requests.

## Live content and privacy

The existing credential-free `/api/twitch` and `/api/youtube` routes use DecAPI, Twitch’s public calendar, and YouTube’s RSS feed. No API keys are required. Existing deployment environment variables may remain, but these routes do not read them.

Optional media and API requests start only after consent. The choice is stored as `mochiko_privacy_choice`, without automatic expiry. Withdrawal cancels in-flight requests and removes loaded embeds and thumbnails. Direct channel links remain usable when media is blocked or a provider is unavailable. Stream times are formatted in the visitor’s timezone.

## Deployment

The Astro Vercel adapter and `vercel.json` remain in place. Production uses `main`; this redesign is isolated on `codex/kanade-creator-theme`. Merging is a separate action.

The footer credits Kanade and its original developer, sudoriaa.
