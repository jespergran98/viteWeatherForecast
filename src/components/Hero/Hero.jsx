// src/components/Hero/Hero.jsx
import React, { useState } from 'react'
import WeatherCard from '../WeatherCard/WeatherCard'
import './Hero.css'

const Hero = ({ darkMode, setDarkMode }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <div className="hero-container">
      {/* Hero Background */}
      <div className="hero-background">
        
        {/* Navigation Bar */}
        <nav className="navbar">
          <div className="navbar-content">
            {/* Logo Section */}
            <div className="logo-section">
              <div className="logo-icon">
                <img src="/assets/logo/logo.png" alt="VærVarsel Logo" />
              </div>
              <span className="logo-text">VærVarsel</span>
            </div>

            {/* Action Buttons */}
            <div className="nav-actions">
              {/* Refresh Button */}
              <button 
                className="nav-btn" 
                onClick={handleRefresh}
                aria-label="Refresh weather"
              >
                <svg 
                  className="icon refresh-icon" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                  />
                </svg>
              </button>

              {/* Dark Mode Toggle */}
              <button 
                className="nav-btn" 
                onClick={() => setDarkMode(!darkMode)}
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <svg 
                    className="icon" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" 
                    />
                  </svg>
                ) : (
                  <svg 
                    className="icon" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" 
                    />
                  </svg>
                )}
              </button>

              {/* Hamburger Menu */}
              <button className="nav-btn" aria-label="Menu">
                <svg 
                  className="icon" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4 6h16M4 12h16M4 18h16" 
                  />
                </svg>
              </button>
            </div>
          </div>
        </nav>

        {/* Glass Card Container */}
        <div className="hero-content">
          <div className="glass-card">
            <div className="card-inner">
              <WeatherCard 
                darkMode={darkMode} 
                onRefresh={refreshTrigger}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hero