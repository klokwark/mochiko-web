# Mochiko official website

A mobile-first Astro website styled with Tailwind CSS v4 and Phosphor Icons.

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

Page copy, navigation, content cards, and social links live in `src/pages/index.astro`. Shared metadata is in `src/layouts/BaseLayout.astro`, while colors and reusable visual styles are in `src/styles/global.css`.

Public images live in `public/assets/` and are referenced as `/assets/filename.ext`.

## Vercel

Import the GitHub repository in Vercel. The included `vercel.json` selects Astro, runs `npm run build`, publishes `dist/`, and adds production-minded cache and security headers.
