/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login as loginApi } from '../api/auth'

const AuthContext = createContext(null)

function loadStoredUser() {
  try {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadStoredUser)
  const loading = false
  const navigate = useNavigate()

  const login = async (email, password) => {
    const { data } = await loginApi(email, password)
    localStorage.setItem('token', data.access_token)
    localStorage.setItem('user', JSON.stringify(data.user))
    setUser(data.user)
    navigate('/', { replace: true })
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    navigate('/login', { replace: true })
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
