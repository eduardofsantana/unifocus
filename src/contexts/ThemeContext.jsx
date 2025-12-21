import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  // 1. Verifica localStorage ou preferência do sistema ao iniciar
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('unifocus-theme')
      if (savedTheme) return savedTheme
      
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return 'light'
  })

  // 2. Atualiza a classe no HTML quando o tema muda
  useEffect(() => {
    const root = window.document.documentElement
    
    // Remove a classe antiga para evitar conflitos
    root.classList.remove('light', 'dark')
    
    // Adiciona a nova classe
    root.classList.add(theme)
    
    // Salva no navegador
    localStorage.setItem('unifocus-theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'))
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)