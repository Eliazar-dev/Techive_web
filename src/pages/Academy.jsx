import { useEffect, useState, useCallback } from 'react'
import { GraduationCap, Check, X, Clock, Monitor, UserCheck, Award, TrendingUp, Laptop } from 'lucide-react'
import { Reveal, useSEO } from '../components/ui'
import { useContent } from '../lib/content'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'

const MODES = { online: 'Online', physical: 'Physical', hybrid: 'Hybrid' }
const money = (n) => (n == null ? 'Price to be announced' : `KSh ${Number(n).toLocaleString()}`)
const REG_STATUS = { registered: 'Registered', active: 'In progress', completed: 'Completed', dropped: 'Dropped' }
const PAY = { unpaid: 'Unpaid', partial: 'Part paid', paid: 'Paid' }
const featIcons = [Laptop, UserCheck, Award, TrendingUp]

function Modal({ children, onClose, label }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={label}>
      <div className="relative my-8 w-full max-w-lg animate-pop rounded-3xl bg-white p-6 text-ink shadow-2xl sm:p-8">
        <button onClick={onClose} aria-label="Close" className="absolute right-3 top-3 rounded-full p-2 hover:bg-zinc-100"><X size={18} /></button>
        {children}
      </div>
    </div>
  )
}

// Register for one course. After success we show the rules and payment plan.
function RegisterModal({ course, onClose, onDone }) {
  const { user, updateUser } = useAuth()
  const [phone, setPhone] = useState(user?.phone || '')
  const [agree, setAgree] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [res, setRes] = useState(null)
  const [info, setInfo] = useState(null)

  async function submit(e) {
    e.preventDefault(); setBusy(true); setErr('')
    try {
      const r = await api('/academy/registrations/', { method: 'POST', body: { course: course.id, phone } })
      if (phone && !user.phone) updateUser({ phone })
      setInfo(await api('/academy/info/').catch(() => null))
      setRes(r); onDone()
    } catch (x) { setErr(x.message) } finally { setBusy(false) }
  }

  if (res)
    return (
      <Modal onClose={onClose} label="Registration complete">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-grad text-white"><Check size={28} /></span>
        <h2 className="mt-4 text-2xl font-extrabold">You're registered!</h2>
        <p className="mt-1 text-sm text-zinc-600">{course.name}. We've emailed you the details; our team will contact you with the class schedule.</p>
        {(res.rules || info?.general_rules) && <div className="mt-5"><h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Course rules</h3><p className="mt-1 whitespace-pre-wrap text-sm">{[info?.general_rules, res.rules].filter(Boolean).join('\n\n')}</p></div>}
        {(res.payment_plan || info?.payment_instructions || info?.till_number) && (
          <div className="mt-5 rounded-2xl bg-zinc-100 p-4"><h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Payment plan</h3>
            <p className="mt-1 whitespace-pre-wrap text-sm">{[res.payment_plan, info?.payment_instructions].filter(Boolean).join('\n\n')}</p>
            {info?.till_number && <p className="mt-3 text-sm">Till number: <b className="text-lg">{info.till_number}</b></p>}</div>
        )}
        <button onClick={onClose} className="btn-dark mt-6 w-full">Done</button>
      </Modal>
    )
  return (
    <Modal onClose={onClose} label="Register for course">
      <h2 className="text-2xl font-extrabold">Register for {course.name}</h2>
      <p className="mt-1 text-sm text-zinc-600">{[course.duration, MODES[course.mode], money(course.price)].filter(Boolean).join(' · ')}</p>
      <form onSubmit={submit} className="mt-5 space-y-4">
        <label className="block text-sm font-medium">Phone / WhatsApp<input required className="input mt-1" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" /></label>
        <label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 h-4 w-4 accent-ink" />I understand this course is taught outside the website and my progress is tracked by the Techive team. The rules and payment plan are shown after I register.</label>
        {err && <p className="text-sm text-red-600" role="alert">{err}</p>}
        <button disabled={busy || !agree} className="btn-dark w-full">{busy ? 'Registering…' : 'Register'}</button>
      </form>
    </Modal>
  )
}

function WaitlistModal({ course, onClose }) {
  const { user } = useAuth()
  const [st, setSt] = useState('idle')
  const [err, setErr] = useState('')
  async function go() {
    setSt('busy'); setErr('')
    try { await api('/academy/waitlist/', { method: 'POST', body: { email: user.email, name: `${user.first_name} ${user.last_name}`.trim(), course: course.name } }); setSt('done') }
    catch (x) { setErr(x.message); setSt('idle') }
  }
  return (
    <Modal onClose={onClose} label="Join waitlist">
      {st === 'done' ? (<><h2 className="text-2xl font-extrabold">You're on the list</h2><p className="mt-2 text-sm text-zinc-600">We'll email {user.email} when {course.name} opens.</p><button onClick={onClose} className="btn-dark mt-6 w-full">Done</button></>) : (
        <><h2 className="text-2xl font-extrabold">{course.name} opens soon</h2><p className="mt-2 text-sm text-zinc-600">Join the waitlist and we'll email {user.email} the moment registration opens.</p>
          {err && <p className="mt-3 text-sm text-red-600">{err}</p>}
          <button onClick={go} disabled={st === 'busy'} className="btn-dark mt-6 w-full">{st === 'busy' ? 'Joining…' : 'Join waitlist'}</button></>
      )}
    </Modal>
  )
}

export default function Academy() {
  useSEO('Academy', 'Techive Academy: Building with AI and Cybersecurity courses. Register and track your progress.')
  const { user } = useAuth()
  const c = useContent('academy')
  const [courses, setCourses] = useState(null)
  const [mine, setMine] = useState([])
  const [err, setErr] = useState('')
  const [modal, setModal] = useState(null) // {type:'reg'|'wait', course}

  const load = useCallback(() => {
    api('/academy/courses/').then((r) => setCourses(Array.isArray(r) ? r : r.results || [])).catch((e) => { setErr(e.message); setCourses([]) })
    api('/academy/registrations/').then((r) => setMine(Array.isArray(r) ? r : r.results || [])).catch(() => {})
  }, [])
  useEffect(load, [load])

  const registered = new Set(mine.map((r) => r.course.id))
  const tracks = [...new Set((courses || []).map((x) => x.track || 'Courses'))]

  return (
    <>
      <section className="relative overflow-hidden bg-ink pb-16 pt-36 text-white md:pb-24 md:pt-48">
        <div className="pointer-events-none absolute inset-0 opacity-[.07]" style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '48px 48px' }} />
        <div className="pointer-events-none absolute -right-20 top-10 h-[28rem] w-[28rem] rounded-full bg-brand-violet/25 blur-3xl" />
        <div className="container-x relative animate-fade-up">
          <p className="text-sm font-semibold tracking-[.3em] text-zinc-300">LEARN <span className="text-brand-cyan">·</span> BUILD <span className="text-brand-cyan">·</span> GROW</p>
          <h1 className="mt-5 max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">{c.hero.title}</h1>
          <p className="mt-5 max-w-xl text-lg text-zinc-300">{c.hero.text}</p>
          <p className="mt-4 text-sm text-zinc-400">Signed in as {user.email}</p>
        </div>
      </section>

      {mine.length > 0 && (
        <section className="bg-zinc-100 py-14">
          <div className="container-x">
            <h2 className="text-2xl font-extrabold">My courses</h2>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {mine.map((r) => (
                <div key={r.id} className="card">
                  <div className="flex items-start justify-between gap-3">
                    <div><p className="text-xs font-bold uppercase tracking-widest text-zinc-500">{r.course.track}</p><h3 className="text-lg font-bold">{r.course.name}</h3></div>
                    <span className="rounded-full bg-ink px-3 py-1 text-xs font-semibold text-white">{REG_STATUS[r.status]}</span>
                  </div>
                  <div className="mt-4"><div className="mb-1 flex justify-between text-xs text-zinc-600"><span>Progress</span><b>{r.progress}%</b></div>
                    <div className="h-2.5 rounded bg-zinc-200"><div className="h-2.5 rounded bg-brand-grad transition-all" style={{ width: `${r.progress}%` }} /></div></div>
                  {r.progress_note && <p className="mt-3 text-sm text-zinc-600">“{r.progress_note}”</p>}
                  <p className="mt-3 text-xs text-zinc-500">Payment: <b>{PAY[r.payment_status]}</b></p>
                  {(r.rules || r.payment_plan) && (
                    <details className="mt-3 text-sm"><summary className="cursor-pointer font-semibold">Rules & payment plan</summary>
                      <p className="mt-2 whitespace-pre-wrap text-zinc-600">{[r.rules, r.payment_plan].filter(Boolean).join('\n\n')}</p></details>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="bg-zinc-50 py-16 sm:py-24">
        <div className="container-x">
          {courses === null && <p className="text-center text-zinc-500">Loading courses…</p>}
          {err && <p className="text-center text-red-600">{err}</p>}
          {tracks.map((t) => (
            <div key={t} className="mb-14 last:mb-0">
              <Reveal className="mb-8 flex items-center gap-6"><h2 className="text-2xl font-extrabold sm:text-3xl">{t}</h2><span className="h-px flex-1 bg-brand-grad" /></Reveal>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {courses.filter((x) => (x.track || 'Courses') === t).map((x, n) => (
                  <Reveal key={x.id} delay={(n % 3) * 80}>
                    <div className="card flex h-full flex-col">
                      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-ink text-white"><GraduationCap size={22} /></span>
                      <h3 className="text-lg font-bold leading-snug">{x.name}</h3>
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-600">{x.description || 'Details coming soon.'}</p>
                      <ul className="mt-4 space-y-1.5 text-xs text-zinc-600">
                        <li className="flex items-center gap-2"><Clock size={14} />{x.duration || 'Duration to be announced'}</li>
                        <li className="flex items-center gap-2"><Monitor size={14} />{MODES[x.mode]}{x.tutor ? ` · Tutor: ${x.tutor}` : ''}</li>
                      </ul>
                      <p className="mt-3 font-display text-lg font-extrabold">{money(x.price)}</p>
                      {registered.has(x.id) ? <span className="btn mt-4 bg-emerald-100 text-emerald-700"><Check size={16} />Registered</span>
                        : x.status === 'open' ? <button onClick={() => setModal({ type: 'reg', course: x })} className="btn-dark mt-4">Register</button>
                        : <button onClick={() => setModal({ type: 'wait', course: x })} className="btn-light mt-4">Coming soon · Join waitlist</button>}
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          ))}
          {courses && courses.length === 0 && !err && <p className="text-center text-zinc-500">Courses will appear here soon.</p>}
        </div>
      </section>

      <section className="bg-ink py-16 text-white">
        <div className="container-x grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {c.features.map((f, n) => { const I = featIcons[n % 4]; return <div key={f} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[.04] p-5"><I size={28} className="shrink-0 text-brand-cyan" /><span className="font-semibold">{f}</span></div> })}
        </div>
      </section>

      {modal?.type === 'reg' && <RegisterModal course={modal.course} onClose={() => setModal(null)} onDone={load} />}
      {modal?.type === 'wait' && <WaitlistModal course={modal.course} onClose={() => setModal(null)} />}
    </>
  )
}
