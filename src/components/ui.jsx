import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

// Fade-in on scroll (no animation library)
export function Reveal({ children, className = '', delay = 0 }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el || !('IntersectionObserver' in window)) return el?.classList.add('in')
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add('in'); io.disconnect() } }, { threshold: 0.12 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return <div ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>
}

// Per-page <title> + description (SPA-friendly; pre-render later for max SEO)
export function useSEO(title, description) {
  useEffect(() => {
    document.title = title ? `${title} | Techive IT Solutions` : 'Techive IT Solutions — Archiving Innovation. Coding the Future.'
    if (description) document.querySelector('meta[name="description"]')?.setAttribute('content', description)
    window.scrollTo(0, 0)
  }, [title, description])
}

export function SectionHead({ eyebrow, title, text, center = true, dark = false }) {
  return (
    <Reveal className={`mb-12 max-w-2xl ${center ? 'mx-auto text-center' : ''}`}>
      {eyebrow && <span className={`eyebrow ${dark ? '!text-zinc-400' : ''}`}>{eyebrow}</span>}
      <h2 className={`mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl ${dark ? 'text-white' : ''}`}>{title}</h2>
      {text && <p className={`mt-4 leading-relaxed ${dark ? 'text-zinc-400' : 'text-zinc-600'}`}>{text}</p>}
    </Reveal>
  )
}

// Dark banner at the top of inner pages (header overlays it)
export function PageHero({ eyebrow, title, text, children }) {
  return (
    <section className="relative overflow-hidden bg-ink pb-20 pt-40 text-white md:pt-48">
      <div className="pointer-events-none absolute inset-0 opacity-[.07]" style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '48px 48px' }} />
      <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand-violet/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 left-1/4 h-80 w-80 rounded-full bg-brand-cyan/15 blur-3xl" />
      <div className="container-x relative">
        <div className="max-w-3xl animate-fade-up">
          {eyebrow && <span className="eyebrow !text-zinc-400">{eyebrow}</span>}
          <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl">{title}</h1>
          {text && <p className="mt-5 max-w-2xl text-lg leading-relaxed text-zinc-300">{text}</p>}
          {children}
        </div>
      </div>
    </section>
  )
}

export function CTA({ title = 'Ready to build something useful?', text = 'Tell us about your idea. We will reply within one business day.' }) {
  return (
    <section className="bg-zinc-100 py-20">
      <div className="container-x">
        <Reveal className="relative overflow-hidden rounded-3xl bg-ink px-8 py-14 text-center text-white sm:px-16">
          <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-brand-cyan/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-brand-violet/25 blur-3xl" />
          <h2 className="relative text-3xl font-extrabold sm:text-4xl">{title}</h2>
          <p className="relative mx-auto mt-4 max-w-xl text-zinc-300">{text}</p>
          <Link to="/quote" className="btn-grad relative mt-8">Get a Quote <ArrowRight size={18} /></Link>
        </Reveal>
      </div>
    </section>
  )
}

// Round profile picture; falls back to the first letter of the name/email.
export function Avatar({ user, size = 36, className = '' }) {
  const letter = (user?.first_name || user?.email || '?')[0].toUpperCase()
  return user?.avatar_url ? (
    <img src={user.avatar_url} alt="" referrerPolicy="no-referrer" width={size} height={size} style={{ width: size, height: size }} className={`rounded-full object-cover ${className}`} />
  ) : (
    <span style={{ width: size, height: size }} className={`flex items-center justify-center rounded-full bg-brand-grad font-bold text-white ${className}`}>{letter}</span>
  )
}
