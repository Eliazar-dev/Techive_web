import { Link } from 'react-router-dom'
import { ArrowRight, Check } from 'lucide-react'
import HeroCarousel from '../components/HeroCarousel'
import { Reveal, SectionHead, CTA, useSEO } from '../components/ui'
import { audiences, ICONS } from '../data'
import { useContent } from '../lib/content'

export default function Home() {
  useSEO('', 'Techive IT Solutions: websites, apps, custom business systems, payment integration, analytics and SEO for businesses, institutions, ministries and entrepreneurs.')
  const home = useContent('home')
  const { services, solutions, process } = useContent('features')
  const { values } = useContent('about')
  return (
    <>
      <HeroCarousel />

      {/* Services: 2 across on phones, compact cards */}
      <section className="bg-zinc-50 py-16 sm:py-24">
        <div className="container-x">
          <SectionHead eyebrow={home.services.eyebrow} title={home.services.title} text={home.services.text} />
          <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
            {services.map(({ icon, title, blurb, image }, n) => {
              const Icon = ICONS[icon] || ICONS.Globe
              return (
                <Reveal key={title} delay={(n % 3) * 80}>
                  <Link to="/features" className="card group block h-full !p-4 sm:!p-6">
                    {image ? (
                      <img src={image} alt={title} loading="lazy" width="400" height="300" className="mb-3 aspect-[4/3] w-full rounded-xl object-cover sm:mb-5" />
                    ) : (
                      <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-ink text-white transition group-hover:bg-brand-grad sm:mb-5 sm:h-12 sm:w-12"><Icon size={20} /></span>
                    )}
                    <h3 className="text-sm font-bold leading-snug sm:text-lg">{title}</h3>
                    <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-zinc-600 sm:mt-2 sm:line-clamp-none sm:text-sm">{blurb}</p>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold sm:mt-5 sm:text-sm">Learn more <ArrowRight size={14} className="transition group-hover:translate-x-1" /></span>
                  </Link>
                </Reveal>
              )
            })}
            <Reveal delay={160}>
              <Link to="/quote" className="flex h-full min-h-[150px] flex-col justify-between rounded-2xl bg-ink p-4 text-white transition hover:-translate-y-1 sm:min-h-[220px] sm:p-6">
                <h3 className="text-sm font-bold sm:text-xl">Have something specific in mind?</h3>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-brand-cyan">Get a quote <ArrowRight size={16} /></span>
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="border-y border-zinc-200 bg-white py-10">
        <div className="container-x flex flex-wrap items-center justify-center gap-x-12 gap-y-4 text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-zinc-500">Built for</span>
          {audiences.map((a) => <span key={a} className="font-display text-xl font-extrabold text-zinc-800">{a}</span>)}
        </div>
      </section>

      <section className="bg-zinc-100 py-16 sm:py-24">
        <div className="container-x">
          <SectionHead eyebrow={home.solutionsIntro.eyebrow} title={home.solutionsIntro.title} text={home.solutionsIntro.text} />
          <div className="grid gap-6 md:grid-cols-2">
            {solutions.slice(0, 2).map((s) => (
              <Reveal key={s.title}>
                <div className="card h-full">
                  <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">{s.tag}</span>
                  <h3 className="mt-2 text-2xl font-bold">{s.title}</h3>
                  <p className="mt-3 text-zinc-600">{s.blurb}</p>
                  <ul className="mt-5 space-y-2 text-sm">{s.features.map((f) => <li key={f} className="flex gap-2"><Check size={18} className="text-brand-blue" />{f}</li>)}</ul>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="mt-10 text-center"><Link to="/features" className="btn-dark">View all features <ArrowRight size={18} /></Link></div>
        </div>
      </section>

      <section className="bg-ink py-16 text-white sm:py-24">
        <div className="container-x">
          <SectionHead dark eyebrow={home.why.eyebrow} title={home.why.title} text={home.why.text} />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v, n) => (
              <Reveal key={v.title} delay={n * 80}>
                <div className="h-full rounded-2xl border border-white/10 bg-white/[.04] p-6">
                  <h3 className="text-lg font-bold">{v.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">{v.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="mt-16 grid gap-8 border-t border-white/10 pt-12 sm:grid-cols-2 lg:grid-cols-4">
            {process.map((p) => (
              <Reveal key={p.n}>
                <span className="bg-brand-grad bg-clip-text text-4xl font-extrabold text-transparent">{p.n}</span>
                <h3 className="mt-2 text-lg font-bold">{p.title}</h3>
                <p className="mt-1 text-sm text-zinc-400">{p.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CTA />
    </>
  )
}
