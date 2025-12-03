// src/App.jsx
import React, { useState, useEffect } from 'react';
import { LanguageProvider } from './contexts/LanguageContext';
import Hero from './components/Hero/Hero';

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark-mode', darkMode);
    root.classList.toggle('light-mode', !darkMode);
  }, [darkMode]);

  return (
    <LanguageProvider>
      <div className="app">
        <Hero darkMode={darkMode} setDarkMode={setDarkMode} />
      </div>
    </LanguageProvider>
  );
}

export default App;