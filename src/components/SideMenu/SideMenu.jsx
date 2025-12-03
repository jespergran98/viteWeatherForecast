// src/components/SideMenu/SideMenu.jsx
import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { getTranslation } from '../../utils/translations';
import './SideMenu.css';

const SideMenu = ({ isOpen, onClose }) => {
  const { language, setLanguage } = useLanguage();

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    onClose();
  };

  const t = (key) => getTranslation(language, key);

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`menu-backdrop ${isOpen ? 'active' : ''}`}
        onClick={onClose}
      />
      
      {/* Side Menu */}
      <div className={`side-menu ${isOpen ? 'open' : ''}`}>
        <div className="menu-header">
          <h2 className="menu-title">{t('menu')}</h2>
          <button 
            className="close-button"
            onClick={onClose}
            aria-label="Close menu"
          >
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
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </button>
        </div>

        <div className="menu-content">
          <div className="menu-section">
            <h3 className="section-title">{t('language')}</h3>
            <div className="language-options">
              <button
                className={`language-option ${language === 'no' ? 'active' : ''}`}
                onClick={() => handleLanguageChange('no')}
              >
                <span className="language-name">{t('norwegian')}</span>
                {language === 'no' && (
                  <svg 
                    className="check-icon" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M5 13l4 4L19 7" 
                    />
                  </svg>
                )}
              </button>

              <button
                className={`language-option ${language === 'nn' ? 'active' : ''}`}
                onClick={() => handleLanguageChange('nn')}
              >
                <span className="language-name">{t('nynorsk')}</span>
                {language === 'nn' && (
                  <svg 
                    className="check-icon" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M5 13l4 4L19 7" 
                    />
                  </svg>
                )}
              </button>

              <button
                className={`language-option ${language === 'en' ? 'active' : ''}`}
                onClick={() => handleLanguageChange('en')}
              >
                <span className="language-name">{t('english')}</span>
                {language === 'en' && (
                  <svg 
                    className="check-icon" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M5 13l4 4L19 7" 
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SideMenu;