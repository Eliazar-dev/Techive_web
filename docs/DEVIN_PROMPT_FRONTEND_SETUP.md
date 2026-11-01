# Prompt for Devin: initialize the Techive frontend and connect it to the backend

Copy everything below the line into Devin.

---

You are setting up the repository **techive-web** (React 18 + Vite + Tailwind 3, plain JavaScript) so that it runs locally and talks to the Django API in the separate repo **techive-api**. Read `README.md` and `docs/API_CONTRACT.md` first. Do not change endpoint paths or response shapes, and keep the codebase small: no new dependencies, UI kits, animation libraries or state libraries.

## 1. Initialize and run
1. Make sure the backend is running first (`techive-api`: `python manage.py runserver 8000`). Open `http://localhost:8000/` and confirm it shows the "API is running" status page.
2. In `techive-web`: `cp .env.example .env` and set:
   - `VITE_API_URL=http://localhost:8000/api`
   - `VITE_GOOGLE_CLIENT_ID=<my Google OAuth web client ID>` (leave empty to hide the Google button; ask me for it)
   - `VITE_MEDIA_URL=` (leave empty to use `/videos`)
3. `npm install && npm run dev` (http://localhost:5173) and `npm run build`. Both must succeed with no errors.
4. The backend's `.env` must contain `CORS_ALLOWED_ORIGINS=http://localhost:5173`. If you see CORS errors in the browser console, fix that variable, not the frontend.

## 2. Verify the connection (do each step in a real browser and report the result)
- **Pages:** `/`, `/services`, `/solutions`, `/portfolio`, `/about`, `/academy`, `/contact`, `/login`, plus an unknown URL (404 page). No console errors, no horizontal scroll at 1280px and at 390px.
- **Home:** the hero is a video carousel (4 slides, auto-advance every 8 s, arrows and dots work). The header is NOT sticky: it scrolls away with the page. If the video files are missing the hero falls back to a dark gradient; that is expected until I add the videos.
- **Quote gate:** opening `/contact` while signed out shows "Sign in to request a quote". Clicking it goes to `/login?next=/contact`.
- **Email OTP:** enter an email, press "Email me a code", read the 6-digit code from the backend terminal (console email backend), enter it. You must land back on `/contact`. A wrong code shows an error; "Resend" is disabled for 60 s.
- **Quote:** submit the quote form while signed in and confirm the success message. The quote must appear in `/admin` (next step).
- **Admin:** sign in with the email listed in the backend `ADMIN_EMAILS`. The header shows an "Admin" link and `/admin` shows Overview, Quotes, Users and Academy waitlist. Change a quote's status and add a note; reload and confirm they persisted. Signed in as a normal user, `/admin` must show an "access denied" message, and signed out it must redirect to login.
- **Academy:** `/academy` shows the 9 courses (Tailwind, Python, Ruby, JavaScript, Next JS, C Language, Fullstack Engineering, Data Science, Graphic Design), the "Coming Soon" banner and the waitlist form. Submitting the waitlist form shows the success state; submitting the same email again also succeeds.
- **Google (only if I gave you the client ID):** the "Continue with Google" button appears on `/login`. In Google Cloud Console, add `http://localhost:5173` to **Authorized JavaScript origins** of the same client ID used in the backend `GOOGLE_CLIENT_ID`, then test a real sign-in.
- **Token refresh:** in DevTools edit the stored `access` token in localStorage (key `techive_tokens`) to garbage, reload `/admin`, and confirm the app silently refreshes or sends you to login without a crash.

## 3. Deploy (Vercel)
Follow `docs/DEPLOY_VERCEL.md`: import the repo as a Vite project, set `VITE_API_URL` to the deployed API (`https://<api-domain>/api`) and `VITE_GOOGLE_CLIENT_ID`, deploy, then:
- on the API project set `CORS_ALLOWED_ORIGINS` to the exact frontend URL (no trailing slash) and redeploy it;
- add the frontend URL to Google **Authorized JavaScript origins**;
- confirm deep links (`/services`, `/admin`) work on page refresh (`vercel.json` already has the rewrite).

## Rules
- Never commit `.env` or secrets.
- Do not invent facts (client names, statistics, prices, testimonials). Placeholders in `src/data.js` (phone, email, address, sample portfolio) are mine to replace; list them for me.
- Keep Tailwind utilities and the shared classes in `src/index.css`; keep the light gray/white + black theme.

## Done when
`npm run build` passes, every check in section 2 is verified in a browser against the running backend, the deployed site works against the deployed API, and you give me a short list of what you found, what you fixed and which placeholders I still need to replace.
