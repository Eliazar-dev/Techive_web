import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, Mail, Phone, X, Send, ArrowRight } from 'lucide-react'

const WHATSAPP = 'https://wa.me/254740492907?text=' + encodeURIComponent('Hi Techive! I would like to talk about a project.')
const EMAIL = 'techiveitsolutions.com@gmail.com'
const PHONE = '+254740492907'

// WhatsApp bubble bottom-right, Techive Buddy (Tidio) bubble bottom-left.
export default function Floaters() {
  const [open, setOpen] = useState(false)

  // Hide Tidio's own bubble once it loads — our branded bubble opens it instead.
  useEffect(() => {
    let tries = 0
    const t = setInterval(() => {
      const api = window.tidioChatApi
      if (api && typeof api.hide === 'function') {
        api.hide()
        if (typeof api.on === 'function') api.on('close', () => api.hide())
        clearInterval(t)
      } else if (++tries > 60) clearInterval(t)
    }, 500)
    return () => clearInterval(t)
  }, [])

  const buddy = () => {
    const api = window.tidioChatApi
    if (api && typeof api.open === 'function') {
      if (typeof api.show === 'function') api.show()
      api.open()
      setOpen(false)
    } else {
      setOpen(!open) // Tidio not loaded yet — show contact panel instead
    }
  }

  return (
    <>
      {/* WhatsApp — bottom right */}
      <a
        href={WHATSAPP}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-2xl transition hover:scale-105 hover:shadow-[#25D366]/40"
      >
        <MessageCircle size={26} />
      </a>

      {/* Techive Buddy — bottom left */}
      <div className="fixed bottom-5 left-5 z-40 flex flex-col items-start">
        {!open && (
          <span className="mb-2 rounded-full bg-ink px-3 py-1 text-xs font-semibold text-white shadow-lg">Techive Buddy</span>
        )}
        {open && (
          <div className="mb-3 w-72 animate-pop overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl">
            <div className="bg-ink px-4 py-3 text-white">
              <p className="font-display text-sm font-bold">Chat with Techive</p>
              <p className="text-xs text-zinc-400">We usually reply within one business day.</p>
            </div>
            <div className="space-y-1 p-2">
              <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-zinc-50">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#25D366]/15 text-[#128C4B]"><MessageCircle size={18} /></span>
                WhatsApp us
              </a>
              <a href={`mailto:${EMAIL}`} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-zinc-50">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-600"><Mail size={18} /></span>
                Email us
              </a>
              <a href={`tel:${PHONE.replace(/\s/g, '')}`} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-zinc-50">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-600"><Phone size={18} /></span>
                Call us
              </a>
              <Link to="/quote" onClick={() => setOpen(false)} className="flex items-center justify-between rounded-xl bg-zinc-50 px-3 py-2.5 text-sm font-semibold hover:bg-zinc-100">
                Get a detailed quote <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        )}
        <button
          onClick={buddy}
          aria-label="Chat with Techive Buddy"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-ink text-white shadow-2xl transition hover:scale-105"
        >
          {open ? <X size={24} /> : <Send size={22} className="-rotate-12" />}
        </button>
      </div>
    </>
  )
}
