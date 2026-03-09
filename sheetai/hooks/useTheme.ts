'use client'
import { useState, useEffect, useCallback } from 'react'
import { Theme } from '@/types'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    const stored = localStorage.getItem('cella-theme') as Theme | null
    const preferred = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
    const initial = stored || preferred
    setTheme(initial)
    document.documentElement.setAttribute('data-theme', initial)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark'
      localStorage.setItem('cella-theme', next)
      document.documentElement.setAttribute('data-theme', next)
      return next
    })
  }, [])

  return { theme, toggleTheme }
}
