'use client'
import { createContext, useContext } from 'react'
import { useTheme } from '@/hooks/useTheme'
import { Theme } from '@/types'

interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue>({ theme: 'dark', toggleTheme: () => {} })

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, toggleTheme } = useTheme()
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useThemeContext() {
  return useContext(ThemeContext)
}
