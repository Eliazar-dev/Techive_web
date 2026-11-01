import { useEffect, useRef, useState } from 'react'
import { GoogleLogin } from '@react-oauth/google'
import { MS_ENABLED, microsoftIdToken } from '../lib/microsoft'

const GOOGLE = import.meta.env.VITE_GOOGLE_CLIENT_ID

const GIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" /><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.4-4.8 7.1l7.6 5.9c4.4-4.1 7-10.1 7-17.5z" /><path fill="#FBBC05" d="M10.5 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7l-7.9-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.9-6.1z" /><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.3 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" /></svg>
)
const MIcon = () => (
  <svg width="18" height="18" viewBox="0 0 23 23" aria-hidden="true"><path fill="#f35325" d="M1 1h10v10H1z" /><path fill="#81bc06" d="M12 1h10v10H12z" /><path fill="#05a6f0" d="M1 12h10v10H1z" /><path fill="#ffba08" d="M12 12h10v10H12z" /></svg>
)

// Animated "Continue with Google". Our own styled button is shown; Google's real (invisible) button sits on top so clicks go to Google.
export function GoogleButton({ label = 'Continue with Google', onCredential, onError }) {
  const box = useRef(null)
  const [w, setW] = useState(300)
  useEffect(() => { if (box.current) setW(Math.min(400, Math.max(200, Math.round(box.current.offsetWidth)))) }, [])
  return (
    <div ref={box} className="relative">
      <span className="social-btn pointer-events-none"><GIcon />{label}</span>
      {GOOGLE ? (
        <div className="absolute inset-0 overflow-hidden opacity-[0.01]" aria-label={label}>
          <GoogleLogin onSuccess={(r) => onCredential(r.credential)} onError={() => onError?.('Google sign-in failed')} width={String(w)} text="continue_with" />
        </div>
      ) : (
        <button type="button" className="absolute inset-0 cursor-not-allowed" title="Google sign-in is not configured" onClick={() => onError?.('Google sign-in is not configured yet.')} aria-label={label} />
      )}
    </div>
  )
}

export function MicrosoftButton({ label = 'Continue with Microsoft', onToken, onError }) {
  const [busy, setBusy] = useState(false)
  async function click() {
    if (!MS_ENABLED) return onError?.('Microsoft sign-in is not configured yet.')
    setBusy(true)
    try { onToken(await microsoftIdToken()) } catch (e) { if (!/user_cancelled|popup_window_error/.test(e?.errorCode || '')) onError?.('Microsoft sign-in failed.') } finally { setBusy(false) }
  }
  return <button type="button" onClick={click} disabled={busy} className="social-btn"><MIcon />{busy ? 'Opening…' : label}</button>
}
