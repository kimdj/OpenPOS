import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { api, ApiError } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    refreshUser()
  }, [])

  const refreshUser = useCallback(() => {
    setLoading(true)
    return api
      .me()
      .then(setUser)
      .catch((err) => {
        if (!(err instanceof ApiError && err.status === 401)) {
          console.error(err)
        }
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  async function login(username, password) {
    const loggedUser = await api.login(username, password)
    setUser(loggedUser)
    return loggedUser
  }

  async function register(payload) {
    return api.register(payload)
  }

  async function logout() {
    await api.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
