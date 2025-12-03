import React, { useState, useEffect } from 'react'
import Hero from './components/Hero/Hero'

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage for saved preference
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      return savedTheme === 'dark'
    }
    // Default to system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  // Apply theme class to documentElement (html tag) when darkMode changes
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark-mode');
      root.classList.remove('light-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.add('light-mode');
      root.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode])

  return (
    <div className="app">
      <Hero darkMode={darkMode} setDarkMode={setDarkMode} />
    </div>
  )
}

export default App