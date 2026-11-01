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
