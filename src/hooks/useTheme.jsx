/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, useCallback } from 'react'

const VALID = ['dark', 'light', 'system']

export const THEMES = [
  {
    id: 'dark',
    label: 'Sombre',
    icon: '🌙',
    description: 'Interface sombre — jaune MTN sur fond obsidien',
  },
  {
    id: 'light',
    label: 'Blanc',
    icon: '☀️',
    description: 'Interface claire — fond blanc, sidebar navy',
  },
  {
    id: 'system',
    label: 'Système',
    icon: '💻',
    description: 'Suit automatiquement les préférences du système',
  },
]

function getEffective(pref) {
  if (pref === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return pref === 'light' ? 'light' : 'dark'
}

const ThemeContext = createContext({ theme: 'dark', setTheme: () => {} })

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    const stored = localStorage.getItem('app_theme')
    return VALID.includes(stored) ? stored : 'dark'
  })

  const setTheme = useCallback((id) => {
    if (!VALID.includes(id)) return
    document.documentElement.classList.add('theme-transitioning')
    setThemeState(id)
    setTimeout(() => document.documentElement.classList.remove('theme-transitioning'), 320)
  }, [])

  useEffect(() => {
    const effective = getEffective(theme)
    document.documentElement.setAttribute('data-theme', effective)
    localStorage.setItem('app_theme', theme)
    localStorage.setItem('pm_theme', theme)
  }, [theme])

  // Listen for OS preference changes when in "system" mode
  useEffect(() => {
    if (theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      document.documentElement.classList.add('theme-transitioning')
      document.documentElement.setAttribute('data-theme', mq.matches ? 'dark' : 'light')
      setTimeout(() => document.documentElement.classList.remove('theme-transitioning'), 320)
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])

  // Cross-tab / Login → App theme sync
  useEffect(() => {
    const handler = (e) => {
      if (VALID.includes(e.detail)) setTheme(e.detail)
    }
    window.addEventListener('app-theme-changed', handler)
    return () => window.removeEventListener('app-theme-changed', handler)
  }, [setTheme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
