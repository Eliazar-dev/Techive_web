import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight, Menu, X, Mail, Phone, MapPin, LogOut, CircleUser, GraduationCap, LayoutDashboard } from 'lucide-react'
import { nav, company } from '../data'
import { useAuth } from '../lib/auth'
import { useContent } from '../lib/content'
import { Avatar } from './ui'

const displayName = (u) => u.first_name || u.email.split('@')[0]

// Far-right profile button: "Login" when signed out, avatar + dropdown when signed in.
function ProfileMenu() {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const nav2 = useNavigate()
  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  if (!user)
    return (
      <Link to="/auth" className="flex items-center gap-2 rounded-full bg-white/10 py-1.5 pl-2 pr-4 font-display text-sm font-semibold text-white ring-1 ring-white/25 backdrop-blur transition hover:bg-white/20">
        <CircleUser size={26} strokeWidth={1.6} />Login
      </Link>
    )
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Account menu" className="flex items-center gap-2 rounded-full bg-white/10 py-1 pl-1 pr-4 font-display text-sm font-semibold text-white ring-1 ring-white/25 backdrop-blur transition hover:bg-white/20">
        <Avatar user={user} size={32} />{displayName(user)}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-56 animate-pop overflow-hidden rounded-2xl border border-zinc-200 bg-white text-ink shadow-2xl">
          <p className="truncate border-b border-zinc-100 px-4 py-3 text-xs text-zinc-500">{user.email}</p>
          <Link to="/academy" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-zinc-50"><GraduationCap size={16} />My Academy</Link>
          {user.is_staff && <Link to="/admin" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-zinc-50"><LayoutDashboard size={16} />Admin dashboard</Link>}
          <button onClick={() => { setOpen(false); logout(); nav2('/') }} className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm hover:bg-zinc-50"><LogOut size={16} />Sign out</button>
        </div>
      )}
    </div>
  )
}

// NOT sticky: absolute, sits on top of the hero / page banner and scrolls away.
function Header() {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()
  const { pathname } = useLocation()
  useEffect(() => setOpen(false), [pathname])
  useEffect(() => { document.body.style.overflow = open ? 'hidden' : '' ; return () => { document.body.style.overflow = '' } }, [open])

  const link = ({ isActive }) =>
    `relative py-2 text-[13px] font-semibold uppercase tracking-[.14em] transition ${isActive ? 'text-white' : 'text-white/75 hover:text-white'}`

  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <div className="container-x flex items-center justify-between py-4 lg:py-7">
        <Link to="/" aria-label="Techive IT Solutions home" className="shrink-0">
          <img src="/logo-light.png" alt="Techive IT Solutions" width="900" height="300" className="h-11 w-auto drop-shadow-lg sm:h-16 lg:h-24" />
        </Link>

        <nav className="hidden items-center gap-9 lg:flex" aria-label="Main">
          {nav.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.to === '/'} className={link}>
              {({ isActive }) => (<>{n.label}{isActive && <span className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded bg-brand-grad" />}</>)}
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:block"><ProfileMenu /></div>

        <button className="rounded-full bg-white/15 p-2.5 text-white backdrop-blur sm:p-3 lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu"><Menu size={22} /></button>
      </div>

      {/* Mobile: slide-in drawer from the right, profile at the top */}
      <div className={`fixed inset-0 z-50 lg:hidden ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
        <div onClick={() => setOpen(false)} className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`} />
        <aside className={`absolute right-0 top-0 flex h-full w-[82%] max-w-sm flex-col bg-ink p-6 text-white shadow-2xl transition-transform duration-300 ${open ? 'translate-x-0' : 'invisible translate-x-full'}`}>
          <button className="ml-auto rounded-full bg-white/10 p-2.5" onClick={() => setOpen(false)} aria-label="Close menu"><X size={20} /></button>
          <div className="mt-2 flex items-center gap-3 rounded-2xl bg-white/[.06] p-4">
            {user ? (
              <>
                <Avatar user={user} size={48} />
                <div className="min-w-0"><p className="truncate font-display font-bold">{displayName(user)}</p><p className="truncate text-xs text-zinc-400">{user.email}</p></div>
              </>
            ) : (
              <Link to="/auth" className="flex items-center gap-3 font-display font-bold"><CircleUser size={40} strokeWidth={1.4} />Login / Sign up</Link>
            )}
          </div>
          <nav className="mt-6 flex flex-1 flex-col overflow-y-auto" aria-label="Mobile">
            {nav.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.to === '/'} className={({ isActive }) => `border-b border-white/10 py-4 font-display text-lg font-bold uppercase tracking-wider ${isActive ? 'text-brand-cyan' : ''}`}>{n.label}</NavLink>
            ))}
            <Link to="/academy" className="flex items-center gap-2 border-b border-white/10 py-4 text-zinc-300"><GraduationCap size={18} />Academy</Link>
            {user?.is_staff && <Link to="/admin" className="py-4 text-brand-cyan">Admin dashboard</Link>}
            {user && <button onClick={logout} className="flex items-center gap-2 py-4 text-left text-zinc-400"><LogOut size={18} />Sign out</button>}
          </nav>
          <Link to="/quote" className="btn-grad w-full">Get a Quote <ArrowRight size={18} /></Link>
        </aside>
      </div>
    </header>
  )
}

function Footer() {
  const features = useContent('features')
  const contact = useContent('contact')
  return (
    <footer className="bg-ink text-zinc-400">
      <div className="container-x grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <img src="/logo-light.png" alt="Techive IT Solutions" loading="lazy" className="h-20 w-auto" />
          <p className="mt-5 text-sm leading-relaxed">{company.tagline} Practical, reliable and scalable digital solutions for businesses, institutions, ministries and entrepreneurs.</p>
        </div>
        <div>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-white">Services</h3>
          <ul className="space-y-2 text-sm">{features.services.slice(0, 6).map((s) => <li key={s.title}><Link to="/features" className="hover:text-white">{s.title}</Link></li>)}</ul>
        </div>
        <div>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-white">Company</h3>
          <ul className="space-y-2 text-sm">
            {[['/about', 'About Us'], ['/features', 'Features'], ['/academy', 'Academy'], ['/quote', 'Get a Quote'], ['/contact', 'Contact']].map(([to, l]) => <li key={to}><Link to={to} className="hover:text-white">{l}</Link></li>)}
          </ul>
        </div>
        <div>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-white">Get in touch</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-3"><MapPin size={16} className="mt-0.5 shrink-0" />{contact.address}</li>
            <li className="flex gap-3"><Phone size={16} className="mt-0.5 shrink-0" /><a href={`tel:${contact.phone.replace(/\s/g, '')}`} className="hover:text-white">{contact.phone}</a></li>
            <li className="flex gap-3"><Mail size={16} className="mt-0.5 shrink-0" /><a href={`mailto:${contact.email}`} className="hover:text-white">{contact.email}</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-6 text-center text-xs">© {new Date().getFullYear()} {company.name}. All rights reserved.</div>
    </footer>
  )
}

export default function Layout() {
  return (
    <>
      <Header />
      <main><Outlet /></main>
      <Footer />
    </>
  )
}
