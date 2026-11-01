import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { api, tokens } from './api'

const Ctx = createContext(null)
export const useAuth = () => useContext(Ctx)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!tokens.get()) return setReady(true)
    api('/auth/me/').then(setUser).catch(() => {}).finally(() => setReady(true))
  }, [])

  // data = { access, refresh, user } returned by the verify / google endpoints. remember=false keeps the session only until the browser closes.
  const login = useCallback((data, remember = true) => { tokens.set({ access: data.access, refresh: data.refresh }, remember); setUser(data.user) }, [])
  const logout = useCallback(() => { tokens.clear(); setUser(null) }, [])
  const updateUser = useCallback((patch) => setUser((u) => (u ? { ...u, ...patch } : u)), [])

  return <Ctx.Provider value={{ user, ready, login, logout, updateUser }}>{children}</Ctx.Provider>
}
