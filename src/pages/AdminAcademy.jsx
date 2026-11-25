import { useState, useEffect, Fragment } from 'react'
import { Plus, Trash2, Download } from 'lucide-react'
import { api } from '../lib/api'
import { fmt, useList, Pager, Table, Card, errText } from './adminKit'

const MODES = { online: 'Online', physical: 'Physical', hybrid: 'Hybrid' }
const BLANK = { name: '', slug: '', track: 'Building with AI', description: '', duration: '', mode: 'online', price: '', certificate_fee: '', referral_reward: '', quiz_pass_mark: '', quiz_max_attempts: '', quiz_time_limit: '', project_title: '', project_brief: '', project_requirements: '', tutor: '', rules: '', payment_plan: '', status: 'coming_soon', is_published: true, order: 0, next_course: '' }

function CourseForm({ course, onSaved, onCancel }) {
  const [f, setF] = useState({ ...BLANK, ...course, price: course?.price ?? '', project_requirements: Array.isArray(course?.project_requirements) ? course.project_requirements.join('\n') : (course?.project_requirements || '') })
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })
  async function save(e) {
    e.preventDefault(); setBusy(true); setErr('')
    const body = { ...f, price: f.price === '' ? null : Number(f.price), certificate_fee: f.certificate_fee === '' ? null : Number(f.certificate_fee), referral_reward: f.referral_reward === '' ? null : Number(f.referral_reward), quiz_pass_mark: f.quiz_pass_mark === '' ? null : Number(f.quiz_pass_mark), quiz_max_attempts: f.quiz_max_attempts === '' ? null : Number(f.quiz_max_attempts), quiz_time_limit: f.quiz_time_limit === '' ? null : Number(f.quiz_time_limit), order: Number(f.order) || 0, next_course: f.next_course || null, project_requirements: (f.project_requirements || '').split('\n').map((s) => s.trim()).filter(Boolean) }
    try { await api(course?.id ? `/admin/courses/${course.id}/` : '/admin/courses/', { method: course?.id ? 'PATCH' : 'POST', body }); onSaved() }
    catch (x) { setErr(errText(x)); setBusy(false) }
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
      <label className={L}>Certificate fee (KSh)<input type="number" min="0" className="input mt-1" value={f.certificate_fee} onChange={set('certificate_fee')} /></label>
      <label className={L}>Referral reward (KSh)<input type="number" min="0" className="input mt-1" value={f.referral_reward} onChange={set('referral_reward')} /></label>
      <label className={L}>Quiz pass mark (%)<input type="number" min="0" max="100" className="input mt-1" value={f.quiz_pass_mark} onChange={set('quiz_pass_mark')} /></label>
      <label className={L}>Quiz max attempts (blank = unlimited)<input type="number" min="1" className="input mt-1" value={f.quiz_max_attempts} onChange={set('quiz_max_attempts')} /></label>
      <label className={L}>Quiz time limit (minutes, blank = none)<input type="number" min="1" className="input mt-1" value={f.quiz_time_limit} onChange={set('quiz_time_limit')} /></label>
      <label className={L}>Next course (optional)<input className="input mt-1" value={f.next_course} onChange={set('next_course')} placeholder="Course slug" /></label>
      <label className={L}>Project title<input className="input mt-1" value={f.project_title} onChange={set('project_title')} placeholder="e.g. Build a Python CLI program" /></label>
      <label className={`${L} sm:col-span-2`}>Project instructions (shown after course completion)<textarea rows={4} className="input mt-1" value={f.project_brief} onChange={set('project_brief')} placeholder="Describe what students should build, ideas to choose from, and how to submit." /></label>
      <label className={`${L} sm:col-span-2`}>Project requirements checklist (one per line)<textarea rows={4} className="input mt-1" value={f.project_requirements} onChange={set('project_requirements')} placeholder={'Runs without errors\nIncludes comments\nHandles wrong input'} /></label>
      <label className={`${L} sm:col-span-2`}>Slug (for URL, auto-generated if blank)<input className="input mt-1" value={f.slug} onChange={set('slug')} /></label>
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
  const [edit, setEdit] = useState(null)
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
  const [d, load] = useList('/admin/registrations/', page)
  const [busy, setBusy] = useState(false)
  const delRow = async (r) => { if (!confirm(`Delete ${r.name || r.email}'s registration?`)) return; setBusy(true); try { await api(`/admin/registrations/${r.id}/delete/`, { method: 'DELETE' }); load() } catch (e) { alert(e.data?.detail || e.message) } finally { setBusy(false) } }
  return (
    <Card title="Students">
      <Table head={['Student', 'Course', 'Status', 'Progress', 'Payment', 'Registered', '']} loading={d.loading} error={d.error} empty={!d.loading && !d.error && d.results.length === 0}>
        {d.results.map((r) => (
          <tr key={r.id} className="hover:bg-zinc-50">
            <td className="px-4 py-3"><p className="font-semibold">{r.name || '—'}</p><p className="text-xs text-zinc-500">{r.email} {r.phone && `· ${r.phone}`}</p></td>
            <td className="px-4 py-3">{r.course_name}</td><td className="px-4 py-3">{RS[r.status]}</td><td className="px-4 py-3">{r.progress}%</td><td className="px-4 py-3">{PS[r.payment_status]}</td><td className="px-4 py-3 text-zinc-500">{fmt(r.created_at)}</td>
            <td className="whitespace-nowrap px-4 py-3 text-right"><button onClick={() => delRow(r)} disabled={busy} className="text-red-600"><Trash2 size={16} /></button></td>
          </tr>
        ))}
      </Table>
      <Pager page={page} setPage={setPage} count={d.count} />
    </Card>
  )
}

const PAY_STATUS = { pending: 'Pending', success: 'Paid', failed: 'Failed' }
const PAY_STATUS_CLS = { pending: 'bg-amber-100 text-amber-700', success: 'bg-emerald-100 text-emerald-700', failed: 'bg-red-100 text-red-700' }

function Payments() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState(() => localStorage.getItem('adminPaymentsStatus') || '')
  const [d, load] = useList('/admin/payments/', page, status ? `&status=${status}` : '')
  useEffect(() => { localStorage.setItem('adminPaymentsStatus', status); setPage(1) }, [status])
  const clear = () => { setStatus(''); setPage(1) }
  const del = async (p) => { if (confirm(`Delete payment ${p.reference} (KSh ${p.amount}, ${p.status})? This cannot be undone.`)) { await api(`/admin/payments/${p.id}/`, { method: 'DELETE' }).catch((e) => alert(e.message)); load() } }
  const downloadCSV = async () => { const t = api.tokens.get(); const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/payments/export/`, { headers: { Authorization: `Bearer ${t.access}` } }); if (!res.ok) { alert('Download failed'); return }; const blob = await res.blob(); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `payments-${new Date().toISOString().split('T')[0]}.csv`; a.click(); URL.revokeObjectURL(url) }
  return (
    <Card title="Payments" extra={
      <div className="flex items-center gap-2">
        <select className="input !w-auto !py-1.5 text-sm" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
          <option value="">All statuses</option>
          {Object.entries(PAY_STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        {status && <button onClick={clear} className="btn-light !px-3 !py-1.5 text-sm">Clear</button>}
        <button onClick={downloadCSV} className="btn-light !py-2"><Download size={16} className="mr-2" />CSV</button>
      </div>}>
      <Table head={['Date', 'Student', 'Course', 'Purpose', 'Amount', 'Currency', 'Status', 'Reference', '']} loading={d.loading} error={d.error} empty={!d.loading && !d.error && d.results.length === 0}>
        {d.results.map(p => <tr key={p.id} className="hover:bg-zinc-50"><td className="px-4 py-3 text-zinc-500">{fmt(p.created_at)}</td><td className="px-4 py-3 font-medium">{p.email}</td><td className="px-4 py-3">{p.course_name}</td><td className="px-4 py-3">{p.purpose}</td><td className="px-4 py-3">KSh {p.amount.toLocaleString()}</td><td className="px-4 py-3">{p.currency}</td><td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${PAY_STATUS_CLS[p.status] || ''}`}>{PAY_STATUS[p.status] || p.status}</span></td><td className="px-4 py-3 text-zinc-500">{p.reference}</td><td className="whitespace-nowrap px-4 py-3 text-right"><button onClick={() => del(p)} className="text-red-600"><Trash2 size={16} /></button></td></tr>)}
      </Table>
      <Pager page={page} setPage={setPage} count={d.count} />
    </Card>
  )
}

function Sessions() {
  const [page, setPage] = useState(1)
  const [showArchived, setShowArchived] = useState(false)
  const [d, load] = useList('/admin/sessions/', page, showArchived ? '&archived=1' : '')
  const [courses, setCourses] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [f, setF] = useState({})
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [openAtt, setOpenAtt] = useState(null)
  const [att, setAtt] = useState({})
  useEffect(() => { api('/admin/courses/').then((r) => setCourses(Array.isArray(r) ? r : r.results || [])).catch(() => setCourses([])) }, [])
  const add = async () => { setBusy(true); setErr(''); try { await api('/admin/sessions/', { method: 'POST', body: { ...f, starts_at: f.starts_at ? new Date(f.starts_at).toISOString() : null } }); setShowForm(false); setF({}); load() } catch (x) { setErr(errText(x)); setBusy(false) } }
  const del = async (s) => { if (confirm(`Archive session "${s.title}"? It will be hidden from this list but attendance records are kept.`)) { await api(`/admin/sessions/${s.id}/`, { method: 'DELETE' }).catch((e) => alert(e.message)); load() } }
  const copyLink = (url) => { navigator.clipboard.writeText(url); alert('Check-in link copied!') }
  const toggleAtt = (id) => {
    if (openAtt === id) { setOpenAtt(null); return }
    setOpenAtt(id)
    if (!att[id]) {
      setAtt((a) => ({ ...a, [id]: { loading: true, items: [], error: '' } }))
      api(`/admin/attendance/?session=${id}`).then((r) => setAtt((a) => ({ ...a, [id]: { loading: false, items: Array.isArray(r) ? r : r.results || [], error: '' } }))).catch((e) => setAtt((a) => ({ ...a, [id]: { loading: false, items: [], error: errText(e) } })))
    }
  }
  const verify = async (a) => { await api(`/admin/attendance/${a.id}/`, { method: 'PATCH', body: { verified: true } }).catch((e) => alert(e.message)); setAtt((x) => ({ ...x, [openAtt]: { ...x[openAtt], items: x[openAtt].items.map((i) => i.id === a.id ? { ...i, verified: true } : i) } })) }
  const uploadNotes = async (s, file) => {
    if (!file) return
    const data = await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(',')[1]); r.onerror = rej; r.readAsDataURL(file) })
    try { await api(`/admin/sessions/${s.id}/notes-pdf/`, { method: 'POST', body: { name: file.name, data } }); load() } catch (e) { alert(e.message) }
  }
  const delNotes = async (s) => { if (confirm('Remove the notes PDF for this session?')) { await api(`/admin/sessions/${s.id}/notes-pdf/`, { method: 'DELETE' }).catch((e) => alert(e.message)); load() } }
  const toggleHide = async (s) => { await api(`/admin/sessions/${s.id}/`, { method: 'PATCH', body: { hidden: !s.hidden } }).catch((e) => alert(e.message)); load() }
  return (
    <Card title="Live Sessions" extra={<div className="flex items-center gap-3"><label className="flex items-center gap-1.5 text-sm text-zinc-600"><input type="checkbox" checked={showArchived} onChange={(e) => { setShowArchived(e.target.checked); setPage(1) }} className="h-4 w-4 accent-ink" />Archived</label><button onClick={() => setShowForm(!showForm)} className="btn-dark !px-4 !py-2"><Plus size={16} />New session</button></div>}>
      {showForm && (
        <div className="border-b border-zinc-200 bg-zinc-50 p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium">Course<select className="input mt-1" value={f.course || ''} onChange={(e) => setF({ ...f, course: e.target.value })}><option value="">Select course</option>{courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
            <label className="text-sm font-medium">Title<input className="input mt-1" value={f.title || ''} onChange={(e) => setF({ ...f, title: e.target.value })} /></label>
            <label className="text-sm font-medium">Date & Time<input type="datetime-local" className="input mt-1" value={f.starts_at || ''} onChange={(e) => setF({ ...f, starts_at: e.target.value })} /></label>
            <label className="text-sm font-medium">Meet URL<input className="input mt-1" value={f.meet_url || ''} onChange={(e) => setF({ ...f, meet_url: e.target.value })} /></label>
            <label className="text-sm font-medium sm:col-span-2">Notes<input className="input mt-1" value={f.notes || ''} onChange={(e) => setF({ ...f, notes: e.target.value })} /></label>
          </div>
          {err && <p className="mt-3 text-sm text-red-600">{err}</p>}
          <button onClick={add} disabled={busy} className="btn-dark mt-4 !py-2">{busy ? 'Saving…' : 'Create session'}</button>
        </div>
      )}
      <Table head={['Session', 'Course', 'Date', 'Attendance', 'Check-in Link', '']} loading={d.loading} error={d.error} empty={!d.loading && !d.error && d.results.length === 0}>
        {d.results.map(s => (
          <Fragment key={s.id}>
            <tr className="hover:bg-zinc-50">
              <td className="px-4 py-3 font-medium">{s.title}{s.archived && <span className="ml-2 rounded bg-zinc-200 px-1.5 py-0.5 text-[10px] uppercase">Archived</span>}{s.hidden && <span className="ml-2 rounded bg-violet-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-violet-700">Hidden</span>}</td>
              <td className="px-4 py-3">{s.course_name}</td>
              <td className="px-4 py-3 text-zinc-500">{fmt(s.starts_at)}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-24 overflow-hidden rounded-full bg-zinc-200" title={`${s.verified_count} verified`}><div className={`h-full rounded-full ${s.attendance_pct >= 80 ? 'bg-emerald-500' : s.attendance_pct >= 50 ? 'bg-amber-400' : 'bg-red-400'}`} style={{ width: `${s.attendance_pct}%` }} /></div>
                  <span className="whitespace-nowrap text-xs text-zinc-500">{s.verified_count} verified · {s.attendance_count} checked in · {s.attendance_pct}%</span>
                </div>
                {s.attendance_count > 0 && <button onClick={() => toggleAtt(s.id)} className="mt-1 text-sm font-semibold text-brand-cyan underline">{openAtt === s.id ? 'Hide' : 'View'}</button>}
              </td>
              <td className="px-4 py-3"><button onClick={() => copyLink(s.checkin_url)} className="text-sm font-semibold underline">Copy link</button></td>
              <td className="whitespace-nowrap px-4 py-3">
                <div className="flex items-center justify-end gap-2">
                  <button onClick={() => toggleHide(s)} className={`rounded-full px-2.5 py-1 text-xs font-bold ${s.hidden ? 'bg-violet-100 text-violet-700 hover:bg-violet-200' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`} title={s.hidden ? 'Hidden from students — click to show' : 'Visible to students — click to hide'}>{s.hidden ? 'Show' : 'Hide'}</button>
                  {s.has_notes_pdf
                    ? <button onClick={() => delNotes(s)} className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-200" title="Notes PDF uploaded — click to remove">PDF ✓</button>
                    : <label className="cursor-pointer rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-bold text-zinc-600 hover:bg-zinc-200">+ PDF<input type="file" accept="application/pdf" className="hidden" onChange={(e) => uploadNotes(s, e.target.files[0])} /></label>}
                  <button onClick={() => del(s)} className="text-red-600"><Trash2 size={16} /></button>
                </div>
              </td>
            </tr>
            {openAtt === s.id && (
              <tr><td colSpan={6} className="bg-zinc-50 px-4 py-3">
                {att[s.id]?.loading && <p className="text-sm text-zinc-500">Loading…</p>}
                {att[s.id]?.error && <p className="text-sm text-red-600">{att[s.id].error}</p>}
                {att[s.id] && !att[s.id].loading && !att[s.id].error && (att[s.id].items.length === 0
                  ? <p className="text-sm text-zinc-500">No one has checked in yet.</p>
                  : <ul className="divide-y divide-zinc-200 text-sm">{att[s.id].items.map(a => (
                      <li key={a.id} className="flex items-center justify-between py-2">
                        <span><span className="font-medium">{a.name || a.email}</span> <span className="text-zinc-500">{a.email} · {fmt(a.checked_in_at)}</span></span>
                        {a.verified
                          ? <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700">Verified</span>
                          : <button onClick={() => verify(a)} className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-700 hover:bg-amber-200">Verify</button>}
                      </li>
                    ))}</ul>)}
              </td></tr>
            )}
          </Fragment>
        ))}
      </Table>
      <Pager page={page} setPage={setPage} count={d.count} />
    </Card>
  )
}

function QuizAttempts() {
  const [page, setPage] = useState(1)
  const [d, load] = useList('/admin/quiz-attempts/', page)
  const del = async (q) => { if (confirm(`Delete this quiz attempt (${q.score}%)?`)) { await api(`/admin/quiz-attempts/${q.id}/`, { method: 'DELETE' }).catch((e) => alert(e.message)); load() } }
  return (
    <Card title="Quiz Attempts">
      <Table head={['Student', 'Course', 'Score', 'Result', 'Date', '']} loading={d.loading} error={d.error} empty={!d.loading && !d.error && d.results.length === 0}>
        {d.results.map(q => (
          <tr key={q.id} className="hover:bg-zinc-50">
            <td className="px-4 py-3"><p className="font-semibold">{q.name}</p><p className="text-xs text-zinc-500">{q.email}</p></td>
            <td className="px-4 py-3">{q.course_name}</td>
            <td className="px-4 py-3">{q.score}%</td>
            <td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${q.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{q.passed ? 'Passed' : 'Failed'}</span></td>
            <td className="px-4 py-3 text-zinc-500">{fmt(q.created_at)}</td>
            <td className="whitespace-nowrap px-4 py-3 text-right"><button onClick={() => del(q)} className="text-red-600"><Trash2 size={16} /></button></td>
          </tr>
        ))}
      </Table>
      <Pager page={page} setPage={setPage} count={d.count} />
    </Card>
  )
}

export default function AdminAcademy({ view }) { return view === 'courses' ? <Courses /> : view === 'payments' ? <Payments /> : view === 'quiz' ? <QuizAttempts /> : view === 'sessions' ? <Sessions /> : <Students /> }
