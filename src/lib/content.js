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
