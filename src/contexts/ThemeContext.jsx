import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('unifocus-theme')
      if (savedTheme) return savedTheme
      
      // FORÇAR MODO CLARO COMO PADRÃO
      // Se quiser seguir o sistema, troque 'light' por:
      // window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      return 'light' 
    }
    return 'light'
  })

  useEffect(() => {
    const root = window.document.documentElement
    
    // Limpa classes antigas e adiciona a nova
    root.classList.remove('light', 'dark')
    root.classList.add(theme)
    
    // Salva a escolha
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