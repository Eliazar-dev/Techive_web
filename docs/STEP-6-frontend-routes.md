# Step 6 — Frontend: routes and cleanup (build must pass after this)

**Repo: `techive-web`.** Do Steps 3, 4 and 5 first. Paste this whole file into Devin.


## Rules for Devin (read before you start)
1. Work in the repo named in the step (`techive-api` = Django, `techive-web` = React). Never mix them.
2. **Copy every code block EXACTLY as written.** Do not rename, reformat, "improve", add comments, add dependencies, or split files. If a file says REPLACE, overwrite the whole file. If it says CREATE, make a new file at that exact path.
3. **NEVER delete or edit existing migration files** in `accounts/migrations` or `core/migrations`. Only add the new ones listed.
4. Do not touch any file that is not listed in the step.
5. Run every command in the "Verify" section. If something fails, show me the full error output instead of guessing a fix.
6. Do the steps in order. Do not start the next step until the Verify section of the current step passes.

## Commands
```bash
rm src/pages/Login.jsx src/pages/Services.jsx src/pages/Solutions.jsx
```
(Those three pages are replaced by `Auth.jsx` and `Features.jsx`. Old links `/login`, `/services`, `/solutions` redirect automatically via the new routes.)

## Files

### `src/App.jsx`  —  REPLACE

~~~~jsx
import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import RequireAuth from './components/RequireAuth'
import CookieBanner from './components/CookieBanner'
import Home from './pages/Home' // eager: first paint

// every other page is code-split → small initial bundle
const Features = lazy(() => import('./pages/Features'))
const Portfolio = lazy(() => import('./pages/Portfolio'))
const About = lazy(() => import('./pages/About'))
const Academy = lazy(() => import('./pages/Academy'))
const Contact = lazy(() => import('./pages/Contact'))
const Quote = lazy(() => import('./pages/Quote'))
const Admin = lazy(() => import('./pages/Admin'))
const Auth = lazy(() => import('./pages/Auth'))
const NotFound = lazy(() => import('./pages/NotFound'))

export default function App() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ink" />}>
      <Routes>
        <Route path="auth" element={<Auth />} />
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="features" element={<Features />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="portfolio" element={<Portfolio />} />
          <Route path="quote" element={<RequireAuth><Quote /></RequireAuth>} />
          <Route path="academy" element={<RequireAuth from="academy"><Academy /></RequireAuth>} />
          <Route path="admin" element={<Admin />} />
          {/* old links keep working */}
          <Route path="login" element={<Navigate to="/auth" replace />} />
          <Route path="signup" element={<Navigate to="/auth?mode=signup" replace />} />
          <Route path="services" element={<Navigate to="/features" replace />} />
          <Route path="solutions" element={<Navigate to="/features" replace />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      <CookieBanner />
    </Suspense>
  )
}
~~~~

## Verify
```bash
npm run build        # must pass with no errors now (Admin.jsx is unchanged until Step 7 and still compiles)
npm run dev
```
Open these in the browser and confirm no console errors: `/`, `/features`, `/about`, `/contact`, `/auth`, `/auth?mode=signup`. Open `/academy` and `/quote` while signed out: both must redirect to `/auth` (you stay on the login card; `/academy` shows the Academy header after you click Sign up). `/login`, `/services`, `/solutions` must redirect.
