# Mochiko official website

A static, responsive personal website for Mochiko. It uses plain HTML, CSS, and a small amount of vanilla JavaScript, so it can be uploaded directly to Vercel, GitHub Pages, Cloudflare Pages, Netlify, or any other static host. A branded `404.html` page and production-minded `vercel.json` are included.

## 1. Change the name, bio, and profile details

Open `index.html` and search for bracketed placeholders such as:

- `[BIO]`
- `[LORE / CHARACTER DESCRIPTION]`
- `[DEBUT DATE]`
- `[BIRTHDAY]`
- `[LANGUAGES]`
- `[FAN NAME]`
- `[HASHTAGS]`

The visible name is already set to Mochiko. Update the page description and structured data near the top of `index.html` if the final wording changes.

## 2. Change social URLs

All social links are grouped inside the `#links` section of `index.html`. Twitch, YouTube, Ko-fi, and Discord already use the provided URLs.

Search for these placeholders and replace them with complete URLs and handles:

- `[TWITTER URL]` and `[TWITTER HANDLE]`
- `[BLUESKY URL]` and `[BLUESKY HANDLE]`
- `[TIKTOK URL]` and `[TIKTOK HANDLE]`
- `[INSTAGRAM URL]` and `[INSTAGRAM HANDLE]`
- `[VGEN URL]` and `[VGEN PROFILE]`

To enable the light YouTube player, replace `[YOUTUBE VIDEO ID]` with the 11-character ID from a YouTube video URL. Until then, the featured image links to the Mochiko YouTube channel.

## 3. Replace artwork

Artwork lives in `assets/`. Images below the opening screen are lazy-loaded.

- Hero model: `assets/model.webp` (optimized from `avatar-main.png`)
- About artwork: `assets/about.webp` (optimized from `cute-pose-1.png`)
- Featured content: `assets/content-singing.webp`, `assets/content-gaming.webp`, and `assets/content-cute.webp`
- Credits artwork: `assets/credits.webp`
- Navigation wordmark: `assets/logo.webp`
- Footer mark: `assets/bunny-mark.webp`
- Social sharing image: `assets/og-image.jpg`

The model slots expect transparent PNG or WebP artwork. Keep roughly the same aspect ratio to avoid needing layout changes.

## 4. Change colors and fonts

Edit the variables at the very top of `style.css`:

```css
:root {
  --background: #fff9fb;
  --foreground: #17131a;
  --muted: #756c75;
  --primary: #f6a8c5;
  --secondary: #dcd2ed;
  --border: #2b252d;
  --display-font: "Syne", sans-serif;
  --body-font: "Manrope", sans-serif;
}
```

The matching Google Fonts request is in the `<head>` of `index.html`.

## 5. Edit the schedule

In `index.html`, find the comment `SCHEDULE`. Each day is one `<li>`.

- Replace `[DATE]`, `[STREAM TITLE]`, and `[APPROX. TIME]`.
- Change `[TIMEZONE]` above the schedule.
- Add `class="is-off"` to a quiet day and use `Rest day` as its title.
- Remove `class="is-off"` when adding a stream.

## 6. Finish contact, credits, and sharing details

Replace `[BUSINESS EMAIL]` in both the visible text and the `mailto:` link. Creator credit names and URLs are grouped in the credits section.

Before launch, replace `[CANONICAL URL]` everywhere in `index.html` with the full domain, including `https://`. Also replace `[YEAR]` in the decorative hero line.

The live indicator is controlled near the top of `script.js`:

```js
const SITE_SETTINGS = {
  isLive: false
};
```

Change it to `true` while live.

## 7. Deploy

No build step is required. Upload these items to the root of any static host:

- `index.html`
- `style.css`
- `script.js`
- the complete `assets/` folder

For GitHub Pages, open the repository settings, choose **Pages**, select **Deploy from a branch**, then choose the `main` branch and `/ (root)`.

For Vercel, import the GitHub repository and keep the framework preset set to **Other**. No build command or output directory is needed.
