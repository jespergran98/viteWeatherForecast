// src/components/TabNavigation/TabNavigation.jsx
import React from 'react';
import './TabNavigation.css';

const TabNavigation = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'temperature', label: 'Temperatur' },
    { id: 'precipitation', label: 'Nedbør' },
    { id: 'wind', label: 'Vind' }
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