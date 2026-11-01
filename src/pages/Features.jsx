import { Check, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHero, Reveal, SectionHead, CTA, useSEO } from '../components/ui'
import { ICONS } from '../data'
import { useContent } from '../lib/content'

export default function Features() {
  useSEO('Features', 'Web development, apps, custom business systems, payment integration, analytics, SEO and ready-to-deploy platforms from Techive.')
  const { hero, services, solutions, process } = useContent('features')
  return (
    <>
      <PageHero eyebrow={hero.eyebrow} title={hero.title} text={hero.text} />

      <section className="bg-zinc-50 py-16 sm:py-24">
        <div className="container-x space-y-6">
          {services.map(({ icon, title, blurb, points, image }, n) => {
            const Icon = ICONS[icon] || ICONS.Globe
            return (
              <Reveal key={title}>
                <div className={`grid items-center gap-8 rounded-3xl border border-zinc-200 p-6 md:grid-cols-5 md:p-10 ${n % 2 ? 'bg-zinc-100' : 'bg-white'}`}>
                  <div className="md:col-span-3">
                    {image ? (
                      <img src={image} alt={title} loading="lazy" width="600" height="400" className="mb-4 h-44 w-full rounded-2xl object-cover" />
                    ) : (
                      <span className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-ink text-white"><Icon size={26} /></span>
                    )}
                    <h2 className="text-2xl font-extrabold">{title}</h2>
                    <p className="mt-3 max-w-xl leading-relaxed text-zinc-600">{blurb}</p>
                  </div>
                  <ul className="space-y-3 md:col-span-2">
                    {points.map((p) => <li key={p} className="flex gap-3 font-medium"><Check size={20} className="mt-0.5 shrink-0 text-brand-blue" />{p}</li>)}
                  </ul>
                </div>
              </Reveal>
            )
          })}
        </div>
      </section>

      <section className="bg-zinc-100 py-16 sm:py-24">
        <div className="container-x">
          <SectionHead eyebrow="Ready-to-deploy" title="Solutions built for real needs" text="Proven systems we tailor to your organization." />
          <div className="grid gap-6 md:grid-cols-2">
            {solutions.map((s, n) => (
              <Reveal key={s.title} delay={(n % 2) * 100}>
                <article className="card flex h-full flex-col">
                  <span className="w-fit rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold uppercase tracking-widest text-zinc-600">{s.tag}</span>
                  <h3 className="mt-4 text-2xl font-extrabold">{s.title}</h3>
                  <p className="mt-3 text-zinc-600">{s.blurb}</p>
                  <ul className="my-6 space-y-2 text-sm">{s.features.map((f) => <li key={f} className="flex gap-2"><Check size={18} className="text-brand-blue" />{f}</li>)}</ul>
                  <Link to="/quote" className="mt-auto inline-flex items-center gap-2 font-semibold">Request a quote <ArrowRight size={16} /></Link>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ink py-16 text-white sm:py-24">
        <div className="container-x">
          <SectionHead dark eyebrow="How we work" title="A simple, transparent process" />
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {process.map((p) => (
              <Reveal key={p.n}><span className="bg-brand-grad bg-clip-text text-5xl font-extrabold text-transparent">{p.n}</span>
                <h3 className="mt-2 text-xl font-bold">{p.title}</h3><p className="mt-2 text-zinc-400">{p.text}</p></Reveal>
            ))}
          </div>
        </div>
      </section>
      <CTA />
    </>
  )
}
