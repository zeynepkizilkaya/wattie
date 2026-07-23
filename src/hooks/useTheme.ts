import { useCallback, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

function getStoredTheme(): Theme {
  const stored = localStorage.getItem('theme')
  if (stored === 'dark' || stored === 'light') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme: Theme) {
  const root = document.documentElement
  root.setAttribute('data-theme', theme)
  root.style.colorScheme = theme
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(getStoredTheme)

  useEffect(() => {
    applyTheme(theme)
  }, [])

  const toggleTheme = useCallback(() => {
    const next = theme === 'light' ? 'dark' : 'light'

    const switchTheme = () => {
      applyTheme(next)
      localStorage.setItem('theme', next)
      setThemeState(next)
    }

    // View Transitions API — cross-fades the entire page as one unit
    if (document.startViewTransition) {
      document.startViewTransition(switchTheme)
    } else {
      switchTheme()
    }
  }, [theme])

  return { theme, toggleTheme }
}
