import { createContext, useContext, useEffect, useState } from 'react'
import * as authService from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(
    () =>
      authService.subscribe((u) => {
        setUser(u)
        setLoading(false)
      }),
    []
  )

  const run = (action) => async (...args) => {
    setError(null)
    try {
      await action(...args)
      return true
    } catch (err) {
      setError(authService.authErrorMessage(err))
      return false
    }
  }

  const value = {
    user,
    loading,
    error,
    clearError: () => setError(null),
    signup: run(authService.signup),
    login: run(authService.login),
    loginWithGoogle: run(authService.loginWithGoogle),
    logout: run(authService.logout),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
