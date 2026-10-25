import { useState } from 'react'
import api from '../api/axios'
import { AuthContext } from './AuthContext'

function readSavedUser() {
  try {
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(readSavedUser)

  const saveSession = (data) => {
    localStorage.setItem('token', data.token)
    const profile = { name: data.name, email: data.email }
    localStorage.setItem('user', JSON.stringify(profile))
    setUser(profile)
  }

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password })
    saveSession(response.data)
  }

  const register = async (name, email, password) => {
    const response = await api.post('/auth/register', { name, email, password })
    saveSession(response.data)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}