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
