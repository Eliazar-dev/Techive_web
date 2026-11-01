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
