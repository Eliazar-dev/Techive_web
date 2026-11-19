import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, Mail, Phone, X, Send, ArrowRight } from 'lucide-react'

const WHATSAPP = 'https://wa.me/254740492907?text=' + encodeURIComponent('Hi Techive! I would like to talk about a project.')
const EMAIL = 'techiveitsolutions.com@gmail.com'
const PHONE = '+254740492907'

// Little speech bubble that pops above a floater.
function Pop({ text, tail = 'right', bg = 'bg-ink' }) {
  return (
    <div className={`pointer-events-none absolute bottom-full mb-3 animate-pop ${tail === 'right' ? 'right-0' : 'left-0'}`}>
      <div className={`relative whitespace-nowrap rounded-2xl ${bg} px-4 py-2 text-xs font-bold text-white shadow-xl`}>
        {text}
        <span className={`absolute -bottom-1.5 h-3 w-3 rotate-45 ${bg} ${tail === 'right' ? 'right-6' : 'left-6'}`} />
      </div>
    </div>
  )
}

// Round glowing button with ping ring + heartbeat.
function GlowButton({ href, label, ring, children, onClick }) {
  const cls = 'relative flex h-14 w-14 animate-heartbeat items-center justify-center rounded-full text-white shadow-2xl transition hover:scale-110'
  const ringCls = `absolute inset-0 animate-ping rounded-full ${ring}`
  const inner = <><span className={ringCls} aria-hidden /><span className="relative z-10">{children}</span></>
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className={`${cls} ${ring.replace('/40', '')}`}>{inner}</a>
  ) : (
    <button onClick={onClick} aria-label={label} className={`${cls} bg-ink`}>{inner}</button>
  )
}

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
      <div className="fixed bottom-5 right-5 z-40">
        <Pop text="Chat with us on WhatsApp!" tail="right" bg="bg-[#128C4B]" />
        <GlowButton href={WHATSAPP} label="Chat on WhatsApp" ring="bg-[#25D366]/40">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg"><MessageCircle size={26} /></span>
        </GlowButton>
      </div>

      {/* Techive Buddy — bottom left */}
      <div className="fixed bottom-5 left-5 z-40 flex flex-col items-start">
        {!open && <Pop text="Need help? Talk to Techive Buddy" tail="left" />}
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
        <GlowButton onClick={buddy} label="Chat with Techive Buddy" ring="bg-white/40">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-ink shadow-lg">{open ? <X size={24} /> : <Send size={22} className="-rotate-12" />}</span>
        </GlowButton>
      </div>
    </>
  )
}
