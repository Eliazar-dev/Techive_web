# Prompt for Devin: Techive frontend

Copy everything below the line into Devin.

---

You are working in the repository **techive-web** (React 18 + Vite + Tailwind 3, JavaScript, no TypeScript). It is the public website for **Techive IT Solutions: "Archiving Innovation. Coding the Future."** The backend is a SEPARATE Django REST repo; do not add backend code here.

## Setup
1. `cp .env.example .env` and fill `VITE_API_URL` and `VITE_GOOGLE_CLIENT_ID` (ask me if you don't have them).
2. `npm install && npm run dev`. `npm run build` must pass with no errors.

## Read first
- `README.md` (structure), `docs/API_CONTRACT.md` (endpoints the backend provides), `src/data.js` (all content).

## Rules
- Keep the codebase small: no new dependencies unless essential; no UI kits, animation libraries or state libraries.
- Keep Tailwind utilities plus the shared classes in `src/index.css`. Theme: light gray/white sections mixed with black sections. The gradient accent (cyan to violet) is only for primary buttons and small highlights.
- The header must stay NOT sticky (absolute, overlaying the hero/page banner). The logo stays large.
- Performance: pages stay lazy-loaded, images use `loading="lazy"` with width/height, only the active hero video is mounted.
- Accessibility: visible focus states, alt text, labels on all form fields, keyboard-operable carousel.
- Do not invent facts (client names, stats, prices, testimonials). Use clearly marked placeholders.

## Tasks
1. Verify every route in `src/App.jsx` renders on desktop and mobile (390px) with no console errors and no horizontal scroll.
2. Add the real hero videos (see `public/videos/README.txt`). If they are hosted externally, set `VITE_MEDIA_URL`. Check autoplay works on iOS Safari (muted + playsInline are already set).
3. Replace the placeholder contact details and sample portfolio items in `src/data.js` with the real ones I provide; add real project screenshots (webp, lazy-loaded) to `Portfolio.jsx`.
4. Wire up against the running Django API: sign-in-gated quote form, email OTP login, Google login, Academy waitlist and the /admin dashboard. Show clear error and loading states. Confirm token refresh works (`src/lib/api.js`).
5. Add `public/robots.txt` and `public/sitemap.xml`, canonical tags and an Open Graph image. Add pre-rendering for SEO if it can be done without heavy dependencies.
6. Deploy to Vercel following `docs/DEPLOY_VERCEL.md` (`vercel.json` already has the SPA rewrite). Set `VITE_API_URL` to the deployed API, add the Google authorized origin, and verify deep links (`/services`, `/admin`) work on refresh.
7. Run Lighthouse (mobile). Targets: Performance 90+, Accessibility 95+, SEO 95+. Fix what is below target.

## Done when
`npm run build` passes, all pages work against the real API, the Lighthouse targets are met, and your PR description lists what you changed.
