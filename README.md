# Techive Web (React frontend)

Vite + React 18 + Tailwind 3 + React Router. Separate repo from the Django API (`techive-api`).
Only third-party services: Google sign-in (`@react-oauth/google`) and your media host for videos/images.

## Run
```bash
cp .env.example .env      # set VITE_API_URL and VITE_GOOGLE_CLIENT_ID
npm install
npm run dev               # http://localhost:5173
npm run build             # production build in dist/
```

## Structure (kept deliberately small)
```
src/
  data.js                 ALL site content: nav, hero slides, services, solutions, projects, contact details
  App.jsx / main.jsx      routes (pages are lazy-loaded) + providers
  index.css               Tailwind + shared classes (.btn-*, .card, .input)
  components/
    Layout.jsx            Header (NOT sticky, overlays hero) + Footer
    HeroCarousel.jsx      video carousel (4 slides, 8s auto-advance, arrows, dots)
    ui.jsx                Reveal (scroll fade-in), SectionHead, PageHero, CTA, useSEO
  pages/                  Home, Services, Solutions, Portfolio, About, Academy, Contact, Login, NotFound
  lib/api.js, auth.jsx    fetch wrapper + JWT auth context (email OTP + Google)
public/                   logo.png, logo-light.png, favicon.png, videos/
docs/API_CONTRACT.md      endpoints the backend must provide
docs/DEVIN_PROMPT_FRONTEND.md   prompt to give Devin
```

## Customising
- Text, services, slides, contact info: `src/data.js` (replace the placeholder phone/email/address and the sample portfolio projects).
- Colours: `tailwind.config.js` (`ink`, `brand`). Theme is light gray/white with black sections.
- Hero videos: see `public/videos/README.txt`.

## Deploy
Vercel: see `docs/DEPLOY_VERCEL.md` (`vercel.json` included). Any other static host works too if it falls back to `index.html` for all routes. Set the env vars at build time.

## Notes
- Home is the only eagerly loaded page; the others are code-split. Initial JS is about 64 KB gzip.
- Only the active hero video is mounted; the others load when their slide is shown.
- SEO: per-page titles/descriptions are set client-side. For best results add pre-rendering later and a sitemap.xml/robots.txt.
