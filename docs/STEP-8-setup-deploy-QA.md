# Step 8 — Accounts to set up, deploy, and final QA

**Both repos.** Part A is for **you** (clicking in consoles, no code). Part B is for **Devin**. Paste Part B into Devin when Steps 1–7 are done.

---
## Part A — you do this (about 20 minutes)

### A1. Google sign-in (you already have this; just check)
Google Cloud Console → APIs & Services → Credentials → your **Web application** OAuth client. Under **Authorized JavaScript origins** list: `http://localhost:5173` and your production frontend URL (e.g. `https://techive.vercel.app`). No redirect URIs needed.

### A2. Microsoft sign-in (new, free)
1. Go to <https://entra.microsoft.com> → **App registrations** → **New registration**.
2. Name: `Techive website`. Supported account types: **Accounts in any organizational directory and personal Microsoft accounts**.
3. Redirect URI: platform **Single-page application (SPA)**, value `http://localhost:5173/blank.html`. After creating, open **Authentication** and add a second SPA URI: `https://YOUR-FRONTEND-DOMAIN/blank.html`.
4. Copy the **Application (client) ID**. That is `MICROSOFT_CLIENT_ID` (backend) and `VITE_MICROSOFT_CLIENT_ID` (frontend); it is the same value in both.
5. Leave Microsoft sign-up showing an error until this is set; the button says "Microsoft sign-in is not configured yet." That is expected.

### A3. Email sending (needed for OTP, welcome and course emails)
Django sends mail through any SMTP account. In the backend env set:
```
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.yourprovider.com
EMAIL_PORT=587
EMAIL_HOST_USER=...
EMAIL_HOST_PASSWORD=...
EMAIL_USE_TLS=True
DEFAULT_FROM_EMAIL=Techive IT Solutions <no-reply@yourdomain>
TEAM_EMAIL=the inbox that receives quotes and course registrations
```
(Gmail works with an *App Password*; a business mailbox works too.) Without this, codes are only printed in the server log and real users cannot sign in.

---
## Part B — prompt for Devin

You are finishing a feature rollout across two repos: `techive-api` (Django) and `techive-web` (React). Steps 1–7 are already applied. Do exactly this, in order, and report the output of each check.

### B1. Backend env on Vercel (project `techive-api`) — Settings → Environment Variables
Add or confirm: `SECRET_KEY`, `DEBUG=False`, `ALLOWED_HOSTS` (include the API domain), `CORS_ALLOWED_ORIGINS` (the frontend URL, no trailing slash), `CSRF_TRUSTED_ORIGINS`, `DATABASE_URL` (Neon **pooled** string), `ADMIN_EMAILS`, `GOOGLE_CLIENT_ID`, **`MICROSOFT_CLIENT_ID`** (new), **`FRONTEND_URL`** (new; the frontend URL, used for links in emails), and the email variables from A3.

### B2. Run migrations once against Neon (from your machine, NOT on Vercel)
```bash
cd techive-api
DATABASE_URL="<neon string>" python manage.py migrate
```
This adds the new account columns, marks existing users verified, creates the course/content/visitor tables and seeds 6 draft courses (all "coming soon").

### B3. Frontend env on Vercel (project `techive-web`)
Confirm `VITE_API_URL`, `VITE_GOOGLE_CLIENT_ID`, and add **`VITE_MICROSOFT_CLIENT_ID`** (new). Redeploy both projects.

### B4. QA checklist (do each one on the deployed site, desktop width and a 390 px phone width)
1. Home: nav shows only HOME, FEATURES, ABOUT, CONTACT and a "Login" pill on the far right. Only Home has the video carousel. The carousel shows a "Get a Quote" button and a "Join our new courses" Academy card.
2. Phone: hamburger opens a slide-in drawer from the **right** with Login/profile at the top. Logo is smaller. Service cards are **2 per row**. No sideways scrolling.
3. Signed out, click Academy or Get a Quote → the **login** card appears (not sign-up).
4. Sign up (Academy link) with email + password → 6-digit email arrives → enter it → you land on the Academy page, logged in, header shows your name.
5. Log out, log in with email + password → code emailed → enter → logged in. Wrong password shows "Incorrect email or password."
6. "Forgot password?" → code → new password → can log in with it.
7. Google: on login with an email that has **no account** → "No account found" popup → "Create account" flips to sign-up. Google sign-up creates the account, shows your Google photo in the navbar, no code needed.
8. Microsoft sign-up → code is emailed → enter → logged in (only after A2).
9. Admin (email in `ADMIN_EMAILS`) → `/admin` → Courses: edit one course, set price/duration/mode, set status **Open**, Save. Back on `/academy` that course shows **Register**. Register → rules + payment plan + till number shown; the student gets an email; the team inbox gets a notice.
10. Admin → Students: set progress to 40 and a note. As that student, `/academy` shows the 40 % bar and note.
11. Admin → Pages: change the Home first headline, Save, reload Home: new text shows. "Restore defaults" brings the original back.
12. Accept the cookie banner on a private window → Admin → Visitors shows a row. Decline → no row.

Report any failing item with the exact error text.
