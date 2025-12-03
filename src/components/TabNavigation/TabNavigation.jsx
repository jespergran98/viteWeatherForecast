// src/components/TabNavigation/TabNavigation.jsx
import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { getTranslation } from '../../utils/translations';
import './TabNavigation.css';

const TabNavigation = ({ activeTab, onTabChange }) => {
  const { language } = useLanguage();
  const t = (key) => getTranslation(language, key);

  const tabs = [
    { id: 'temperature', label: t('temperature') },
    { id: 'precipitation', label: t('precipitation') },
    { id: 'wind', label: t('wind') }
  ];

  return (
    <div className="tab-navigation">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default TabNavigation;