# Mochiko official website

A mobile-first, multi-page Astro website styled with Tailwind CSS v4 and Phosphor Icons. The visual system uses self-hosted Fredoka and Nunito variable fonts.

## Local development

```bash
npm install
npm run dev
```

Create the production build with:

```bash
npm run build
```

## Editing content

Shared navigation, social links, and content data live in `src/data/site.ts`. Page content lives in `src/pages/`, shared site chrome lives in `src/components/`, and reusable visual styles are in `src/styles/global.css`.

Routes:

- `/`
- `/about`
- `/content`
- `/schedule`
- `/404.html`

API routes:

- `/api/youtube`
- `/api/twitch`

Public images live in `public/assets/` and are referenced as `/assets/filename.ext`.

## Live content

Copy `.env.example` to `.env` for local development, then provide these values:

- `YOUTUBE_API_KEY`
- `TWITCH_CLIENT_ID`
- `TWITCH_CLIENT_SECRET`

Add the same names in Vercel Project Settings under Environment Variables. The public pages fall back to direct YouTube and Twitch links when the API variables are not configured.

## Vercel

Import the GitHub repository in Vercel. The official Astro Vercel adapter builds the pages and live-data endpoints, while `vercel.json` adds cache and security headers.
