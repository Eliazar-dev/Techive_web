# Step 7 — Frontend: admin dashboard upgrades

**Repo: `techive-web`.** Do Step 6 first. Paste this whole file into Devin.


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

### `src/pages/adminKit.jsx`  —  CREATE

~~~~jsx
import { useEffect, useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { api } from '../lib/api'

export const STATUSES = { new: 'New', contacted: 'Contacted', in_progress: 'In progress', won: 'Won', lost: 'Lost' }
export const pill = { new: 'bg-blue-100 text-blue-700', contacted: 'bg-amber-100 text-amber-700', in_progress: 'bg-violet-100 text-violet-700', won: 'bg-emerald-100 text-emerald-700', lost: 'bg-zinc-200 text-zinc-600' }
export const fmt = (d) => (d ? new Date(d).toLocaleString('en-KE', { dateStyle: 'medium', timeStyle: 'short' }) : '—')

// Fetch one page of a paginated list endpoint
export function useList(path, page, query = '') {
  const [d, setD] = useState({ results: [], count: 0, loading: true, error: '' })
  const load = useCallback(() => {
    setD((x) => ({ ...x, loading: true }))
    api(`${path}?page=${page}${query}`).then((r) => setD({ ...r, loading: false, error: '' })).catch((e) => setD({ results: [], count: 0, loading: false, error: e.message }))
  }, [path, page, query])
  useEffect(load, [load])
  return [d, load, setD]
}

export function Pager({ page, setPage, count, size = 50 }) {
  const pages = Math.max(1, Math.ceil(count / size))
  return (
    <div className="flex items-center justify-between border-t border-zinc-200 px-4 py-3 text-sm text-zinc-600">
      <span>{count} total</span>
      <div className="flex items-center gap-2">
        <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-lg p-2 ring-1 ring-zinc-200 disabled:opacity-40" aria-label="Previous page"><ChevronLeft size={16} /></button>
        <span>Page {page} / {pages}</span>
        <button disabled={page >= pages} onClick={() => setPage(page + 1)} className="rounded-lg p-2 ring-1 ring-zinc-200 disabled:opacity-40" aria-label="Next page"><ChevronRight size={16} /></button>
      </div>
    </div>
  )
}

export const Table = ({ head, children, empty, loading, error }) => (
  <div className="overflow-x-auto">
    <table className="w-full min-w-[640px] text-left text-sm">
      <thead className="bg-zinc-50 text-xs uppercase tracking-wider text-zinc-500"><tr>{head.map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}</tr></thead>
      <tbody className="divide-y divide-zinc-100">{children}</tbody>
    </table>
    {(loading || error || empty) && <p className={`p-8 text-center text-sm ${error ? 'text-red-600' : 'text-zinc-500'}`}>{error || (loading ? 'Loading…' : 'Nothing here yet.')}</p>}
  </div>
)


export const Card = ({ title, extra, children }) => (
  <div className="rounded-2xl border border-zinc-200 bg-white">
    <div className="flex items-center justify-between gap-3 border-b border-zinc-200 p-4"><h2 className="font-bold">{title}</h2>{extra}</div>
    {children}
  </div>
)
~~~~

### `src/pages/Admin.jsx`  —  REPLACE

~~~~jsx
import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { FileText, Users, GraduationCap, Inbox, Eye, BookOpen, Copy } from 'lucide-react'
import { useSEO } from '../components/ui'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'

import { STATUSES, pill, fmt, useList, Pager, Table } from './adminKit'
import AdminAcademy from './AdminAcademy'
import AdminPages from './AdminPages'

function Overview() {
  const [s, setS] = useState(null)
  const [err, setErr] = useState('')
  useEffect(() => { api('/admin/stats/').then(setS).catch((e) => setErr(e.message)) }, [])
  if (err) return <p className="text-red-600">{err}</p>
  if (!s) return <p className="text-zinc-500">Loading…</p>
  const cards = [
    [Inbox, 'New quotes', s.quotes_new], [FileText, 'Quotes (7 days)', s.quotes_week], [FileText, 'All quotes', s.quotes_total],
    [Users, 'Users', s.users_total], [GraduationCap, 'Academy waitlist', s.waitlist_total], [BookOpen, 'Course registrations', s.registrations_total], [Eye, 'Cookie visitors', s.visitors_total],
  ]
  const max = Math.max(1, ...s.by_service.map((x) => x.n))
  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(([I, l, v]) => (
          <div key={l} className="rounded-2xl border border-zinc-200 bg-white p-5">
            <I size={20} className="text-zinc-400" /><p className="mt-3 text-3xl font-extrabold">{v}</p><p className="text-sm text-zinc-500">{l}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6">
          <h3 className="mb-4 font-bold">Quotes by service</h3>
          {s.by_service.length === 0 && <p className="text-sm text-zinc-500">No quotes yet.</p>}
          <div className="space-y-3">{s.by_service.map((x) => (
            <div key={x.service}><div className="mb-1 flex justify-between text-sm"><span>{x.service}</span><b>{x.n}</b></div>
              <div className="h-2 rounded bg-zinc-100"><div className="h-2 rounded bg-brand-grad" style={{ width: `${(x.n / max) * 100}%` }} /></div></div>
          ))}</div>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6">
          <h3 className="mb-4 font-bold">Pipeline</h3>
          <div className="flex flex-wrap gap-3">{Object.entries(STATUSES).map(([k, l]) => (
            <span key={k} className={`rounded-full px-4 py-2 text-sm font-semibold ${pill[k]}`}>{l}: {s.by_status[k] || 0}</span>
          ))}</div>
        </div>
      </div>
    </div>
  )
}

function Quotes() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const [open, setOpen] = useState(null)
  const [d, , setD] = useList('/admin/quotes/', page, status ? `&status=${status}` : '')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const patch = async (q, body) => {
    setSaving(true)
    try {
      const r = await api(`/admin/quotes/${q.id}/`, { method: 'PATCH', body })
      setD((x) => ({ ...x, results: x.results.map((i) => (i.id === q.id ? r : i)) }))
    } catch (e) { alert(e.message) } finally { setSaving(false) }
  }
  const toggle = (q) => { setOpen(open === q.id ? null : q.id); setNotes(q.notes || '') }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-zinc-200 p-4">
        <h2 className="font-bold">Quote requests</h2>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }} className="rounded-lg border border-zinc-300 px-3 py-2 text-sm" aria-label="Filter by status">
          <option value="">All statuses</option>{Object.entries(STATUSES).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
        </select>
      </div>
      <Table head={['Client', 'Service', 'Budget', 'Received', 'Status']} loading={d.loading} error={d.error} empty={!d.loading && !d.error && d.results.length === 0}>
        {d.results.map((q) => (
          <FragmentRow key={q.id}>
            <tr className="cursor-pointer hover:bg-zinc-50" onClick={() => toggle(q)}>
              <td className="px-4 py-3"><p className="font-semibold">{q.name}</p><p className="text-xs text-zinc-500">{q.email}</p></td>
              <td className="px-4 py-3">{q.service || '—'}</td><td className="px-4 py-3">{q.budget || '—'}</td><td className="px-4 py-3 text-zinc-500">{fmt(q.created_at)}</td>
              <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                <select value={q.status} onChange={(e) => patch(q, { status: e.target.value })} className={`rounded-full px-3 py-1 text-xs font-semibold ${pill[q.status]}`} aria-label="Quote status">
                  {Object.entries(STATUSES).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                </select>
              </td>
            </tr>
            {open === q.id && (
              <tr className="bg-zinc-50"><td colSpan={5} className="px-4 py-5">
                <div className="grid gap-6 md:grid-cols-2">
                  <div><p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Project details</p>
                    <p className="mt-2 whitespace-pre-wrap text-sm">{q.message}</p>
                    <p className="mt-3 text-sm text-zinc-600">Phone: {q.phone || '—'}</p>
                    <a href={`mailto:${q.email}?subject=Your Techive quote request`} className="mt-1 inline-block text-sm font-semibold underline">Reply by email</a></div>
                  <div><label className="text-xs font-bold uppercase tracking-widest text-zinc-500" htmlFor={`n${q.id}`}>Internal notes</label>
                    <textarea id={`n${q.id}`} rows={4} className="input mt-2" value={notes} onChange={(e) => setNotes(e.target.value)} />
                    <button disabled={saving} onClick={() => patch(q, { notes })} className="btn-dark mt-3 !py-2">{saving ? 'Saving…' : 'Save notes'}</button></div>
                </div>
              </td></tr>
            )}
          </FragmentRow>
        ))}
      </Table>
      <Pager page={page} setPage={setPage} count={d.count} />
    </div>
  )
}
const FragmentRow = ({ children }) => <>{children}</>

function Simple({ title, path, head, row, extra }) {
  const [page, setPage] = useState(1)
  const [d] = useList(path, page)
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white">
      <div className="flex items-center justify-between border-b border-zinc-200 p-4"><h2 className="font-bold">{title}</h2>{extra?.(d)}</div>
      <Table head={head} loading={d.loading} error={d.error} empty={!d.loading && !d.error && d.results.length === 0}>
        {d.results.map((r) => <tr key={r.id} className="hover:bg-zinc-50">{row(r)}</tr>)}
      </Table>
      <Pager page={page} setPage={setPage} count={d.count} />
    </div>
  )
}

const TABS = [['overview', 'Overview'], ['quotes', 'Quotes'], ['users', 'Users'], ['courses', 'Courses'], ['students', 'Students'], ['waitlist', 'Waitlist'], ['pages', 'Pages'], ['visitors', 'Visitors']]

export default function Admin() {
  useSEO('Admin')
  const { user, ready } = useAuth()
  const [tab, setTab] = useState('overview')
  if (!ready) return <div className="min-h-screen bg-ink" />
  if (!user) return <Navigate to="/auth?next=/admin" replace />
  if (!user.is_staff) return (
    <section className="grid min-h-screen place-items-center bg-ink px-6 text-center text-white">
      <div><h1 className="text-3xl font-extrabold">Not authorized</h1><p className="mt-2 text-zinc-400">This area is for Techive staff only.</p></div>
    </section>
  )
  return (
    <>
      <section className="bg-ink pb-10 pt-36 text-white md:pt-44">
        <div className="container-x"><h1 className="text-3xl font-extrabold sm:text-4xl">Admin dashboard</h1><p className="mt-1 text-zinc-400">Signed in as {user.email}</p></div>
      </section>
      <section className="min-h-[60vh] bg-zinc-100 pb-20">
        <div className="container-x">
          <div className="-mt-5 mb-8 flex gap-2 overflow-x-auto rounded-2xl bg-white p-2 shadow-sm ring-1 ring-zinc-200" role="tablist">
            {TABS.map(([k, l]) => (
              <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`whitespace-nowrap rounded-xl px-5 py-2.5 text-sm font-semibold transition ${tab === k ? 'bg-ink text-white' : 'text-zinc-600 hover:bg-zinc-100'}`}>{l}</button>
            ))}
          </div>
          {tab === 'overview' && <Overview />}
          {tab === 'quotes' && <Quotes />}
          {tab === 'users' && <Simple title="Users" path="/admin/users/" head={['Email', 'Name', 'Role', 'Quotes', 'Joined', 'Last login']}
            row={(u) => <><td className="px-4 py-3 font-medium">{u.email}</td><td className="px-4 py-3">{`${u.first_name} ${u.last_name}`.trim() || '—'}</td><td className="px-4 py-3">{u.is_staff ? 'Staff' : 'Client'}</td><td className="px-4 py-3">{u.quotes}</td><td className="px-4 py-3 text-zinc-500">{fmt(u.date_joined)}</td><td className="px-4 py-3 text-zinc-500">{fmt(u.last_login)}</td></>} />}
          {tab === 'courses' && <AdminAcademy view="courses" />}
          {tab === 'students' && <AdminAcademy view="students" />}
          {tab === 'pages' && <AdminPages view="pages" />}
          {tab === 'visitors' && <AdminPages view="visitors" />}
          {tab === 'waitlist' && <Simple title="Academy waitlist" path="/admin/waitlist/" head={['Email', 'Name', 'Interested in', 'Joined']}
            extra={(d) => <button onClick={() => navigator.clipboard?.writeText(d.results.map((r) => r.email).join(', '))} className="flex items-center gap-2 text-sm font-semibold text-zinc-600 hover:text-ink"><Copy size={16} />Copy page emails</button>}
            row={(w) => <><td className="px-4 py-3 font-medium">{w.email}</td><td className="px-4 py-3">{w.name || '—'}</td><td className="px-4 py-3">{w.course || '—'}</td><td className="px-4 py-3 text-zinc-500">{fmt(w.created_at)}</td></>} />}
        </div>
      </section>
    </>
  )
}
~~~~

### `src/pages/AdminAcademy.jsx`  —  CREATE

~~~~jsx
import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { api } from '../lib/api'
import { fmt, useList, Pager, Table, Card } from './adminKit'

const MODES = { online: 'Online', physical: 'Physical', hybrid: 'Hybrid' }
const BLANK = { name: '', track: 'Building with AI', description: '', duration: '', mode: 'online', price: '', tutor: '', rules: '', payment_plan: '', status: 'coming_soon', is_published: true, order: 0 }

// Create / edit one course
function CourseForm({ course, onSaved, onCancel }) {
  const [f, setF] = useState({ ...BLANK, ...course, price: course?.price ?? '' })
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })
  async function save(e) {
    e.preventDefault(); setBusy(true); setErr('')
    const body = { ...f, price: f.price === '' ? null : Number(f.price), order: Number(f.order) || 0 }
    try { await api(course?.id ? `/admin/courses/${course.id}/` : '/admin/courses/', { method: course?.id ? 'PATCH' : 'POST', body }); onSaved() }
    catch (x) { setErr(x.data ? Object.values(x.data).flat().join(' ') : x.message); setBusy(false) }
  }
  const L = 'block text-sm font-medium'
  return (
    <form onSubmit={save} className="grid gap-4 border-b border-zinc-200 bg-zinc-50 p-4 sm:grid-cols-2">
      <label className={L}>Course name<input required className="input mt-1" value={f.name} onChange={set('name')} /></label>
      <label className={L}>Track<input className="input mt-1" value={f.track} onChange={set('track')} /></label>
      <label className={`${L} sm:col-span-2`}>Description<textarea rows={3} className="input mt-1" value={f.description} onChange={set('description')} /></label>
      <label className={L}>Duration (e.g. 6 weeks)<input className="input mt-1" value={f.duration} onChange={set('duration')} /></label>
      <label className={L}>Mode of teaching<select className="input mt-1" value={f.mode} onChange={set('mode')}>{Object.entries(MODES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
      <label className={L}>Price (KSh, blank = not announced)<input type="number" min="0" className="input mt-1" value={f.price} onChange={set('price')} /></label>
      <label className={L}>Tutor<input className="input mt-1" value={f.tutor} onChange={set('tutor')} /></label>
      <label className={`${L} sm:col-span-2`}>Course rules (shown after registering)<textarea rows={3} className="input mt-1" value={f.rules} onChange={set('rules')} /></label>
      <label className={`${L} sm:col-span-2`}>Payment plan description<textarea rows={3} className="input mt-1" value={f.payment_plan} onChange={set('payment_plan')} /></label>
      <label className={L}>Status<select className="input mt-1" value={f.status} onChange={set('status')}><option value="coming_soon">Coming soon (waitlist)</option><option value="open">Open for registration</option></select></label>
      <label className={L}>Order (small numbers first)<input type="number" className="input mt-1" value={f.order} onChange={set('order')} /></label>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.is_published} onChange={set('is_published')} className="h-4 w-4 accent-ink" />Published (visible on the site)</label>
      {err && <p className="text-sm text-red-600 sm:col-span-2" role="alert">{err}</p>}
      <div className="flex gap-3 sm:col-span-2"><button disabled={busy} className="btn-dark !py-2">{busy ? 'Saving…' : 'Save course'}</button><button type="button" onClick={onCancel} className="btn-light !py-2">Cancel</button></div>
    </form>
  )
}

function Courses() {
  const [page, setPage] = useState(1)
  const [d, load] = useList('/admin/courses/', page)
  const [edit, setEdit] = useState(null) // null | {} (new) | course
  const del = async (c) => { if (confirm(`Delete "${c.name}"? Student registrations for it are deleted too.`)) { await api(`/admin/courses/${c.id}/`, { method: 'DELETE' }).catch((e) => alert(e.message)); load() } }
  return (
    <Card title="Courses" extra={<button onClick={() => setEdit({})} className="btn-dark !px-4 !py-2"><Plus size={16} />New course</button>}>
      {edit && <CourseForm course={edit} onCancel={() => setEdit(null)} onSaved={() => { setEdit(null); load() }} />}
      <Table head={['Course', 'Track', 'Price', 'Duration', 'Mode', 'Status', '']} loading={d.loading} error={d.error} empty={!d.loading && !d.error && d.results.length === 0}>
        {d.results.map((c) => (
          <tr key={c.id} className="hover:bg-zinc-50">
            <td className="px-4 py-3 font-medium">{c.name}{!c.is_published && <span className="ml-2 rounded bg-zinc-200 px-1.5 py-0.5 text-[10px] uppercase">Hidden</span>}</td>
            <td className="px-4 py-3">{c.track}</td><td className="px-4 py-3">{c.price == null ? '—' : `KSh ${c.price.toLocaleString()}`}</td>
            <td className="px-4 py-3">{c.duration || '—'}</td><td className="px-4 py-3">{MODES[c.mode]}</td>
            <td className="px-4 py-3">{c.status === 'open' ? 'Open' : 'Coming soon'}</td>
            <td className="whitespace-nowrap px-4 py-3 text-right"><button onClick={() => setEdit(c)} className="mr-3 text-sm font-semibold underline">Edit</button><button onClick={() => del(c)} aria-label="Delete course" className="text-red-600"><Trash2 size={16} /></button></td>
          </tr>
        ))}
      </Table>
      <Pager page={page} setPage={setPage} count={d.count} />
    </Card>
  )
}

const RS = { registered: 'Registered', active: 'In progress', completed: 'Completed', dropped: 'Dropped' }
const PS = { unpaid: 'Unpaid', partial: 'Part paid', paid: 'Paid' }

function Students() {
  const [page, setPage] = useState(1)
  const [d, , setD] = useList('/admin/registrations/', page)
  const [open, setOpen] = useState(null)
  const [f, setF] = useState({})
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const toggle = (r) => { setOpen(open === r.id ? null : r.id); setErr(''); setF({ status: r.status, progress: r.progress, progress_note: r.progress_note, payment_status: r.payment_status, payment_ref: r.payment_ref }) }
  async function save(r) {
    setBusy(true); setErr('')
    try {
      const res = await api(`/admin/registrations/${r.id}/`, { method: 'PATCH', body: { ...f, progress: Number(f.progress) } })
      setD((x) => ({ ...x, results: x.results.map((i) => (i.id === r.id ? res : i)) })); setOpen(null)
    } catch (x) { setErr(x.data ? Object.values(x.data).flat().join(' ') : x.message) } finally { setBusy(false) }
  }
  return (
    <Card title="Students & progress">
      <Table head={['Student', 'Course', 'Status', 'Progress', 'Payment', 'Registered']} loading={d.loading} error={d.error} empty={!d.loading && !d.error && d.results.length === 0}>
        {d.results.flatMap((r) => [
          <tr key={r.id} className="cursor-pointer hover:bg-zinc-50" onClick={() => toggle(r)}>
            <td className="px-4 py-3"><p className="font-semibold">{r.name || '—'}</p><p className="text-xs text-zinc-500">{r.email} {r.phone && `· ${r.phone}`}</p></td>
            <td className="px-4 py-3">{r.course_name}</td><td className="px-4 py-3">{RS[r.status]}</td><td className="px-4 py-3">{r.progress}%</td><td className="px-4 py-3">{PS[r.payment_status]}</td><td className="px-4 py-3 text-zinc-500">{fmt(r.created_at)}</td>
          </tr>,
          open === r.id && (
            <tr key={`${r.id}e`} className="bg-zinc-50"><td colSpan={6} className="px-4 py-5">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <label className="text-sm font-medium">Status<select className="input mt-1" value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}>{Object.entries(RS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
                <label className="text-sm font-medium">Progress (0-100)<input type="number" min="0" max="100" className="input mt-1" value={f.progress} onChange={(e) => setF({ ...f, progress: e.target.value })} /></label>
                <label className="text-sm font-medium">Payment<select className="input mt-1" value={f.payment_status} onChange={(e) => setF({ ...f, payment_status: e.target.value })}>{Object.entries(PS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
                <label className="text-sm font-medium">Payment reference<input className="input mt-1" value={f.payment_ref} onChange={(e) => setF({ ...f, payment_ref: e.target.value })} /></label>
                <label className="text-sm font-medium sm:col-span-2 lg:col-span-4">Note shown to the student<textarea rows={2} className="input mt-1" value={f.progress_note} onChange={(e) => setF({ ...f, progress_note: e.target.value })} /></label>
              </div>
              {err && <p className="mt-3 text-sm text-red-600">{err}</p>}
              <button disabled={busy} onClick={() => save(r)} className="btn-dark mt-4 !py-2">{busy ? 'Saving…' : 'Save'}</button>
            </td></tr>
          ),
        ])}
      </Table>
      <Pager page={page} setPage={setPage} count={d.count} />
    </Card>
  )
}

export default function AdminAcademy({ view }) { return view === 'courses' ? <Courses /> : <Students /> }
~~~~

### `src/pages/AdminPages.jsx`  —  CREATE

~~~~jsx
import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { api } from '../lib/api'
import { DEFAULTS, ICONS } from '../data'
import { mergeContent, clearContentCache } from '../lib/content'
import { fmt, useList, Pager, Table, Card } from './adminKit'

const PAGES = [['home', 'Home'], ['features', 'Features'], ['about', 'About'], ['contact', 'Contact'], ['academy', 'Academy']]
const label = (k) => k.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2')
const blankLike = (v) => (typeof v === 'string' ? '' : typeof v === 'number' ? 0 : Array.isArray(v) ? [] : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, blankLike(x)])) : '')

// Edits any JSON value: text, lists (add / remove rows) and nested groups.
function Node({ k, v, set }) {
  if (typeof v === 'string')
    return (
      <label className="block text-sm font-medium capitalize">{label(k)}
        {k === 'icon' ? <select className="input mt-1" value={v} onChange={(e) => set(e.target.value)}>{Object.keys(ICONS).map((n) => <option key={n}>{n}</option>)}</select>
          : v.length > 70 || /text|p1|p2|blurb|description|rules|plan|instructions/.test(k) ? <textarea rows={3} className="input mt-1 normal-case" value={v} onChange={(e) => set(e.target.value)} />
          : <input className="input mt-1 normal-case" value={v} onChange={(e) => set(e.target.value)} />}
      </label>
    )
  if (typeof v === 'number') return <label className="block text-sm font-medium capitalize">{label(k)}<input type="number" className="input mt-1" value={v} onChange={(e) => set(Number(e.target.value))} /></label>
  if (Array.isArray(v))
    return (
      <fieldset className="rounded-xl border border-zinc-200 p-3">
        <legend className="px-2 text-sm font-bold capitalize">{label(k)}</legend>
        <div className="space-y-3">
          {v.map((item, i) => (
            <div key={i} className="relative rounded-lg bg-zinc-50 p-3 pr-10">
              <button type="button" aria-label="Remove item" onClick={() => set(v.filter((_, n) => n !== i))} className="absolute right-2 top-2 text-red-600"><Trash2 size={16} /></button>
              <Node k={typeof item === 'object' ? `${label(k)} ${i + 1}` : `item ${i + 1}`} v={item} set={(nv) => set(v.map((x, n) => (n === i ? nv : x)))} />
            </div>
          ))}
        </div>
        <button type="button" onClick={() => set([...v, v.length ? blankLike(v[0]) : ''])} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold"><Plus size={14} />Add</button>
      </fieldset>
    )
  if (v && typeof v === 'object')
    return (
      <fieldset className="space-y-3 rounded-xl border border-zinc-200 p-3">
        <legend className="px-2 text-sm font-bold capitalize">{label(k)}</legend>
        {Object.entries(v).map(([ck, cv]) => <Node key={ck} k={ck} v={cv} set={(nv) => set({ ...v, [ck]: nv })} />)}
      </fieldset>
    )
  return null
}

function Pages() {
  const [page, setPage] = useState('home')
  const [data, setData] = useState(null)
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    setData(null); setMsg('')
    api(`/admin/content/${page}/`).then((saved) => setData(mergeContent(DEFAULTS[page], saved))).catch((e) => setMsg(e.message))
  }, [page])

  async function put(body, ok) {
    setBusy(true); setMsg('')
    try { await api(`/admin/content/${page}/`, { method: 'PUT', body }); clearContentCache(); setMsg(ok); return true } catch (e) { setMsg(e.message) } finally { setBusy(false) }
  }
  const save = () => put(data, 'Saved. Refresh the public page to see it.')
  const reset = async () => { if (confirm('Restore this page to the built-in text?') && (await put({}, 'Restored to defaults.'))) setData(DEFAULTS[page]) }

  return (
    <Card title="Edit pages" extra={<select aria-label="Page" value={page} onChange={(e) => setPage(e.target.value)} className="rounded-lg border border-zinc-300 px-3 py-2 text-sm">{PAGES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>}>
      <div className="space-y-4 p-4">
        {!data && !msg && <p className="text-zinc-500">Loading…</p>}
        {data && Object.entries(data).map(([k, v]) => <Node key={k} k={k} v={v} set={(nv) => setData({ ...data, [k]: nv })} />)}
        {page === 'academy' && <p className="text-xs text-zinc-500">The till number is only shown to signed-in students after they register.</p>}
        {data && (
          <div className="sticky bottom-0 flex flex-wrap items-center gap-3 border-t border-zinc-200 bg-white py-3">
            <button disabled={busy} onClick={save} className="btn-dark !py-2">{busy ? 'Saving…' : 'Save changes'}</button>
            <button disabled={busy} onClick={reset} className="btn-light !py-2">Restore defaults</button>
            {msg && <span className="text-sm text-zinc-600" role="status">{msg}</span>}
          </div>
        )}
        {!data && msg && <p className="text-red-600">{msg}</p>}
      </div>
    </Card>
  )
}

function Visitors() {
  const [page, setPage] = useState(1)
  const [d] = useList('/admin/visitors/', page)
  return (
    <Card title="Visitors who accepted cookies">
      <Table head={['Visitor', 'Account', 'Visits', 'Last page', 'First seen', 'Last seen']} loading={d.loading} error={d.error} empty={!d.loading && !d.error && d.results.length === 0}>
        {d.results.map((v) => (
          <tr key={v.id} className="hover:bg-zinc-50">
            <td className="px-4 py-3 font-mono text-xs">{String(v.vid).slice(0, 8)}</td><td className="px-4 py-3">{v.email || 'Anonymous'}</td><td className="px-4 py-3">{v.visits}</td>
            <td className="px-4 py-3">{v.last_path}</td><td className="px-4 py-3 text-zinc-500">{fmt(v.first_seen)}</td><td className="px-4 py-3 text-zinc-500">{fmt(v.last_seen)}</td>
          </tr>
        ))}
      </Table>
      <Pager page={page} setPage={setPage} count={d.count} />
    </Card>
  )
}

export default function AdminPages({ view }) { return view === 'visitors' ? <Visitors /> : <Pages /> }
~~~~

## Verify
`npm run build` must pass. Sign in with an email listed in the backend `ADMIN_EMAILS`, open `/admin` and check the tabs: Overview, Quotes, Users, **Courses** (create / edit / delete, set price, duration, mode, tutor, rules, payment plan, status "Open for registration" or "Coming soon"), **Students** (click a row: set status, progress 0–100, payment, a note the student sees), Waitlist, **Pages** (choose Home / Features / About / Contact / Academy, edit any text, Save; "Restore defaults" clears edits), **Visitors** (people who accepted cookies).

The Academy page's till number and payment instructions are edited under Pages → Academy (`till_number`, `payment_instructions`, `general_rules`).
