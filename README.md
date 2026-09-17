# Mochiko official website

A mobile-first, multi-page Astro website styled with Tailwind CSS v4 and Phosphor Icons. The visual system uses self-hosted Fraunces and Plus Jakarta Sans variable fonts.

## Local development

```bash
npm install
npm run dev
```

The production build is generated in `dist/`:

```bash
npm run build
npm run preview
```

## Editing content

Shared navigation, social links, and content data live in `src/data/site.ts`. Page content lives in `src/pages/`, shared site chrome lives in `src/components/`, and reusable visual styles are in `src/styles/global.css`.

Routes:

- `/`
- `/about`
- `/content`
- `/schedule`
- `/credits`
- `/404.html`

Public images live in `public/assets/` and are referenced as `/assets/filename.ext`.

## Vercel

Import the GitHub repository in Vercel. The included `vercel.json` selects Astro, runs `npm run build`, publishes `dist/`, and adds production-minded cache and security headers.
