import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin, Clock, ArrowRight } from 'lucide-react'
import { PageHero, Reveal, useSEO } from '../components/ui'
import { useContent } from '../lib/content'

export default function Contact() {
  useSEO('Contact', 'Contact Techive IT Solutions by email, phone or WhatsApp.')
  const c = useContent('contact')
  const items = [
    [Mail, 'Email', c.email, `mailto:${c.email}`],
    [Phone, 'Phone / WhatsApp', c.phone, `tel:${c.phone.replace(/\s/g, '')}`],
    [MapPin, 'Office', c.address],
    [Clock, 'Hours', c.hours],
  ]
  return (
    <>
      <PageHero eyebrow={c.hero.eyebrow} title={c.hero.title} text={c.hero.text} />
      <section className="bg-zinc-50 py-16 sm:py-20">
        <div className="container-x grid gap-6 md:grid-cols-2">
          {items.map(([I, t, v, h], n) => (
            <Reveal key={t} delay={n * 80}>
              <div className="flex h-full gap-4 rounded-2xl border border-zinc-200 bg-white p-6">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-ink text-white"><I size={22} /></span>
                <div className="min-w-0"><p className="text-xs font-bold uppercase tracking-widest text-zinc-500">{t}</p>
                  {h ? <a href={h} className="break-words font-semibold hover:underline">{v}</a> : <p className="font-semibold">{v}</p>}</div>
              </div>
            </Reveal>
          ))}
          <Reveal className="md:col-span-2">
            <div className="flex flex-col items-start justify-between gap-5 rounded-3xl bg-ink p-8 text-white sm:flex-row sm:items-center">
              <div><h2 className="text-2xl font-extrabold">Have a project in mind?</h2><p className="mt-1 text-zinc-400">Sign in once and send us the details. We reply within one business day.</p></div>
              <Link to="/quote" className="btn-grad shrink-0">Get a Quote <ArrowRight size={18} /></Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
