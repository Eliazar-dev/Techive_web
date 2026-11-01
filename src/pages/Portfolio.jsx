import { useState } from 'react'
import { PageHero, Reveal, CTA, useSEO } from '../components/ui'
import { projects } from '../data'

const cats = ['All', ...new Set(projects.map((p) => p.cat))]

export default function Portfolio() {
  useSEO('Portfolio', 'A selection of websites, systems, payment integrations and apps built by Techive IT Solutions.')
  const [cat, setCat] = useState('All')
  const list = projects.filter((p) => cat === 'All' || p.cat === cat)
  return (
    <>
      <PageHero eyebrow="Portfolio" title="Work that solves real problems" text="A selection of the kinds of products we build for our clients." />
      <section className="bg-zinc-50 py-24">
        <div className="container-x">
          <div className="mb-10 flex flex-wrap justify-center gap-2">
            {cats.map((c) => (
              <button key={c} onClick={() => setCat(c)} className={`rounded-full px-5 py-2 text-sm font-semibold transition ${cat === c ? 'bg-ink text-white' : 'bg-white text-zinc-700 ring-1 ring-zinc-200 hover:ring-ink'}`}>{c}</button>
            ))}
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((p, n) => (
              <Reveal key={p.title} delay={(n % 3) * 80}>
                <article className="card overflow-hidden !p-0">
                  {/* Replace with <img src=... loading="lazy"> once project screenshots are available */}
                  <div className="flex h-44 items-end bg-gradient-to-br from-zinc-800 to-ink p-5"><span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur">{p.cat}</span></div>
                  <div className="p-6">
                    <h2 className="text-lg font-bold">{p.title}</h2>
                    <p className="mt-2 text-sm text-zinc-600">{p.blurb}</p>
                    <div className="mt-4 flex flex-wrap gap-2">{p.tags.map((t) => <span key={t} className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600">{t}</span>)}</div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <CTA />
    </>
  )
}
