import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronLeft, ChevronRight, GraduationCap } from 'lucide-react'
import { useContent } from '../lib/content'

const INTERVAL = 8000 // ms per slide

export default function HeroCarousel() {
  const { slides, academyPromo } = useContent('home')
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  const [failed, setFailed] = useState({})
  const n = slides.length
  const go = useCallback((k) => setI((k + n) % n), [n])

  // auto-advance; restarts whenever the slide changes (manual or automatic)
  useEffect(() => {
    if (paused || n < 2) return
    const t = setTimeout(() => go(i + 1), INTERVAL)
    return () => clearTimeout(t)
  }, [i, paused, go, n])

  const s = slides[i % n]

  return (
    <section
      className="relative isolate h-[100svh] min-h-[640px] max-h-[900px] overflow-hidden bg-ink text-white"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel" aria-label="Featured"
    >
      {/* Only the active slide's video is mounted → fast load, low bandwidth */}
      <div key={i} className="absolute inset-0 -z-10">
        {failed[i] ? (
          <div className="h-full w-full bg-gradient-to-br from-zinc-800 via-ink to-zinc-900" />
        ) : (
          <video
            key={s.video} src={s.video} autoPlay muted loop playsInline preload={i === 0 ? 'auto' : 'metadata'}
            onError={() => setFailed((f) => ({ ...f, [i]: true }))}
            className="h-full w-full object-cover animate-fade-in"
          />
        )}
      </div>

      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink/85 via-ink/45 to-transparent" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/70 via-transparent to-ink/40" />

      <div className="container-x flex h-full items-center">
        <div key={`t${i}`} className="max-w-2xl pt-20 animate-fade-up">
          <div className="mb-6 h-1 w-24 rounded bg-brand-grad" />
          <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">{s.title1}<br />{s.title2}</h1>
          <p className="mt-5 text-base text-white/90 sm:mt-6 sm:text-xl">{s.sub}</p>
          <p className="mt-3 text-sm font-medium text-white/80 sm:mt-4 sm:text-xl">{s.tags}</p>
          <div className="mt-8 flex flex-wrap items-center gap-4 sm:mt-9">
            <Link to="/quote" className="btn-grad !px-7 !py-4">Get a Quote <ArrowRight size={18} /></Link>
          </div>
          {/* Academy promo (left) */}
          <Link to="/academy" className="mt-5 inline-flex max-w-full items-center gap-3 rounded-2xl border border-white/25 bg-white/10 py-2.5 pl-3 pr-4 backdrop-blur-md transition hover:bg-white/20 sm:mt-7">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-grad"><GraduationCap size={22} /></span>
            <span className="min-w-0 text-left">
              <span className="block text-[11px] font-bold uppercase tracking-[.2em] text-brand-cyan">{academyPromo.badge} · Academy</span>
              <span className="block truncate font-display text-sm font-semibold sm:text-base">{academyPromo.text}</span>
            </span>
            <ArrowRight size={18} className="shrink-0" />
          </Link>
        </div>
      </div>

      <button onClick={() => go(i - 1)} aria-label="Previous slide" className="absolute left-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-black/40 p-3 backdrop-blur transition hover:bg-black/70 sm:block"><ChevronLeft size={24} /></button>
      <button onClick={() => go(i + 1)} aria-label="Next slide" className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-black/40 p-3 backdrop-blur transition hover:bg-black/70 sm:block"><ChevronRight size={24} /></button>

      <div className="absolute inset-x-0 bottom-6 flex justify-center gap-3 sm:bottom-8">
        {slides.map((_, k) => (
          <button key={k} onClick={() => go(k)} aria-label={`Go to slide ${k + 1}`} aria-current={k === i}
            className={`h-3 rounded-full transition-all ${k === i ? 'w-8 bg-brand-cyan' : 'w-3 bg-white/50 hover:bg-white'}`} />
        ))}
      </div>
    </section>
  )
}
