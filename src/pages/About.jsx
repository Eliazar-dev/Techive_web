import { PageHero, SectionHead, Reveal, CTA, useSEO } from '../components/ui'
import { audiences } from '../data'
import { useContent } from '../lib/content'

export default function About() {
  useSEO('About Us', 'Techive IT Solutions is a technology-driven company turning ideas into practical, reliable and scalable digital solutions.')
  const { hero, pillars, who, values } = useContent('about')
  return (
    <>
      <PageHero eyebrow={hero.eyebrow} title={hero.title} text={hero.text} />
      <section className="bg-zinc-50 py-16 sm:py-24">
        <div className="container-x grid gap-6 md:grid-cols-3">
          {pillars.map((p, n) => (
            <Reveal key={p.title} delay={n * 100}>
              <div className="card h-full"><div className="mb-4 h-1 w-12 rounded bg-brand-grad" /><h2 className="text-xl font-extrabold">{p.title}</h2><p className="mt-3 leading-relaxed text-zinc-600">{p.text}</p></div>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="bg-zinc-100 py-16 sm:py-24">
        <div className="container-x grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <span className="eyebrow">{who.eyebrow}</span>
            <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">{who.title}</h2>
            <p className="mt-5 leading-relaxed text-zinc-600">{who.p1}</p>
            <p className="mt-4 leading-relaxed text-zinc-600">{who.p2}</p>
          </Reveal>
          <Reveal className="grid grid-cols-2 gap-4">
            {audiences.map((a) => <div key={a} className="rounded-2xl bg-ink p-6 font-display text-lg font-bold text-white">{a}</div>)}
          </Reveal>
        </div>
      </section>
      <section className="bg-ink py-16 text-white sm:py-24">
        <div className="container-x">
          <SectionHead dark eyebrow="Our values" title="How we work" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v, n) => (
              <Reveal key={v.title} delay={n * 80}><div className="h-full rounded-2xl border border-white/10 bg-white/[.04] p-6"><h3 className="text-lg font-bold">{v.title}</h3><p className="mt-2 text-sm text-zinc-400">{v.text}</p></div></Reveal>
            ))}
          </div>
        </div>
      </section>
      <CTA title="Partner with Techive" text="Let's talk about what technology can do for you." />
    </>
  )
}
