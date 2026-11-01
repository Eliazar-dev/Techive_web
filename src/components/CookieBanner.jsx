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
