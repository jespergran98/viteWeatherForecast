// src/components/SideMenu/SideMenu.jsx
import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { getTranslation } from '../../utils/translations';
import './SideMenu.css';

const SideMenu = ({ isOpen, onClose }) => {
  const { language, setLanguage } = useLanguage();
  const t = (key) => getTranslation(language, key);

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className={`menu-overlay ${isOpen ? 'active' : ''}`}
        onClick={onClose}
      />

      {/* Side Menu */}
      <div className={`side-menu ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="menu-header">
          <h2 className="menu-title">{t('menu')}</h2>
          <button 
            className="close-button" 
            onClick={onClose}
            aria-label="Close menu"
          >
            <svg 
              className="close-icon" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </button>
        </div>

        {/* Menu Content */}
        <div className="menu-content">
          {/* Language Section */}
          <div className="menu-section">
            <h3 className="section-title">{t('language')}</h3>
            <div className="language-options">
              <button
                className={`language-button ${language === 'no' ? 'active' : ''}`}
                onClick={() => handleLanguageChange('no')}
              >
                {t('norwegian')}
              </button>
              <button
                className={`language-button ${language === 'nn' ? 'active' : ''}`}
                onClick={() => handleLanguageChange('nn')}
              >
                {t('nynorsk')}
              </button>
              <button
                className={`language-button ${language === 'en' ? 'active' : ''}`}
                onClick={() => handleLanguageChange('en')}
              >
                {t('english')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SideMenu;