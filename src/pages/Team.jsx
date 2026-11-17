import { Mail, Linkedin, Twitter } from 'lucide-react'
import { PageHero, Reveal, CTA, useSEO } from '../components/ui'
import { BreadcrumbSchema } from '../components/StructuredData'
import { useContent } from '../lib/content'

const initials = (name) => (name || '?').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('')

function MemberCard({ m, n }) {
  const links = [
    m.email && { href: `mailto:${m.email}`, label: `Email ${m.name}`, Icon: Mail },
    m.linkedin && { href: m.linkedin, label: `${m.name} on LinkedIn`, Icon: Linkedin },
    m.twitter && { href: m.twitter, label: `${m.name} on X`, Icon: Twitter },
  ].filter(Boolean)
  return (
    <Reveal delay={(n % 3) * 80}>
      <article className="card flex h-full flex-col items-center p-8 text-center">
        {m.photo ? (
          <img src={m.photo} alt={`${m.name}, ${m.role}`} width={128} height={128} loading="lazy" className="h-32 w-32 rounded-full object-cover ring-4 ring-zinc-100" />
        ) : (
          <span aria-hidden="true" className="flex h-32 w-32 items-center justify-center rounded-full bg-brand-grad font-display text-3xl font-extrabold text-white">{initials(m.name)}</span>
        )}
        <h2 className="mt-5 text-xl font-extrabold">{m.name}</h2>
        <p className="mt-1 text-sm font-semibold text-brand-blue">{m.role}</p>
        {m.bio && <p className="mt-3 text-sm leading-relaxed text-zinc-600">{m.bio}</p>}
        {links.length > 0 && (
          <div className="mt-5 flex gap-2">
            {links.map(({ href, label, Icon }) => (
              <a key={label} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" aria-label={label} className="rounded-full bg-zinc-100 p-2.5 text-zinc-600 transition hover:bg-brand-grad hover:text-white">
                <Icon size={16} />
              </a>
            ))}
          </div>
        )}
      </article>
    </Reveal>
  )
}

export default function Team() {
  const t = useContent('team')
  useSEO('Our Team', 'Meet the people behind Techive IT Solutions — the team that designs, builds and supports your systems.', 'https://techiveitsolution.co.ke/team')
  const members = [...(t.members || [])].filter((m) => m && m.name).sort((a, b) => (a.order || 0) - (b.order || 0))
  return (
    <>
      <BreadcrumbSchema items={[{ name: 'Home', url: 'https://techiveitsolution.co.ke/' }, { name: 'Our Team', url: 'https://techiveitsolution.co.ke/team' }]} />
      <PageHero eyebrow={t.hero?.eyebrow} title={t.hero?.title} text={t.hero?.text} />
      {members.length > 0 && (
        <section className="bg-zinc-50 py-24">
          <div className="container-x grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((m, i) => <MemberCard key={`${m.name}-${i}`} m={m} n={i} />)}
          </div>
        </section>
      )}
      <CTA />
    </>
  )
}
