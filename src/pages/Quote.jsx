import { useState } from 'react'
import { Check } from 'lucide-react'
import { PageHero, useSEO } from '../components/ui'
import { useContent } from '../lib/content'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'

const budgets = ['Under KSh 50,000', 'KSh 50,000 – 150,000', 'KSh 150,000 – 500,000', 'Above KSh 500,000', 'Not sure yet']

// Route is wrapped in <RequireAuth> (see App.jsx), so `user` always exists here.
export default function Quote() {
  useSEO('Get a Quote', 'Request a quote from the Techive team for your website, app or business system.')
  const { user } = useAuth()
  const { services } = useContent('features')
  const [f, setF] = useState({ name: '', phone: user?.phone || '', service: '', budget: '', message: '' })
  const [state, setState] = useState('idle') // idle | sending | done | error
  const [err, setErr] = useState('')
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  async function submit(e) {
    e.preventDefault()
    setState('sending'); setErr('')
    try { await api('/quotes/', { method: 'POST', body: f }); setState('done') }
    catch (x) { setErr(x.message); setState('error') }
  }

  return (
    <>
      <PageHero eyebrow="Get a Quote" title="Tell us about your project" text="A senior member of the team will reply within one business day." />
      <section className="bg-zinc-50 py-16 sm:py-20">
        <div className="container-x">
          <div className="mx-auto max-w-3xl rounded-3xl border border-zinc-200 bg-white p-6 sm:p-10">
            {state === 'done' ? (
              <div className="py-16 text-center">
                <span className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-ink text-white"><Check size={32} /></span>
                <h2 className="text-2xl font-extrabold">Thank you, we got your request</h2>
                <p className="mt-2 text-zinc-600">We'll get back to you at {user.email} shortly.</p>
              </div>
            ) : (
              <form onSubmit={submit} className="grid gap-5 sm:grid-cols-2">
                <h2 className="text-2xl font-extrabold sm:col-span-2">Request a quote <span className="block text-sm font-normal text-zinc-500">Signed in as {user.email}</span></h2>
                <label className="text-sm font-medium">Name<input className="input mt-1" value={f.name} onChange={set('name')} autoComplete="name" placeholder={user.first_name || 'Your name'} /></label>
                <label className="text-sm font-medium">Phone / WhatsApp<input className="input mt-1" value={f.phone} onChange={set('phone')} autoComplete="tel" /></label>
                <label className="text-sm font-medium">Service
                  <select className="input mt-1" value={f.service} onChange={set('service')}>
                    <option value="">Select a service</option>
                    {services.map((s) => <option key={s.title}>{s.title}</option>)}<option>Other</option>
                  </select></label>
                <label className="text-sm font-medium">Budget
                  <select className="input mt-1" value={f.budget} onChange={set('budget')}><option value="">Select a range</option>{budgets.map((b) => <option key={b}>{b}</option>)}</select></label>
                <label className="text-sm font-medium sm:col-span-2">Project details<textarea required rows={5} className="input mt-1" value={f.message} onChange={set('message')} placeholder="What do you want to build or fix?" /></label>
                {state === 'error' && <p className="text-sm text-red-600 sm:col-span-2" role="alert">{err}</p>}
                <button disabled={state === 'sending'} className="btn-dark sm:col-span-2">{state === 'sending' ? 'Sending…' : 'Send request'}</button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
