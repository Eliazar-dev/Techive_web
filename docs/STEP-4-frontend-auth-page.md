# Step 4 — Frontend: glass login / sign-up page

**Repo: `techive-web`.** Do Step 3 first. Paste this whole file into Devin.


## Rules for Devin (read before you start)
1. Work in the repo named in the step (`techive-api` = Django, `techive-web` = React). Never mix them.
2. **Copy every code block EXACTLY as written.** Do not rename, reformat, "improve", add comments, add dependencies, or split files. If a file says REPLACE, overwrite the whole file. If it says CREATE, make a new file at that exact path.
3. **NEVER delete or edit existing migration files** in `accounts/migrations` or `core/migrations`. Only add the new ones listed.
4. Do not touch any file that is not listed in the step.
5. Run every command in the "Verify" section. If something fails, show me the full error output instead of guessing a fix.
6. Do the steps in order. Do not start the next step until the Verify section of the current step passes.

## Commands
None. No new packages.

## Files

### `src/components/SocialButtons.jsx`  —  CREATE

~~~~jsx
import { useEffect, useRef, useState } from 'react'
import { GoogleLogin } from '@react-oauth/google'
import { MS_ENABLED, microsoftIdToken } from '../lib/microsoft'

const GOOGLE = import.meta.env.VITE_GOOGLE_CLIENT_ID

const GIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" /><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.4-4.8 7.1l7.6 5.9c4.4-4.1 7-10.1 7-17.5z" /><path fill="#FBBC05" d="M10.5 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7l-7.9-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.9-6.1z" /><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.3 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" /></svg>
)
const MIcon = () => (
  <svg width="18" height="18" viewBox="0 0 23 23" aria-hidden="true"><path fill="#f35325" d="M1 1h10v10H1z" /><path fill="#81bc06" d="M12 1h10v10H12z" /><path fill="#05a6f0" d="M1 12h10v10H1z" /><path fill="#ffba08" d="M12 12h10v10H12z" /></svg>
)

// Animated "Continue with Google". Our own styled button is shown; Google's real (invisible) button sits on top so clicks go to Google.
export function GoogleButton({ label = 'Continue with Google', onCredential, onError }) {
  const box = useRef(null)
  const [w, setW] = useState(300)
  useEffect(() => { if (box.current) setW(Math.min(400, Math.max(200, Math.round(box.current.offsetWidth)))) }, [])
  return (
    <div ref={box} className="relative">
      <span className="social-btn pointer-events-none"><GIcon />{label}</span>
      {GOOGLE ? (
        <div className="absolute inset-0 overflow-hidden opacity-[0.01]" aria-label={label}>
          <GoogleLogin onSuccess={(r) => onCredential(r.credential)} onError={() => onError?.('Google sign-in failed')} width={String(w)} text="continue_with" />
        </div>
      ) : (
        <button type="button" className="absolute inset-0 cursor-not-allowed" title="Google sign-in is not configured" onClick={() => onError?.('Google sign-in is not configured yet.')} aria-label={label} />
      )}
    </div>
  )
}

export function MicrosoftButton({ label = 'Continue with Microsoft', onToken, onError }) {
  const [busy, setBusy] = useState(false)
  async function click() {
    if (!MS_ENABLED) return onError?.('Microsoft sign-in is not configured yet.')
    setBusy(true)
    try { onToken(await microsoftIdToken()) } catch (e) { if (!/user_cancelled|popup_window_error/.test(e?.errorCode || '')) onError?.('Microsoft sign-in failed.') } finally { setBusy(false) }
  }
  return <button type="button" onClick={click} disabled={busy} className="social-btn"><MIcon />{busy ? 'Opening…' : label}</button>
}
~~~~

### `src/pages/Auth.jsx`  —  CREATE

~~~~jsx
import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Mail, Lock, User, Phone, Eye, EyeOff, ArrowLeft, GraduationCap, X } from 'lucide-react'
import { useSEO } from '../components/ui'
import { GoogleButton, MicrosoftButton } from '../components/SocialButtons'
import { AUTH_COURSES } from '../data'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'

const post = (path, body) => api(path, { method: 'POST', body })

// Input with a leading icon (+ optional show/hide for passwords)
function Field({ icon: Icon, type = 'text', label, value, onChange, ...rest }) {
  const [show, setShow] = useState(false)
  const pw = type === 'password'
  return (
    <label className="relative block">
      <span className="sr-only">{label}</span>
      <Icon size={16} className="pointer-events-none absolute left-1 top-1/2 -translate-y-1/2 text-white/70" />
      <input className="glass-input" type={pw && show ? 'text' : type} placeholder={label} value={value} onChange={onChange} {...rest} />
      {pw && (
        <button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'} className="absolute right-1 top-1/2 -translate-y-1/2 text-white/70 hover:text-white">
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      )}
    </label>
  )
}

const Divider = ({ children }) => <div className="my-4 flex items-center gap-3 text-[11px] uppercase tracking-widest text-white/60"><span className="h-px flex-1 bg-white/25" />{children}<span className="h-px flex-1 bg-white/25" /></div>
const Err = ({ children }) => (children ? <p role="alert" className="rounded-lg bg-red-500/20 px-3 py-2 text-center text-xs text-red-100">{children}</p> : null)

// Left picture panel. Put your own photo at public/auth-side.jpg (the gradient shows if it's missing).
function SidePanel({ academy, courses }) {
  const [i, setI] = useState(0)
  useEffect(() => { if (!academy) return; const t = setInterval(() => setI((x) => (x + 1) % courses.length), 3500); return () => clearInterval(t) }, [academy, courses.length])
  const c = courses[i % courses.length]
  return (
    <div className="relative hidden overflow-hidden md:block" style={{ backgroundImage: 'linear-gradient(160deg,#2563ebcc,#7c5cffcc 55%,#a855f7cc), url(/auth-side.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="absolute -left-10 top-10 h-48 w-48 animate-float rounded-full bg-white/20 blur-2xl" />
      <div className="absolute -bottom-10 right-0 h-56 w-56 animate-float rounded-full bg-brand-cyan/30 blur-3xl" />
      <div className="relative flex h-full flex-col justify-between p-8 text-white">
        <div>
          <p className="font-display text-xs font-bold uppercase tracking-[.3em] text-white/80">{academy ? 'Techive Academy' : 'Techive IT Solutions'}</p>
          <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight">{academy ? 'Learn. Build. Grow.' : 'Archiving Innovation. Coding the Future.'}</h2>
        </div>
        {academy && (
          <div key={i} className="animate-pop rounded-2xl border border-white/30 bg-white/15 p-5 backdrop-blur-md">
            <GraduationCap size={26} />
            <p className="mt-3 text-[11px] font-bold uppercase tracking-[.2em] text-white/80">{c.track}</p>
            <h3 className="font-display text-xl font-bold">{c.name}</h3>
            <p className="mt-1 text-sm text-white/85">{c.blurb || c.description}</p>
            <div className="mt-4 flex gap-1.5">{courses.map((_, n) => <span key={n} className={`h-1.5 rounded-full transition-all ${n === i % courses.length ? 'w-6 bg-white' : 'w-1.5 bg-white/50'}`} />)}</div>
          </div>
        )}
      </div>
    </div>
  )
}

// 6-digit code step shared by login and sign-up
function OtpStep({ email, purpose, remember, onDone, onBack, setNote }) {
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [wait, setWait] = useState(60)
  useEffect(() => { if (wait > 0) { const t = setTimeout(() => setWait(wait - 1), 1000); return () => clearTimeout(t) } }, [wait])

  async function verify(e) {
    e.preventDefault(); setBusy(true); setErr('')
    try { onDone(await post('/auth/otp/verify/', { email, code, purpose, remember })) } catch (x) { setErr(x.message); setBusy(false) }
  }
  async function resend() {
    setErr('')
    try { await post('/auth/otp/request/', { email, purpose }); setWait(60); setNote('A new code is on its way.') } catch (x) { setErr(x.message); if (x.status === 429) setWait(60) }
  }
  return (
    <form onSubmit={verify} className="space-y-5">
      <button type="button" onClick={onBack} className="flex items-center gap-1 text-xs text-white/70 hover:text-white"><ArrowLeft size={14} />Back</button>
      <div><h2 className="font-display text-2xl font-extrabold">Check your email</h2><p className="mt-1 text-sm text-white/75">We sent a 6-digit code to <b className="break-all">{email}</b>. It expires in 10 minutes.</p></div>
      <input required autoFocus inputMode="numeric" autoComplete="one-time-code" pattern="\d{6}" maxLength={6} placeholder="000000" aria-label="6-digit code"
        className="glass-input !pl-1 !pr-1 text-center font-display text-3xl font-bold tracking-[.4em]" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} />
      <Err>{err}</Err>
      <button disabled={busy || code.length !== 6} className="btn-shine">{busy ? 'Verifying…' : 'Verify & continue'}</button>
      <button type="button" disabled={wait > 0} onClick={resend} className="w-full text-xs text-white/70 hover:text-white disabled:opacity-60">{wait > 0 ? `Resend code in ${wait}s` : 'Resend code'}</button>
    </form>
  )
}

function LoginFace({ onDone, onSignup, onNoAccount, note, setNote }) {
  const [stage, setStage] = useState('form') // form | otp | forgot | reset
  const [f, setF] = useState({ email: '', password: '', code: '', password2: '' })
  const [remember, setRemember] = useState(true)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const run = async (fn) => { setBusy(true); setErr(''); try { await fn() } catch (x) { setErr(x.message) } finally { setBusy(false) } }

  const submit = (e) => { e.preventDefault(); run(async () => { await post('/auth/login/', { email: f.email, password: f.password }); setNote(''); setStage('otp') }) }
  const forgot = (e) => { e.preventDefault(); run(async () => { await post('/auth/password/forgot/', { email: f.email }); setStage('reset') }) }
  const reset = (e) => { e.preventDefault(); run(async () => { await post('/auth/password/reset/', { email: f.email, code: f.code, password: f.password, password2: f.password2 }); setF({ ...f, password: '', password2: '', code: '' }); setNote('Password updated. Please log in.'); setStage('form') }) }
  const google = (credential) => run(async () => {
    try { onDone(await post('/auth/google/', { credential, mode: 'login' }), true) }
    catch (x) { if (x.data?.code === 'no_account') onNoAccount(x.data); else throw x }
  })

  if (stage === 'otp') return <OtpStep email={f.email} purpose="login" remember={remember} onDone={(d) => onDone(d, remember)} onBack={() => setStage('form')} setNote={setNote} />

  if (stage === 'forgot' || stage === 'reset')
    return (
      <form onSubmit={stage === 'forgot' ? forgot : reset} className="space-y-5">
        <button type="button" onClick={() => setStage('form')} className="flex items-center gap-1 text-xs text-white/70 hover:text-white"><ArrowLeft size={14} />Back to login</button>
        <div><h2 className="font-display text-2xl font-extrabold">Reset password</h2>
          <p className="mt-1 text-sm text-white/75">{stage === 'forgot' ? 'Enter your email and we will send you a code.' : `Enter the code we sent to ${f.email} and choose a new password.`}</p></div>
        {stage === 'forgot' ? <Field icon={Mail} type="email" label="Email" required autoComplete="email" value={f.email} onChange={set('email')} /> : (
          <>
            <Field icon={Lock} label="6-digit code" required inputMode="numeric" maxLength={6} autoComplete="one-time-code" value={f.code} onChange={(e) => setF({ ...f, code: e.target.value.replace(/\D/g, '') })} />
            <Field icon={Lock} type="password" label="New password (min 8 characters)" required minLength={8} autoComplete="new-password" value={f.password} onChange={set('password')} />
            <Field icon={Lock} type="password" label="Repeat new password" required minLength={8} autoComplete="new-password" value={f.password2} onChange={set('password2')} />
          </>
        )}
        <Err>{err}</Err>
        <button disabled={busy} className="btn-shine">{busy ? 'Please wait…' : stage === 'forgot' ? 'Send code' : 'Update password'}</button>
      </form>
    )

  return (
    <div>
      <img src="/logo-light.png" alt="Techive IT Solutions" width="900" height="300" className="mb-5 h-12 w-auto" />
      <h1 className="font-display text-3xl font-extrabold">Welcome back</h1>
      <p className="mt-1 text-sm text-white/75">Please login back to your account</p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <Field icon={Mail} type="email" label="Username (email)" required autoComplete="username" value={f.email} onChange={set('email')} />
        <Field icon={Lock} type="password" label="Password" required autoComplete="current-password" value={f.password} onChange={set('password')} />
        <div className="flex items-center justify-between text-xs">
          <label className="flex cursor-pointer items-center gap-2 text-white/80"><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 accent-brand-cyan" />Remember me</label>
          <button type="button" onClick={() => { setErr(''); setStage('forgot') }} className="text-white/80 underline-offset-2 hover:text-white hover:underline">Forgot password?</button>
        </div>
        {note && <p className="rounded-lg bg-emerald-500/20 px-3 py-2 text-center text-xs text-emerald-100">{note}</p>}
        <Err>{err}</Err>
        <button disabled={busy} className="btn-shine">{busy ? 'Please wait…' : 'Login'}</button>
      </form>
      <Divider>or</Divider>
      <GoogleButton onCredential={google} onError={setErr} />
      <p className="mt-6 text-center text-sm text-white/80">Don't have an account? <button type="button" onClick={onSignup} className="font-bold text-white underline underline-offset-2">Sign up</button></p>
    </div>
  )
}

function SignupFace({ academy, prefill, onDone, onLogin }) {
  const [stage, setStage] = useState('form') // form | otp
  const [f, setF] = useState({ name: '', email: '', phone: '', password: '', password2: '' })
  const [remember, setRemember] = useState(true)
  const [purpose, setPurpose] = useState('signup')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [note, setNote] = useState('')
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  useEffect(() => { if (prefill) setF((x) => ({ ...x, email: prefill.email || x.email, name: prefill.name || x.name })) }, [prefill])
  const run = async (fn) => { setBusy(true); setErr(''); try { await fn() } catch (x) { setErr(x.message) } finally { setBusy(false) } }

  const submit = (e) => {
    e.preventDefault()
    if (f.password !== f.password2) return setErr('Passwords do not match.')
    run(async () => { await post('/auth/register/', f); setPurpose('signup'); setStage('otp') })
  }
  const google = (credential) => run(async () => onDone(await post('/auth/google/', { credential, mode: 'signup' }), true))
  const microsoft = (id_token) => run(async () => {
    const r = await post('/auth/microsoft/', { id_token, mode: 'signup' })
    setF((x) => ({ ...x, email: r.email })); setPurpose(r.purpose); setStage('otp')
  })

  if (stage === 'otp') return <OtpStep email={f.email} purpose={purpose} remember={remember} onDone={(d) => onDone(d, remember)} onBack={() => setStage('form')} setNote={setNote} />

  return (
    <div>
      <img src="/logo-light.png" alt="Techive IT Solutions" width="900" height="300" className="mb-4 h-12 w-auto" />
      {academy ? (
        <>
          <p className="inline-flex items-center gap-2 rounded-full bg-brand-grad px-3 py-1 text-[11px] font-bold uppercase tracking-[.2em]"><GraduationCap size={14} />Techive Academy</p>
          <h1 className="mt-3 font-display text-2xl font-extrabold leading-tight sm:text-3xl">We're happy to have you join our <span className="bg-gradient-to-r from-brand-cyan to-brand-violet bg-clip-text text-transparent">Academy</span></h1>
          <p className="mt-1 text-sm text-white/75">Create an account to pick your course.</p>
        </>
      ) : (
        <>
          <h1 className="font-display text-3xl font-extrabold">Create your account</h1>
          <p className="mt-1 text-sm text-white/75">It takes less than a minute.</p>
        </>
      )}
      <form onSubmit={submit} className="mt-5 space-y-3.5">
        <Field icon={User} label="Name" required autoComplete="name" value={f.name} onChange={set('name')} />
        <Field icon={Mail} type="email" label="Email" required autoComplete="email" value={f.email} onChange={set('email')} />
        <Field icon={Phone} type="tel" label="Phone (e.g. 0700 000 000)" required autoComplete="tel" value={f.phone} onChange={set('phone')} />
        <Field icon={Lock} type="password" label="Password (min 8 characters)" required minLength={8} autoComplete="new-password" value={f.password} onChange={set('password')} />
        <Field icon={Lock} type="password" label="Repeat password" required minLength={8} autoComplete="new-password" value={f.password2} onChange={set('password2')} />
        <label className="flex cursor-pointer items-center gap-2 text-xs text-white/80"><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 accent-brand-cyan" />Remember me</label>
        {note && <p className="text-center text-xs text-emerald-200">{note}</p>}
        <Err>{err}</Err>
        <button disabled={busy} className="btn-shine">{busy ? 'Please wait…' : 'Create account'}</button>
      </form>
      <Divider>or sign up with</Divider>
      <div className="grid gap-3 sm:grid-cols-2">
        <GoogleButton label="Google" onCredential={google} onError={setErr} />
        <MicrosoftButton label="Microsoft" onToken={microsoft} onError={setErr} />
      </div>
      <p className="mt-5 text-center text-sm text-white/80">Already have an account? <button type="button" onClick={onLogin} className="font-bold text-white underline underline-offset-2">Login</button></p>
    </div>
  )
}

export default function Auth() {
  useSEO('Login')
  const { login, user } = useAuth()
  const nav = useNavigate()
  const [qs] = useSearchParams()
  const next = qs.get('next')?.startsWith('/') ? qs.get('next') : '/' // same-site paths only
  const [mode, setMode] = useState(qs.get('mode') === 'signup' ? 'signup' : 'login')
  const [academy] = useState(qs.get('from') === 'academy' || next.startsWith('/academy'))
  const [note, setNote] = useState('')
  const [missing, setMissing] = useState(null) // google/microsoft says: no account for this email
  const [courses, setCourses] = useState(AUTH_COURSES)

  useEffect(() => { if (user) nav(next, { replace: true }) }, []) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    api('/academy/courses/').then((r) => { const list = (Array.isArray(r) ? r : r.results || []).map((c) => ({ name: c.name, track: c.track, blurb: c.description })); if (list.length) setCourses(list) }).catch(() => {})
  }, [])

  const done = (data, remember = true) => { login(data, remember); nav(data.user.is_staff && next === '/' ? '/admin' : next, { replace: true }) }
  const signup = mode === 'signup'

  return (
    <main className="auth-bg relative flex min-h-screen items-center justify-center overflow-hidden px-3 py-8 text-white sm:px-6">
      <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 animate-float rounded-full bg-brand-blue/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 animate-float rounded-full bg-brand-violet/30 blur-3xl" />
      <Link to="/" className="absolute left-4 top-4 z-10 flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold backdrop-blur hover:bg-white/20"><ArrowLeft size={14} />Home</Link>

      {/* glass card that flips between login and sign-up */}
      <div className="relative w-full max-w-4xl [perspective:1800px]">
        <div className="grid transition-transform duration-700 ease-in-out [transform-style:preserve-3d]" style={{ transform: signup ? 'rotateY(180deg)' : 'none' }}>
          <section aria-label="Login" inert={signup ? '' : undefined} className="glass grid overflow-hidden rounded-3xl [grid-area:1/1] md:grid-cols-[1fr_1.1fr]" style={{ backfaceVisibility: 'hidden' }}>
            <SidePanel academy={false} courses={courses} />
            <div className="flex items-center p-6 sm:p-10"><div className="w-full">
              <LoginFace onDone={done} onSignup={() => setMode('signup')} onNoAccount={setMissing} note={note} setNote={setNote} />
            </div></div>
          </section>
          <section aria-label="Sign up" inert={signup ? undefined : ''} className="glass grid overflow-hidden rounded-3xl [grid-area:1/1] md:grid-cols-[1.1fr_1fr]" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
            <div className="flex items-center p-6 sm:p-10"><div className="w-full">
              <SignupFace academy={academy} prefill={missing} onDone={done} onLogin={() => setMode('login')} />
            </div></div>
            <SidePanel academy courses={courses} />
          </section>
        </div>
      </div>

      {/* "no account found" popup */}
      {missing && !signup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="No account found">
          <div className="glass relative w-full max-w-sm animate-pop rounded-3xl p-7 text-center">
            <button onClick={() => setMissing(null)} aria-label="Close" className="absolute right-3 top-3 rounded-full p-1.5 hover:bg-white/20"><X size={18} /></button>
            <h2 className="font-display text-xl font-extrabold">No account found</h2>
            <p className="mt-2 text-sm text-white/80">We couldn't find an account for <b className="break-all">{missing.email}</b>. Create one to continue.</p>
            <button onClick={() => setMode('signup')} className="btn-shine mt-6">Create account</button>
          </div>
        </div>
      )}
    </main>
  )
}
~~~~

## Optional picture
The left panel of the login card is a blue/violet gradient. To show a real photo, put an image at `public/auth-side.jpg` (landscape or portrait, under 300 KB). Nothing else needs to change; the gradient stays on top as a tint. If the file does not exist the gradient shows on its own.

## Verify
Wait for Step 6 (routes) before opening `/auth`. This step only needs `npm run dev` to start with no errors.

**What this page does:** `/auth` = glass login card (landscape, picture panel, logo, "Welcome back / Please login back to your account", email + password, animated Login button, Remember me, Forgot password, animated "Continue with Google", "Don't have an account? Sign up"). Clicking Sign up flips the card in 3D to the sign-up side (Name, email, phone, password, repeat password, Remember me, Google + Microsoft buttons). From the Academy link the sign-up header reads "We're happy to have you join our Academy" with a courses carousel panel. Email login and sign-up both require the 6-digit code that is emailed. Google login for an email with no account shows a "No account found" popup that leads to sign-up.
