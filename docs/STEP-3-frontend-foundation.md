# Step 3 — Frontend: fonts, navbar, drawer, carousel, public pages

**Repo: `techive-web`.** Do Steps 1 and 2 first (backend). Paste this whole file into Devin.


## Rules for Devin (read before you start)
1. Work in the repo named in the step (`techive-api` = Django, `techive-web` = React). Never mix them.
2. **Copy every code block EXACTLY as written.** Do not rename, reformat, "improve", add comments, add dependencies, or split files. If a file says REPLACE, overwrite the whole file. If it says CREATE, make a new file at that exact path.
3. **NEVER delete or edit existing migration files** in `accounts/migrations` or `core/migrations`. Only add the new ones listed.
4. Do not touch any file that is not listed in the step.
5. Run every command in the "Verify" section. If something fails, show me the full error output instead of guessing a fix.
6. Do the steps in order. Do not start the next step until the Verify section of the current step passes.

## Commands (run in `techive-web`)
```bash
npm uninstall @fontsource-variable/inter
npm install @fontsource-variable/plus-jakarta-sans@^5 @fontsource-variable/sora@^5 @azure/msal-browser@^3.30.0
```
**Important:** Steps 3, 4, 5 and 6 are ONE migration. `npm run build` will only pass after Step 6 (old pages still import things this step removes). During steps 3–5 do not run the build and do not try to fix errors from old pages (`Services.jsx`, `Solutions.jsx`, `Login.jsx`, old `Academy.jsx`); Step 6 deletes or replaces them.

## Files

### `tailwind.config.js`  —  REPLACE

~~~~javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans Variable"', 'system-ui', 'sans-serif'],
        display: ['"Sora Variable"', '"Plus Jakarta Sans Variable"', 'system-ui', 'sans-serif'],
      },
      colors: { ink: '#0a0a0b', brand: { cyan: '#06c3ff', violet: '#a855f7', blue: '#2563eb' } },
      backgroundImage: { 'brand-grad': 'linear-gradient(90deg,#06c3ff,#7c5cff 60%,#a855f7)' },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        fadeUp: { '0%': { opacity: 0, transform: 'translateY(16px)' }, '100%': { opacity: 1, transform: 'none' } },
        float: { '0%,100%': { transform: 'translate(0,0) scale(1)' }, '50%': { transform: 'translate(30px,-24px) scale(1.08)' } },
        shine: { '0%': { transform: 'translateX(-120%) skewX(-20deg)' }, '100%': { transform: 'translateX(320%) skewX(-20deg)' } },
        pop: { '0%': { opacity: 0, transform: 'scale(.92) translateY(8px)' }, '100%': { opacity: 1, transform: 'none' } },
      },
      animation: {
        'fade-up': 'fadeUp .7s ease both',
        'fade-in': 'fadeIn 1s ease both',
        float: 'float 14s ease-in-out infinite',
        shine: 'shine 2.6s ease-in-out infinite',
        pop: 'pop .35s ease both',
      },
    },
  },
  plugins: [],
}
~~~~

### `src/index.css`  —  REPLACE

~~~~css
@import '@fontsource-variable/plus-jakarta-sans';
@import '@fontsource-variable/sora';
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html { scroll-behavior: smooth; }
  body { @apply bg-zinc-50 font-sans text-ink antialiased; }
  h1, h2, h3, h4 { @apply font-display; }
  ::selection { background: #0a0a0b; color: #fff; }
}

@layer components {
  .container-x { @apply mx-auto w-full max-w-7xl px-5 sm:px-8; }
  .btn { @apply inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition duration-200 active:scale-95 disabled:opacity-60; }
  .btn-grad { @apply btn bg-brand-grad text-white shadow-lg shadow-brand-cyan/25 hover:brightness-110; }
  .btn-dark { @apply btn bg-ink text-white hover:bg-zinc-800; }
  .btn-light { @apply btn border border-zinc-300 bg-white text-ink hover:border-ink; }
  .btn-ghost { @apply btn border border-white/70 text-white hover:bg-white hover:text-ink; }
  .eyebrow { @apply inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[.25em] text-zinc-500; }
  .eyebrow::before, .eyebrow::after { content: ''; @apply h-px w-10 bg-brand-grad; }
  .card { @apply rounded-2xl border border-zinc-200 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5; }
  .input { @apply w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10; }

  /* ---- glassmorphism auth page ---- */
  .auth-bg { background: radial-gradient(60rem 40rem at 10% 0%, #1d4ed855, transparent), radial-gradient(50rem 38rem at 100% 100%, #a855f755, transparent), linear-gradient(135deg, #0b0b1a, #14102b 45%, #0a1530); }
  .glass { @apply border border-white/20 bg-white/10 shadow-2xl shadow-black/40 backdrop-blur-2xl; }
  .glass-input { @apply w-full border-0 border-b border-white/40 bg-transparent py-3 pl-9 pr-9 text-sm text-white outline-none transition placeholder:text-white/60 focus:border-brand-cyan; }
  .btn-shine { @apply relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-brand-blue via-[#7c5cff] to-brand-violet py-3.5 text-sm font-bold uppercase tracking-[.2em] text-white shadow-lg shadow-brand-violet/30 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 active:scale-[.98] disabled:opacity-60; }
  .btn-shine::after { content: ''; @apply absolute inset-y-0 left-0 w-1/4 animate-shine bg-white/30; }
  .social-btn { @apply relative flex h-10 w-full items-center justify-center gap-3 overflow-hidden rounded-xl border border-white/25 bg-white/10 text-sm font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:border-white/50 hover:bg-white/20 hover:shadow-lg active:scale-[.98]; }
}

/* scroll reveal */
.reveal { opacity: 0; transform: translateY(18px); transition: opacity .6s ease, transform .6s ease; }
.reveal.in { opacity: 1; transform: none; }
@media (prefers-reduced-motion: reduce) { .reveal { opacity: 1; transform: none; transition: none; } .animate-float, .animate-shine { animation: none; } }
~~~~

### `.env.example`  —  REPLACE

~~~~bash
# Django API base URL (no trailing slash)
VITE_API_URL=http://localhost:8000/api
# Google OAuth Web client ID (same one the Django backend verifies against)
VITE_GOOGLE_CLIENT_ID=
# Media host (Cloudinary / S3 / R2 ...) - optional, used for hero videos
VITE_MEDIA_URL=

# Optional: Microsoft sign-up (Azure Entra ID app, type "Single-page application"). Empty = button shows "not configured".
VITE_MICROSOFT_CLIENT_ID=
~~~~

### `public/blank.html`  —  CREATE

~~~~html
<!doctype html><html><head><meta charset="utf-8"><title>Signing in…</title></head><body></body></html>
~~~~

### `src/data.js`  —  REPLACE

~~~~javascript
import { Globe, Smartphone, Boxes, RefreshCw, CreditCard, BarChart3, Search } from 'lucide-react'

// ⚠️ Edit this file to change the built-in content. Anything saved from Admin > Pages overrides it (see src/lib/content.js).
export const company = {
  name: 'Techive IT Solutions',
  tagline: 'Archiving Innovation. Coding the Future.',
}

// Icons are stored by NAME in the content so they can be saved as JSON from the admin page.
export const ICONS = { Globe, Smartphone, Boxes, RefreshCw, CreditCard, BarChart3, Search }

export const nav = [
  { to: '/', label: 'Home' },
  { to: '/features', label: 'Features' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

// Videos: drop files in /public/videos or host them (Cloudinary/S3/R2) and set VITE_MEDIA_URL.
const M = import.meta.env.VITE_MEDIA_URL || '/videos'

export const audiences = ['Businesses', 'Institutions', 'Ministries', 'Entrepreneurs']

// Placeholder case studies, replace with real projects & images.
export const projects = [
  { cat: 'Web', title: 'Corporate Website Redesign', blurb: 'A faster, mobile-first rebuild with a content workflow the team can manage themselves.', tags: ['React', 'Django', 'SEO'] },
  { cat: 'Systems', title: 'Member Management Platform', blurb: 'Replaced spreadsheets with a role-based system for records, groups and giving.', tags: ['Django', 'PostgreSQL'] },
  { cat: 'Payments', title: 'M-Pesa Billing Automation', blurb: 'Automatic payment confirmation and reconciliation, cutting manual follow-up.', tags: ['M-Pesa', 'API'] },
  { cat: 'Analytics', title: 'Operations Dashboard', blurb: 'One live view of sales, stock and performance for management.', tags: ['Analytics', 'Reports'] },
  { cat: 'Apps', title: 'Field Service Mobile App', blurb: 'Offline-friendly app for staff to log jobs and sync when back online.', tags: ['Mobile', 'API'] },
  { cat: 'Web', title: 'Institution Portal', blurb: 'Public site plus secure portal for applications, notices and downloads.', tags: ['React', 'Auth'] },
]

// Shown on the sign-up page carousel until the real courses load from the API.
export const AUTH_COURSES = [
  { name: 'Certified Prompt Engineering', track: 'Building with AI', blurb: 'Write clear prompts and get reliable results from AI tools.' },
  { name: 'AI for Startups', track: 'Building with AI', blurb: 'Use AI to validate ideas and move faster.' },
  { name: 'AI for Kids', track: 'Building with AI', blurb: 'A safe, hands-on introduction to AI for young learners.' },
  { name: 'AI for Programming', track: 'Building with AI', blurb: 'Web and mobile app development with AI-assisted coding.' },
  { name: 'Cybersecurity', track: 'Cybersecurity', blurb: 'Protect people, systems and data from common threats.' },
]

// ---------------------------------------------------------------------------
// DEFAULT PAGE CONTENT. Every page reads its text from here through useContent(page).
// Admin > Pages saves overrides to the API; arrays are replaced as a whole, objects are merged key by key.
// ---------------------------------------------------------------------------
export const DEFAULTS = {
  home: {
    slides: [
      { video: `${M}/aerial-city.mp4`, title1: 'Your Trusted', title2: 'Tech Partner', sub: 'Technology that moves your business forward.', tags: 'Web • Apps • Systems • Data • SEO' },
      { video: `${M}/developers-coding.mp4`, title1: 'Code That', title2: 'Works For You', sub: 'Custom software built by engineers who care about the details.', tags: 'Web Apps • Business Systems • Modernization' },
      { video: `${M}/payments.mp4`, title1: 'Payments That', title2: 'Just Work', sub: 'M-Pesa, cards and bank integrations, done securely.', tags: 'M-Pesa • Cards • Invoicing • Reconciliation' },
      { video: `${M}/analytics.mp4`, title1: 'Decisions Driven', title2: 'By Data', sub: 'Dashboards and analytics that show what is really happening.', tags: 'Analytics • Reporting • SEO • Growth' },
    ],
    academyPromo: { badge: 'New', text: 'Join our new courses', cta: 'Explore Academy' },
    services: { eyebrow: 'Our Services', title: 'Comprehensive IT Solutions', text: 'We provide innovative and reliable technology solutions to help businesses, organizations and individuals achieve more.' },
    why: { eyebrow: 'Why Techive', title: 'Technology you can rely on', text: 'Creativity, technical expertise and innovation, focused on technology that addresses real needs.' },
    solutionsIntro: { eyebrow: 'Ready-to-deploy', title: 'Solutions built for real needs', text: 'Proven systems we tailor to your organization, so you launch faster than starting from scratch.' },
  },
  features: {
    hero: { eyebrow: 'Features', title: 'Technology that simplifies how you work', text: 'From a modern website to a full business system, we design, build and support the digital tools your organization needs.' },
    services: [
      { icon: 'Globe', title: 'Web Development', blurb: 'Fast, modern, SEO-ready websites and web apps that represent your brand and convert visitors.', points: ['Business & institutional sites', 'E-commerce & portals', 'Performance & accessibility first'] },
      { icon: 'Smartphone', title: 'Application Development', blurb: 'Cross-platform mobile and web applications designed around how your users actually work.', points: ['Android & iOS apps', 'Progressive web apps', 'API design & integration'] },
      { icon: 'Boxes', title: 'Custom Business Systems', blurb: 'ERP-style systems for operations, records, billing, members and staff, built to your process.', points: ['Inventory, HR & finance', 'Member & donor management', 'Role-based access & audit trails'] },
      { icon: 'RefreshCw', title: 'Software Modernization', blurb: 'Move ageing spreadsheets and legacy software onto reliable, maintainable, secure platforms.', points: ['Legacy rewrites & migrations', 'Cloud move & hosting', 'Data cleanup & import'] },
      { icon: 'CreditCard', title: 'Payment Integration', blurb: 'Seamless checkout and automated reconciliation using the payment channels your customers trust.', points: ['M-Pesa STK & C2B', 'Card & bank payments', 'Receipts & reconciliation'] },
      { icon: 'BarChart3', title: 'Data Analytics', blurb: 'Turn operational data into dashboards, reports and insights your team can act on.', points: ['Dashboards & KPIs', 'Automated reports', 'Data pipelines'] },
      { icon: 'Search', title: 'SEO & Digital Presence', blurb: 'Technical SEO, content structure and speed optimisation that help the right people find you.', points: ['Technical SEO audits', 'Page speed & Core Web Vitals', 'Analytics & tracking'] },
    ],
    solutions: [
      { tag: 'Billing', title: 'WiFi Hotspot & Voucher Billing', blurb: 'Captive portal, vouchers and automated M-Pesa payments for ISPs and hotspot operators.', features: ['Voucher & package management', 'Automatic M-Pesa confirmation', 'Usage and revenue reports'] },
      { tag: 'Faith & community', title: 'Church & Member Hub', blurb: 'Members, giving, events, groups and communication in one secure system for ministries.', features: ['Member records & groups', 'Tithe & offering tracking', 'SMS / email announcements'] },
      { tag: 'Education', title: 'School & Learning Portal', blurb: 'Admissions, fees, results and parent communication for schools and training institutions.', features: ['Student & fee management', 'Online results & reports', 'Parent & staff portals'] },
      { tag: 'Operations', title: 'Business Management Suite', blurb: 'Sales, stock, invoicing and staff management tailored to your workflow.', features: ['Invoices & receipts', 'Stock & supplier tracking', 'Multi-branch support'] },
    ],
    process: [
      { n: '01', title: 'Discover', text: 'We listen, map your process and define what success looks like.' },
      { n: '02', title: 'Design', text: 'Clear flows and interfaces you approve before we write code.' },
      { n: '03', title: 'Build', text: 'Iterative delivery with regular demos and tested releases.' },
      { n: '04', title: 'Support', text: 'Launch, training, monitoring and continued improvement.' },
    ],
  },
  about: {
    hero: { eyebrow: 'About Us', title: 'Archiving Innovation. Coding the Future.', text: 'Techive IT Solutions is a technology-driven company committed to transforming ideas into practical, reliable and scalable digital solutions.' },
    pillars: [
      { title: 'Our Mission', text: 'To empower businesses, institutions, ministries and entrepreneurs with technology that simplifies operations, improves efficiency, strengthens digital presence and creates opportunities for growth.' },
      { title: 'Our Vision', text: 'To become a trusted technology partner recognized for innovative digital solutions, reliable service and meaningful impact.' },
      { title: 'Our Commitment', text: 'Building useful technology, delivering value and helping our clients move confidently into the digital future.' },
    ],
    who: { eyebrow: 'Who we are', title: 'Creativity, technical expertise and innovation', p1: 'From modern websites and intelligent business systems to seamless payment experiences and data-driven solutions, we combine creativity and engineering to deliver technology that addresses real needs.', p2: 'We specialize in web development, application development, custom business systems, software modernization, payment integration, data analytics and search engine optimization.' },
    values: [
      { title: 'Reliable', text: 'Systems that keep working on busy days, built with tested, proven tools.' },
      { title: 'Useful', text: 'We build what solves a real problem, not what merely looks impressive.' },
      { title: 'Transparent', text: 'Plain-language updates, honest timelines and fair scope.' },
      { title: 'Lasting', text: 'Clean, documented code your team can own and grow.' },
    ],
  },
  contact: {
    hero: { eyebrow: 'Contact', title: "Let's talk about your project", text: 'Reach the Techive team by email, phone or WhatsApp, or request a detailed quote.' },
    email: 'hello@techive.co.ke',
    phone: '+254 700 000 000',
    address: 'Upper Hill, Nairobi, Kenya',
    hours: 'Monday to Friday, replies within one business day.',
  },
  academy: {
    hero: { eyebrow: 'Techive Academy', title: 'Learn in-demand tech skills', text: 'Pick a course, register in a minute, and our team guides you from first class to certificate.' },
    features: ['Hands-on Projects', 'Expert Mentorship', 'Certificates of Completion', 'Career Support'],
    till_number: '',
    payment_instructions: '',
    general_rules: '',
  },
}
~~~~

### `src/lib/content.js`  —  CREATE

~~~~javascript
import { useEffect, useState } from 'react'
import { api } from './api'
import { DEFAULTS } from '../data'

const cache = {}

// objects merge key by key, arrays and primitives from `saved` replace the default
export function mergeContent(defaults, saved) {
  if (saved === undefined || saved === null) return defaults
  if (Array.isArray(saved) || typeof saved !== 'object') return saved
  if (!defaults || typeof defaults !== 'object' || Array.isArray(defaults)) return saved
  const out = { ...defaults }
  for (const k of Object.keys(saved)) out[k] = mergeContent(defaults[k], saved[k])
  return out
}

export const clearContentCache = () => { for (const k of Object.keys(cache)) delete cache[k] }

// Shows the built-in defaults immediately, then swaps in the admin's saved edits.
export function useContent(page) {
  const [c, setC] = useState(() => mergeContent(DEFAULTS[page], cache[page]))
  useEffect(() => {
    if (cache[page]) return
    let live = true
    api(`/content/${page}/`).then((r) => { cache[page] = r; if (live) setC(mergeContent(DEFAULTS[page], r)) }).catch(() => {})
    return () => { live = false }
  }, [page])
  return c
}
~~~~

### `src/lib/api.js`  —  REPLACE

~~~~javascript
// Tiny fetch wrapper for the Django API.
// Tokens live in localStorage ("Remember me" ticked) or sessionStorage (not ticked → cleared when the browser closes).
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
const K = 'techive_tokens'

const stores = () => [localStorage, sessionStorage]
export const tokens = {
  get: () => {
    for (const s of stores()) { try { const v = JSON.parse(s.getItem(K)); if (v) return v } catch { /* ignore */ } }
    return null
  },
  set: (t, remember = true) => {
    stores().forEach((s) => { try { s.removeItem(K) } catch { /* ignore */ } })
    try { (remember ? localStorage : sessionStorage).setItem(K, JSON.stringify(t)) } catch { /* ignore */ }
  },
  clear: () => stores().forEach((s) => { try { s.removeItem(K) } catch { /* ignore */ } }),
}

async function raw(path, opts = {}, access) {
  const res = await fetch(BASE + path, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...(access && { Authorization: `Bearer ${access}` }) },
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw Object.assign(new Error(data.detail || data.error || 'Something went wrong'), { status: res.status, data })
  return data
}

export async function api(path, opts) {
  const t = tokens.get()
  try {
    return await raw(path, opts, t?.access)
  } catch (e) {
    // one silent refresh attempt on an expired access token
    if (e.status === 401 && t?.refresh) {
      try {
        const remember = !!localStorage.getItem(K)
        const r = await raw('/auth/token/refresh/', { method: 'POST', body: { refresh: t.refresh } })
        tokens.set({ ...t, access: r.access, ...(r.refresh && { refresh: r.refresh }) }, remember)
        return await raw(path, opts, r.access)
      } catch { tokens.clear() }
    }
    throw e
  }
}
~~~~

### `src/lib/auth.jsx`  —  REPLACE

~~~~jsx
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { api, tokens } from './api'

const Ctx = createContext(null)
export const useAuth = () => useContext(Ctx)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!tokens.get()) return setReady(true)
    api('/auth/me/').then(setUser).catch(() => {}).finally(() => setReady(true))
  }, [])

  // data = { access, refresh, user } returned by the verify / google endpoints. remember=false keeps the session only until the browser closes.
  const login = useCallback((data, remember = true) => { tokens.set({ access: data.access, refresh: data.refresh }, remember); setUser(data.user) }, [])
  const logout = useCallback(() => { tokens.clear(); setUser(null) }, [])
  const updateUser = useCallback((patch) => setUser((u) => (u ? { ...u, ...patch } : u)), [])

  return <Ctx.Provider value={{ user, ready, login, logout, updateUser }}>{children}</Ctx.Provider>
}
~~~~

### `src/lib/microsoft.js`  —  CREATE

~~~~javascript
// Microsoft sign-in (MSAL popup). Loaded lazily so it adds nothing to the first page load.
const CLIENT_ID = import.meta.env.VITE_MICROSOFT_CLIENT_ID
export const MS_ENABLED = !!CLIENT_ID

let app
export async function microsoftIdToken() {
  const { PublicClientApplication } = await import('@azure/msal-browser')
  if (!app) {
    app = new PublicClientApplication({
      auth: { clientId: CLIENT_ID, authority: 'https://login.microsoftonline.com/common', redirectUri: `${window.location.origin}/blank.html` },
      cache: { cacheLocation: 'sessionStorage' },
    })
    await app.initialize()
  }
  const r = await app.loginPopup({ scopes: ['openid', 'profile', 'email'], prompt: 'select_account' })
  return r.idToken
}
~~~~

### `src/components/ui.jsx`  —  REPLACE

~~~~jsx
import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

// Fade-in on scroll (no animation library)
export function Reveal({ children, className = '', delay = 0 }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el || !('IntersectionObserver' in window)) return el?.classList.add('in')
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add('in'); io.disconnect() } }, { threshold: 0.12 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return <div ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>
}

// Per-page <title> + description (SPA-friendly; pre-render later for max SEO)
export function useSEO(title, description) {
  useEffect(() => {
    document.title = title ? `${title} | Techive IT Solutions` : 'Techive IT Solutions — Archiving Innovation. Coding the Future.'
    if (description) document.querySelector('meta[name="description"]')?.setAttribute('content', description)
    window.scrollTo(0, 0)
  }, [title, description])
}

export function SectionHead({ eyebrow, title, text, center = true, dark = false }) {
  return (
    <Reveal className={`mb-12 max-w-2xl ${center ? 'mx-auto text-center' : ''}`}>
      {eyebrow && <span className={`eyebrow ${dark ? '!text-zinc-400' : ''}`}>{eyebrow}</span>}
      <h2 className={`mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl ${dark ? 'text-white' : ''}`}>{title}</h2>
      {text && <p className={`mt-4 leading-relaxed ${dark ? 'text-zinc-400' : 'text-zinc-600'}`}>{text}</p>}
    </Reveal>
  )
}

// Dark banner at the top of inner pages (header overlays it)
export function PageHero({ eyebrow, title, text, children }) {
  return (
    <section className="relative overflow-hidden bg-ink pb-20 pt-40 text-white md:pt-48">
      <div className="pointer-events-none absolute inset-0 opacity-[.07]" style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '48px 48px' }} />
      <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand-violet/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 left-1/4 h-80 w-80 rounded-full bg-brand-cyan/15 blur-3xl" />
      <div className="container-x relative">
        <div className="max-w-3xl animate-fade-up">
          {eyebrow && <span className="eyebrow !text-zinc-400">{eyebrow}</span>}
          <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl">{title}</h1>
          {text && <p className="mt-5 max-w-2xl text-lg leading-relaxed text-zinc-300">{text}</p>}
          {children}
        </div>
      </div>
    </section>
  )
}

export function CTA({ title = 'Ready to build something useful?', text = 'Tell us about your idea. We will reply within one business day.' }) {
  return (
    <section className="bg-zinc-100 py-20">
      <div className="container-x">
        <Reveal className="relative overflow-hidden rounded-3xl bg-ink px-8 py-14 text-center text-white sm:px-16">
          <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-brand-cyan/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-brand-violet/25 blur-3xl" />
          <h2 className="relative text-3xl font-extrabold sm:text-4xl">{title}</h2>
          <p className="relative mx-auto mt-4 max-w-xl text-zinc-300">{text}</p>
          <Link to="/quote" className="btn-grad relative mt-8">Get a Quote <ArrowRight size={18} /></Link>
        </Reveal>
      </div>
    </section>
  )
}

// Round profile picture; falls back to the first letter of the name/email.
export function Avatar({ user, size = 36, className = '' }) {
  const letter = (user?.first_name || user?.email || '?')[0].toUpperCase()
  return user?.avatar_url ? (
    <img src={user.avatar_url} alt="" referrerPolicy="no-referrer" width={size} height={size} style={{ width: size, height: size }} className={`rounded-full object-cover ${className}`} />
  ) : (
    <span style={{ width: size, height: size }} className={`flex items-center justify-center rounded-full bg-brand-grad font-bold text-white ${className}`}>{letter}</span>
  )
}
~~~~

### `src/components/Layout.jsx`  —  REPLACE

~~~~jsx
import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight, Menu, X, Mail, Phone, MapPin, LogOut, CircleUser, GraduationCap, LayoutDashboard } from 'lucide-react'
import { nav, company } from '../data'
import { useAuth } from '../lib/auth'
import { useContent } from '../lib/content'
import { Avatar } from './ui'

const displayName = (u) => u.first_name || u.email.split('@')[0]

// Far-right profile button: "Login" when signed out, avatar + dropdown when signed in.
function ProfileMenu() {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const nav2 = useNavigate()
  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  if (!user)
    return (
      <Link to="/auth" className="flex items-center gap-2 rounded-full bg-white/10 py-1.5 pl-2 pr-4 font-display text-sm font-semibold text-white ring-1 ring-white/25 backdrop-blur transition hover:bg-white/20">
        <CircleUser size={26} strokeWidth={1.6} />Login
      </Link>
    )
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Account menu" className="flex items-center gap-2 rounded-full bg-white/10 py-1 pl-1 pr-4 font-display text-sm font-semibold text-white ring-1 ring-white/25 backdrop-blur transition hover:bg-white/20">
        <Avatar user={user} size={32} />{displayName(user)}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-56 animate-pop overflow-hidden rounded-2xl border border-zinc-200 bg-white text-ink shadow-2xl">
          <p className="truncate border-b border-zinc-100 px-4 py-3 text-xs text-zinc-500">{user.email}</p>
          <Link to="/academy" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-zinc-50"><GraduationCap size={16} />My Academy</Link>
          {user.is_staff && <Link to="/admin" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-zinc-50"><LayoutDashboard size={16} />Admin dashboard</Link>}
          <button onClick={() => { setOpen(false); logout(); nav2('/') }} className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm hover:bg-zinc-50"><LogOut size={16} />Sign out</button>
        </div>
      )}
    </div>
  )
}

// NOT sticky: absolute, sits on top of the hero / page banner and scrolls away.
function Header() {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()
  const { pathname } = useLocation()
  useEffect(() => setOpen(false), [pathname])
  useEffect(() => { document.body.style.overflow = open ? 'hidden' : '' ; return () => { document.body.style.overflow = '' } }, [open])

  const link = ({ isActive }) =>
    `relative py-2 text-[13px] font-semibold uppercase tracking-[.14em] transition ${isActive ? 'text-white' : 'text-white/75 hover:text-white'}`

  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <div className="container-x flex items-center justify-between py-4 lg:py-7">
        <Link to="/" aria-label="Techive IT Solutions home" className="shrink-0">
          <img src="/logo-light.png" alt="Techive IT Solutions" width="900" height="300" className="h-11 w-auto drop-shadow-lg sm:h-16 lg:h-24" />
        </Link>

        <nav className="hidden items-center gap-9 lg:flex" aria-label="Main">
          {nav.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.to === '/'} className={link}>
              {({ isActive }) => (<>{n.label}{isActive && <span className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded bg-brand-grad" />}</>)}
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:block"><ProfileMenu /></div>

        <button className="rounded-full bg-white/15 p-2.5 text-white backdrop-blur sm:p-3 lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu"><Menu size={22} /></button>
      </div>

      {/* Mobile: slide-in drawer from the right, profile at the top */}
      <div className={`fixed inset-0 z-50 lg:hidden ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
        <div onClick={() => setOpen(false)} className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`} />
        <aside className={`absolute right-0 top-0 flex h-full w-[82%] max-w-sm flex-col bg-ink p-6 text-white shadow-2xl transition-transform duration-300 ${open ? 'translate-x-0' : 'invisible translate-x-full'}`}>
          <button className="ml-auto rounded-full bg-white/10 p-2.5" onClick={() => setOpen(false)} aria-label="Close menu"><X size={20} /></button>
          <div className="mt-2 flex items-center gap-3 rounded-2xl bg-white/[.06] p-4">
            {user ? (
              <>
                <Avatar user={user} size={48} />
                <div className="min-w-0"><p className="truncate font-display font-bold">{displayName(user)}</p><p className="truncate text-xs text-zinc-400">{user.email}</p></div>
              </>
            ) : (
              <Link to="/auth" className="flex items-center gap-3 font-display font-bold"><CircleUser size={40} strokeWidth={1.4} />Login / Sign up</Link>
            )}
          </div>
          <nav className="mt-6 flex flex-1 flex-col overflow-y-auto" aria-label="Mobile">
            {nav.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.to === '/'} className={({ isActive }) => `border-b border-white/10 py-4 font-display text-lg font-bold uppercase tracking-wider ${isActive ? 'text-brand-cyan' : ''}`}>{n.label}</NavLink>
            ))}
            <Link to="/academy" className="flex items-center gap-2 border-b border-white/10 py-4 text-zinc-300"><GraduationCap size={18} />Academy</Link>
            {user?.is_staff && <Link to="/admin" className="py-4 text-brand-cyan">Admin dashboard</Link>}
            {user && <button onClick={logout} className="flex items-center gap-2 py-4 text-left text-zinc-400"><LogOut size={18} />Sign out</button>}
          </nav>
          <Link to="/quote" className="btn-grad w-full">Get a Quote <ArrowRight size={18} /></Link>
        </aside>
      </div>
    </header>
  )
}

function Footer() {
  const features = useContent('features')
  const contact = useContent('contact')
  return (
    <footer className="bg-ink text-zinc-400">
      <div className="container-x grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <img src="/logo-light.png" alt="Techive IT Solutions" loading="lazy" className="h-20 w-auto" />
          <p className="mt-5 text-sm leading-relaxed">{company.tagline} Practical, reliable and scalable digital solutions for businesses, institutions, ministries and entrepreneurs.</p>
        </div>
        <div>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-white">Services</h3>
          <ul className="space-y-2 text-sm">{features.services.slice(0, 6).map((s) => <li key={s.title}><Link to="/features" className="hover:text-white">{s.title}</Link></li>)}</ul>
        </div>
        <div>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-white">Company</h3>
          <ul className="space-y-2 text-sm">
            {[['/about', 'About Us'], ['/features', 'Features'], ['/academy', 'Academy'], ['/quote', 'Get a Quote'], ['/contact', 'Contact']].map(([to, l]) => <li key={to}><Link to={to} className="hover:text-white">{l}</Link></li>)}
          </ul>
        </div>
        <div>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-white">Get in touch</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-3"><MapPin size={16} className="mt-0.5 shrink-0" />{contact.address}</li>
            <li className="flex gap-3"><Phone size={16} className="mt-0.5 shrink-0" /><a href={`tel:${contact.phone.replace(/\s/g, '')}`} className="hover:text-white">{contact.phone}</a></li>
            <li className="flex gap-3"><Mail size={16} className="mt-0.5 shrink-0" /><a href={`mailto:${contact.email}`} className="hover:text-white">{contact.email}</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-6 text-center text-xs">© {new Date().getFullYear()} {company.name}. All rights reserved.</div>
    </footer>
  )
}

export default function Layout() {
  return (
    <>
      <Header />
      <main><Outlet /></main>
      <Footer />
    </>
  )
}
~~~~

### `src/components/HeroCarousel.jsx`  —  REPLACE

~~~~jsx
import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronLeft, ChevronRight, GraduationCap } from 'lucide-react'
import { useContent } from '../lib/content'

const INTERVAL = 8000 // ms per slide

export default function HeroCarousel() {
  const { slides, academyPromo } = useContent('home')
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  const [failed, setFailed] = useState({})
  const n = slides.length
  const go = useCallback((k) => setI((k + n) % n), [n])

  // auto-advance; restarts whenever the slide changes (manual or automatic)
  useEffect(() => {
    if (paused || n < 2) return
    const t = setTimeout(() => go(i + 1), INTERVAL)
    return () => clearTimeout(t)
  }, [i, paused, go, n])

  const s = slides[i % n]

  return (
    <section
      className="relative isolate h-[100svh] min-h-[640px] max-h-[900px] overflow-hidden bg-ink text-white"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel" aria-label="Featured"
    >
      {/* Only the active slide's video is mounted → fast load, low bandwidth */}
      <div key={i} className="absolute inset-0 -z-10">
        {failed[i] ? (
          <div className="h-full w-full bg-gradient-to-br from-zinc-800 via-ink to-zinc-900" />
        ) : (
          <video
            key={s.video} src={s.video} autoPlay muted loop playsInline preload={i === 0 ? 'auto' : 'metadata'}
            onError={() => setFailed((f) => ({ ...f, [i]: true }))}
            className="h-full w-full object-cover animate-fade-in"
          />
        )}
      </div>

      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink/85 via-ink/45 to-transparent" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/70 via-transparent to-ink/40" />

      <div className="container-x flex h-full items-center">
        <div key={`t${i}`} className="max-w-2xl pt-20 animate-fade-up">
          <div className="mb-6 h-1 w-24 rounded bg-brand-grad" />
          <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">{s.title1}<br />{s.title2}</h1>
          <p className="mt-5 text-base text-white/90 sm:mt-6 sm:text-xl">{s.sub}</p>
          <p className="mt-3 text-sm font-medium text-white/80 sm:mt-4 sm:text-xl">{s.tags}</p>
          <div className="mt-8 flex flex-wrap items-center gap-4 sm:mt-9">
            <Link to="/quote" className="btn-grad !px-7 !py-4">Get a Quote <ArrowRight size={18} /></Link>
          </div>
          {/* Academy promo (left) */}
          <Link to="/academy" className="mt-5 inline-flex max-w-full items-center gap-3 rounded-2xl border border-white/25 bg-white/10 py-2.5 pl-3 pr-4 backdrop-blur-md transition hover:bg-white/20 sm:mt-7">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-grad"><GraduationCap size={22} /></span>
            <span className="min-w-0 text-left">
              <span className="block text-[11px] font-bold uppercase tracking-[.2em] text-brand-cyan">{academyPromo.badge} · Academy</span>
              <span className="block truncate font-display text-sm font-semibold sm:text-base">{academyPromo.text}</span>
            </span>
            <ArrowRight size={18} className="shrink-0" />
          </Link>
        </div>
      </div>

      <button onClick={() => go(i - 1)} aria-label="Previous slide" className="absolute left-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-black/40 p-3 backdrop-blur transition hover:bg-black/70 sm:block"><ChevronLeft size={24} /></button>
      <button onClick={() => go(i + 1)} aria-label="Next slide" className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-black/40 p-3 backdrop-blur transition hover:bg-black/70 sm:block"><ChevronRight size={24} /></button>

      <div className="absolute inset-x-0 bottom-6 flex justify-center gap-3 sm:bottom-8">
        {slides.map((_, k) => (
          <button key={k} onClick={() => go(k)} aria-label={`Go to slide ${k + 1}`} aria-current={k === i}
            className={`h-3 rounded-full transition-all ${k === i ? 'w-8 bg-brand-cyan' : 'w-3 bg-white/50 hover:bg-white'}`} />
        ))}
      </div>
    </section>
  )
}
~~~~

### `src/components/CookieBanner.jsx`  —  CREATE

~~~~jsx
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { api } from '../lib/api'

const KEY = 'techive_cookies'
const VID = 'techive_vid'
const read = () => { try { return localStorage.getItem(KEY) } catch { return null } }
const uuid = () => (crypto.randomUUID ? crypto.randomUUID() : '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c) => (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)))

// Cookie notice. Only after "Accept" do we store a random visitor id and report page views to /track/ (no IP address is stored).
export default function CookieBanner() {
  const [choice, setChoice] = useState(read)
  const { pathname } = useLocation()

  useEffect(() => {
    if (choice !== 'yes') return
    try {
      let vid = localStorage.getItem(VID)
      if (!vid) { vid = uuid(); localStorage.setItem(VID, vid) }
      api('/track/', { method: 'POST', body: { vid, path: pathname } }).catch(() => {})
    } catch { /* storage blocked */ }
  }, [choice, pathname])

  const pick = (v) => { try { localStorage.setItem(KEY, v) } catch { /* ignore */ } setChoice(v) }
  if (choice) return null
  return (
    <div role="dialog" aria-label="Cookie notice" className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-xl rounded-2xl border border-white/15 bg-ink/95 p-4 text-sm text-zinc-300 shadow-2xl backdrop-blur sm:bottom-5">
      <p>We use a small cookie to count visits and understand which pages help people. No advertising, no selling data. You can decline and the site works the same.</p>
      <div className="mt-3 flex gap-2">
        <button onClick={() => pick('yes')} className="btn-grad !px-5 !py-2">Accept</button>
        <button onClick={() => pick('no')} className="btn border border-white/30 !px-5 !py-2 text-white hover:bg-white/10">Decline</button>
      </div>
    </div>
  )
}
~~~~

### `src/components/RequireAuth.jsx`  —  CREATE

~~~~jsx
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/auth'

// Wrap a page: signed-out visitors are sent to the login page and come back here afterwards.
export default function RequireAuth({ children, from }) {
  const { user, ready } = useAuth()
  const { pathname } = useLocation()
  if (!ready) return <div className="min-h-screen bg-ink" />
  if (!user) return <Navigate to={`/auth?next=${encodeURIComponent(pathname)}${from ? `&from=${from}` : ''}`} replace />
  return children
}
~~~~

### `src/pages/Home.jsx`  —  REPLACE

~~~~jsx
import { Link } from 'react-router-dom'
import { ArrowRight, Check } from 'lucide-react'
import HeroCarousel from '../components/HeroCarousel'
import { Reveal, SectionHead, CTA, useSEO } from '../components/ui'
import { audiences, ICONS } from '../data'
import { useContent } from '../lib/content'

export default function Home() {
  useSEO('', 'Techive IT Solutions: websites, apps, custom business systems, payment integration, analytics and SEO for businesses, institutions, ministries and entrepreneurs.')
  const home = useContent('home')
  const { services, solutions, process } = useContent('features')
  const { values } = useContent('about')
  return (
    <>
      <HeroCarousel />

      {/* Services: 2 across on phones, compact cards */}
      <section className="bg-zinc-50 py-16 sm:py-24">
        <div className="container-x">
          <SectionHead eyebrow={home.services.eyebrow} title={home.services.title} text={home.services.text} />
          <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
            {services.map(({ icon, title, blurb }, n) => {
              const Icon = ICONS[icon] || ICONS.Globe
              return (
                <Reveal key={title} delay={(n % 3) * 80}>
                  <Link to="/features" className="card group block h-full !p-4 sm:!p-6">
                    <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-ink text-white transition group-hover:bg-brand-grad sm:mb-5 sm:h-12 sm:w-12"><Icon size={20} /></span>
                    <h3 className="text-sm font-bold leading-snug sm:text-lg">{title}</h3>
                    <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-zinc-600 sm:mt-2 sm:line-clamp-none sm:text-sm">{blurb}</p>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold sm:mt-5 sm:text-sm">Learn more <ArrowRight size={14} className="transition group-hover:translate-x-1" /></span>
                  </Link>
                </Reveal>
              )
            })}
            <Reveal delay={160}>
              <Link to="/quote" className="flex h-full min-h-[150px] flex-col justify-between rounded-2xl bg-ink p-4 text-white transition hover:-translate-y-1 sm:min-h-[220px] sm:p-6">
                <h3 className="text-sm font-bold sm:text-xl">Have something specific in mind?</h3>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-brand-cyan">Get a quote <ArrowRight size={16} /></span>
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="border-y border-zinc-200 bg-white py-10">
        <div className="container-x flex flex-wrap items-center justify-center gap-x-12 gap-y-4 text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-zinc-500">Built for</span>
          {audiences.map((a) => <span key={a} className="font-display text-xl font-extrabold text-zinc-800">{a}</span>)}
        </div>
      </section>

      <section className="bg-zinc-100 py-16 sm:py-24">
        <div className="container-x">
          <SectionHead eyebrow={home.solutionsIntro.eyebrow} title={home.solutionsIntro.title} text={home.solutionsIntro.text} />
          <div className="grid gap-6 md:grid-cols-2">
            {solutions.slice(0, 2).map((s) => (
              <Reveal key={s.title}>
                <div className="card h-full">
                  <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">{s.tag}</span>
                  <h3 className="mt-2 text-2xl font-bold">{s.title}</h3>
                  <p className="mt-3 text-zinc-600">{s.blurb}</p>
                  <ul className="mt-5 space-y-2 text-sm">{s.features.map((f) => <li key={f} className="flex gap-2"><Check size={18} className="text-brand-blue" />{f}</li>)}</ul>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="mt-10 text-center"><Link to="/features" className="btn-dark">View all features <ArrowRight size={18} /></Link></div>
        </div>
      </section>

      <section className="bg-ink py-16 text-white sm:py-24">
        <div className="container-x">
          <SectionHead dark eyebrow={home.why.eyebrow} title={home.why.title} text={home.why.text} />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v, n) => (
              <Reveal key={v.title} delay={n * 80}>
                <div className="h-full rounded-2xl border border-white/10 bg-white/[.04] p-6">
                  <h3 className="text-lg font-bold">{v.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">{v.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="mt-16 grid gap-8 border-t border-white/10 pt-12 sm:grid-cols-2 lg:grid-cols-4">
            {process.map((p) => (
              <Reveal key={p.n}>
                <span className="bg-brand-grad bg-clip-text text-4xl font-extrabold text-transparent">{p.n}</span>
                <h3 className="mt-2 text-lg font-bold">{p.title}</h3>
                <p className="mt-1 text-sm text-zinc-400">{p.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CTA />
    </>
  )
}
~~~~

### `src/pages/Features.jsx`  —  CREATE

~~~~jsx
import { Check, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHero, Reveal, SectionHead, CTA, useSEO } from '../components/ui'
import { ICONS } from '../data'
import { useContent } from '../lib/content'

export default function Features() {
  useSEO('Features', 'Web development, apps, custom business systems, payment integration, analytics, SEO and ready-to-deploy platforms from Techive.')
  const { hero, services, solutions, process } = useContent('features')
  return (
    <>
      <PageHero eyebrow={hero.eyebrow} title={hero.title} text={hero.text} />

      <section className="bg-zinc-50 py-16 sm:py-24">
        <div className="container-x space-y-6">
          {services.map(({ icon, title, blurb, points }, n) => {
            const Icon = ICONS[icon] || ICONS.Globe
            return (
              <Reveal key={title}>
                <div className={`grid items-center gap-8 rounded-3xl border border-zinc-200 p-6 md:grid-cols-5 md:p-10 ${n % 2 ? 'bg-zinc-100' : 'bg-white'}`}>
                  <div className="md:col-span-3">
                    <span className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-ink text-white"><Icon size={26} /></span>
                    <h2 className="text-2xl font-extrabold">{title}</h2>
                    <p className="mt-3 max-w-xl leading-relaxed text-zinc-600">{blurb}</p>
                  </div>
                  <ul className="space-y-3 md:col-span-2">
                    {points.map((p) => <li key={p} className="flex gap-3 font-medium"><Check size={20} className="mt-0.5 shrink-0 text-brand-blue" />{p}</li>)}
                  </ul>
                </div>
              </Reveal>
            )
          })}
        </div>
      </section>

      <section className="bg-zinc-100 py-16 sm:py-24">
        <div className="container-x">
          <SectionHead eyebrow="Ready-to-deploy" title="Solutions built for real needs" text="Proven systems we tailor to your organization." />
          <div className="grid gap-6 md:grid-cols-2">
            {solutions.map((s, n) => (
              <Reveal key={s.title} delay={(n % 2) * 100}>
                <article className="card flex h-full flex-col">
                  <span className="w-fit rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold uppercase tracking-widest text-zinc-600">{s.tag}</span>
                  <h3 className="mt-4 text-2xl font-extrabold">{s.title}</h3>
                  <p className="mt-3 text-zinc-600">{s.blurb}</p>
                  <ul className="my-6 space-y-2 text-sm">{s.features.map((f) => <li key={f} className="flex gap-2"><Check size={18} className="text-brand-blue" />{f}</li>)}</ul>
                  <Link to="/quote" className="mt-auto inline-flex items-center gap-2 font-semibold">Request a quote <ArrowRight size={16} /></Link>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ink py-16 text-white sm:py-24">
        <div className="container-x">
          <SectionHead dark eyebrow="How we work" title="A simple, transparent process" />
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {process.map((p) => (
              <Reveal key={p.n}><span className="bg-brand-grad bg-clip-text text-5xl font-extrabold text-transparent">{p.n}</span>
                <h3 className="mt-2 text-xl font-bold">{p.title}</h3><p className="mt-2 text-zinc-400">{p.text}</p></Reveal>
            ))}
          </div>
        </div>
      </section>
      <CTA />
    </>
  )
}
~~~~

### `src/pages/About.jsx`  —  REPLACE

~~~~jsx
import { PageHero, SectionHead, Reveal, CTA, useSEO } from '../components/ui'
import { audiences } from '../data'
import { useContent } from '../lib/content'

export default function About() {
  useSEO('About Us', 'Techive IT Solutions is a technology-driven company turning ideas into practical, reliable and scalable digital solutions.')
  const { hero, pillars, who, values } = useContent('about')
  return (
    <>
      <PageHero eyebrow={hero.eyebrow} title={hero.title} text={hero.text} />
      <section className="bg-zinc-50 py-16 sm:py-24">
        <div className="container-x grid gap-6 md:grid-cols-3">
          {pillars.map((p, n) => (
            <Reveal key={p.title} delay={n * 100}>
              <div className="card h-full"><div className="mb-4 h-1 w-12 rounded bg-brand-grad" /><h2 className="text-xl font-extrabold">{p.title}</h2><p className="mt-3 leading-relaxed text-zinc-600">{p.text}</p></div>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="bg-zinc-100 py-16 sm:py-24">
        <div className="container-x grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <span className="eyebrow">{who.eyebrow}</span>
            <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">{who.title}</h2>
            <p className="mt-5 leading-relaxed text-zinc-600">{who.p1}</p>
            <p className="mt-4 leading-relaxed text-zinc-600">{who.p2}</p>
          </Reveal>
          <Reveal className="grid grid-cols-2 gap-4">
            {audiences.map((a) => <div key={a} className="rounded-2xl bg-ink p-6 font-display text-lg font-bold text-white">{a}</div>)}
          </Reveal>
        </div>
      </section>
      <section className="bg-ink py-16 text-white sm:py-24">
        <div className="container-x">
          <SectionHead dark eyebrow="Our values" title="How we work" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v, n) => (
              <Reveal key={v.title} delay={n * 80}><div className="h-full rounded-2xl border border-white/10 bg-white/[.04] p-6"><h3 className="text-lg font-bold">{v.title}</h3><p className="mt-2 text-sm text-zinc-400">{v.text}</p></div></Reveal>
            ))}
          </div>
        </div>
      </section>
      <CTA title="Partner with Techive" text="Let's talk about what technology can do for you." />
    </>
  )
}
~~~~

### `src/pages/Contact.jsx`  —  REPLACE

~~~~jsx
import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin, Clock, ArrowRight } from 'lucide-react'
import { PageHero, Reveal, useSEO } from '../components/ui'
import { useContent } from '../lib/content'

export default function Contact() {
  useSEO('Contact', 'Contact Techive IT Solutions by email, phone or WhatsApp.')
  const c = useContent('contact')
  const items = [
    [Mail, 'Email', c.email, `mailto:${c.email}`],
    [Phone, 'Phone / WhatsApp', c.phone, `tel:${c.phone.replace(/\s/g, '')}`],
    [MapPin, 'Office', c.address],
    [Clock, 'Hours', c.hours],
  ]
  return (
    <>
      <PageHero eyebrow={c.hero.eyebrow} title={c.hero.title} text={c.hero.text} />
      <section className="bg-zinc-50 py-16 sm:py-20">
        <div className="container-x grid gap-6 md:grid-cols-2">
          {items.map(([I, t, v, h], n) => (
            <Reveal key={t} delay={n * 80}>
              <div className="flex h-full gap-4 rounded-2xl border border-zinc-200 bg-white p-6">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-ink text-white"><I size={22} /></span>
                <div className="min-w-0"><p className="text-xs font-bold uppercase tracking-widest text-zinc-500">{t}</p>
                  {h ? <a href={h} className="break-words font-semibold hover:underline">{v}</a> : <p className="font-semibold">{v}</p>}</div>
              </div>
            </Reveal>
          ))}
          <Reveal className="md:col-span-2">
            <div className="flex flex-col items-start justify-between gap-5 rounded-3xl bg-ink p-8 text-white sm:flex-row sm:items-center">
              <div><h2 className="text-2xl font-extrabold">Have a project in mind?</h2><p className="mt-1 text-zinc-400">Sign in once and send us the details. We reply within one business day.</p></div>
              <Link to="/quote" className="btn-grad shrink-0">Get a Quote <ArrowRight size={18} /></Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
~~~~

### `src/pages/Quote.jsx`  —  CREATE

~~~~jsx
import { useState } from 'react'
import { Check } from 'lucide-react'
import { PageHero, useSEO } from '../components/ui'
import { useContent } from '../lib/content'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'

const budgets = ['Under KSh 50,000', 'KSh 50,000 – 150,000', 'KSh 150,000 – 500,000', 'Above KSh 500,000', 'Not sure yet']

// Route is wrapped in <RequireAuth> (see App.jsx), so `user` always exists here.
export default function Quote() {
  useSEO('Get a Quote', 'Request a quote from the Techive team for your website, app or business system.')
  const { user } = useAuth()
  const { services } = useContent('features')
  const [f, setF] = useState({ name: '', phone: user?.phone || '', service: '', budget: '', message: '' })
  const [state, setState] = useState('idle') // idle | sending | done | error
  const [err, setErr] = useState('')
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  async function submit(e) {
    e.preventDefault()
    setState('sending'); setErr('')
    try { await api('/quotes/', { method: 'POST', body: f }); setState('done') }
    catch (x) { setErr(x.message); setState('error') }
  }

  return (
    <>
      <PageHero eyebrow="Get a Quote" title="Tell us about your project" text="A senior member of the team will reply within one business day." />
      <section className="bg-zinc-50 py-16 sm:py-20">
        <div className="container-x">
          <div className="mx-auto max-w-3xl rounded-3xl border border-zinc-200 bg-white p-6 sm:p-10">
            {state === 'done' ? (
              <div className="py-16 text-center">
                <span className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-ink text-white"><Check size={32} /></span>
                <h2 className="text-2xl font-extrabold">Thank you, we got your request</h2>
                <p className="mt-2 text-zinc-600">We'll get back to you at {user.email} shortly.</p>
              </div>
            ) : (
              <form onSubmit={submit} className="grid gap-5 sm:grid-cols-2">
                <h2 className="text-2xl font-extrabold sm:col-span-2">Request a quote <span className="block text-sm font-normal text-zinc-500">Signed in as {user.email}</span></h2>
                <label className="text-sm font-medium">Name<input className="input mt-1" value={f.name} onChange={set('name')} autoComplete="name" placeholder={user.first_name || 'Your name'} /></label>
                <label className="text-sm font-medium">Phone / WhatsApp<input className="input mt-1" value={f.phone} onChange={set('phone')} autoComplete="tel" /></label>
                <label className="text-sm font-medium">Service
                  <select className="input mt-1" value={f.service} onChange={set('service')}>
                    <option value="">Select a service</option>
                    {services.map((s) => <option key={s.title}>{s.title}</option>)}<option>Other</option>
                  </select></label>
                <label className="text-sm font-medium">Budget
                  <select className="input mt-1" value={f.budget} onChange={set('budget')}><option value="">Select a range</option>{budgets.map((b) => <option key={b}>{b}</option>)}</select></label>
                <label className="text-sm font-medium sm:col-span-2">Project details<textarea required rows={5} className="input mt-1" value={f.message} onChange={set('message')} placeholder="What do you want to build or fix?" /></label>
                {state === 'error' && <p className="text-sm text-red-600 sm:col-span-2" role="alert">{err}</p>}
                <button disabled={state === 'sending'} className="btn-dark sm:col-span-2">{state === 'sending' ? 'Sending…' : 'Send request'}</button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
~~~~

## Verify
- Check `package.json` lists `@fontsource-variable/plus-jakarta-sans`, `@fontsource-variable/sora`, `@azure/msal-browser` and no longer `@fontsource-variable/inter`.
- `npm run dev` starts with no errors. Do NOT run `npm run build` yet.
- No file in `src/` may still import `@fontsource-variable/inter`: `grep -rn "fontsource-variable/inter" src` must print nothing.

**What changed:** new fonts (Plus Jakarta Sans body, Sora headings and the Login label); navbar is HOME / FEATURES / ABOUT / CONTACT plus a far-right "Login" profile pill (becomes avatar + dropdown after login); mobile hamburger opens a right-side slide-in drawer with the profile at the top and a smaller logo; carousel has a "Get a Quote" button and a glass "Join our new courses" Academy promo; services cards are 2 across and compact on phones; every page's text now comes from `useContent(page)` so the admin can edit it; cookie banner.
