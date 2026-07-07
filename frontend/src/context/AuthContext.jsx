import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

const STORAGE_KEY_ACCESS = 'spotter_access_token'
const STORAGE_KEY_REFRESH = 'spotter_refresh_token'
const STORAGE_KEY_USER = 'spotter_user'

function storeTokens(access, refresh) {
  localStorage.setItem(STORAGE_KEY_ACCESS, access)
  localStorage.setItem(STORAGE_KEY_REFRESH, refresh)
}

function clearTokens() {
  localStorage.removeItem(STORAGE_KEY_ACCESS)
  localStorage.removeItem(STORAGE_KEY_REFRESH)
  localStorage.removeItem(STORAGE_KEY_USER)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_USER)
      return raw ? JSON.parse(raw) : null
    } catch { return null }
  })
  const [loading, setLoading] = useState(true)
  const interceptorSet = useRef(false)

  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEY_ACCESS)
    if (token) {
      api.get('/api/auth/me/')
        .then(({ data }) => {
          setUser(data)
          localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(data))
        })
        .catch(() => {
          clearTokens()
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (interceptorSet.current) return
    interceptorSet.current = true

    const reqInterceptor = api.interceptors.request.use((config) => {
      const token = localStorage.getItem(STORAGE_KEY_ACCESS)
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })

    const resInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const original = error.config
        if (error.response?.status === 401 && !original._retry) {
          original._retry = true
          const refresh = localStorage.getItem(STORAGE_KEY_REFRESH)
          if (refresh) {
            try {
              const { data } = await api.post('/api/auth/token/refresh/', { refresh })
              storeTokens(data.access, refresh)
              original.headers.Authorization = `Bearer ${data.access}`
              return api(original)
            } catch {
              clearTokens()
              setUser(null)
            }
          }
        }
        return Promise.reject(error)
      }
    )

    return () => {
      api.interceptors.request.eject(reqInterceptor)
      api.interceptors.response.eject(resInterceptor)
    }
  }, [])

  const login = useCallback(async (username, password) => {
    const { data } = await api.post('/api/auth/login/', { username, password })
    storeTokens(data.access, data.refresh)
    setUser(data.user)
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(data.user))
    return data.user
  }, [])

  const register = useCallback(async (username, email, password) => {
    const { data } = await api.post('/api/auth/register/', { username, email, password })
    storeTokens(data.access, data.refresh)
    setUser(data.user)
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(data.user))
    return data.user
  }, [])

  const logout = useCallback(async () => {
    const refresh = localStorage.getItem(STORAGE_KEY_REFRESH)
    try {
      await api.post('/api/auth/logout/', { refresh })
    } catch { /* ignore */ }
    clearTokens()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
