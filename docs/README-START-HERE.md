# Techive — new features: how to use these files

Give Devin **one step file at a time, in this order**, and wait until its "Verify" section passes before the next one.

| Order | File | Repo | What it does |
|---|---|---|---|
| 1 | STEP-1-backend-auth.md | techive-api | Email+password login with emailed codes, Google, Microsoft, forgot password, welcome email |
| 2 | STEP-2-backend-academy-cms.md | techive-api | Courses, registrations, progress, editable page text, cookie visitors |
| 3 | STEP-3-frontend-foundation.md | techive-web | New fonts, navbar, right-side mobile drawer, carousel CTAs, public pages, cookie banner |
| 4 | STEP-4-frontend-auth-page.md | techive-web | Glass login / sign-up card with 3D flip |
| 5 | STEP-5-frontend-academy.md | techive-web | Academy page (login required) |
| 6 | STEP-6-frontend-routes.md | techive-web | Routes + cleanup. `npm run build` passes after this |
| 7 | STEP-7-frontend-admin.md | techive-web | Admin: courses, students/progress, edit pages, visitors |
| 8 | STEP-8-setup-deploy-QA.md | both | Microsoft/Google/email setup, env vars, migrations on Neon, QA checklist |
| — | COURSES-brainstorm.md | — | Course ideas to fill in from the admin |

**Why it is written this way:** every code block was taken from a working copy of your repos where I ran the backend tests (47 passing, including the upgrade path for your existing database) and a browser test of the whole flow (sign-up, code, login, quote, Academy registration, admin edits, mobile drawer). Devin only needs to copy files exactly.

## Decisions I made (tell me if you want any changed)
- **Username = email.** There is no separate username, so login uses "Username (email)".
- **TypeScript:** not needed. Styling is Tailwind CSS and works the same in JavaScript, so the project stays JS (smaller, no build changes).
- **Email login = password + emailed code** (as you asked). Google skips the code because Google already verified the email. **Microsoft always gets a code**, because Microsoft does not guarantee the email is verified.
- **Existing users** are marked verified by the migration, so nobody is locked out.
- **Courses are seeded as "coming soon" with no prices.** Nothing can be registered until you set a course to "Open" in Admin → Courses. The seeded descriptions are marked "(Draft: edit in Admin.)".
- **Till number** is only shown to signed-in students after they register; it is not in the public page data. No payment is taken on the site yet.
- **Cookie tracking** only starts after "Accept", stores a random visitor id and page paths, and no IP address. You should add a short privacy policy page before relying on it.
- **Portfolio page** is no longer in the navbar (you asked for four links) but `/portfolio` still works.
- The picture beside the login form is a gradient until you add `public/auth-side.jpg`.
