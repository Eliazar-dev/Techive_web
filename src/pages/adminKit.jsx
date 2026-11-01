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
