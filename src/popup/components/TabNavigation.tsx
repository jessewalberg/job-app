import React from 'react';
import { Sparkles, History, Settings } from 'lucide-react';
import type { TabNavigationProps } from '@/types';

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange, user }) => {
  const tabs = [
    { id: 'generate' as const, label: 'Generate', icon: Sparkles },
    { id: 'history' as const, label: 'History', icon: History },
    { id: 'settings' as const, label: 'Settings', icon: Settings }
  ];

  return (
    <div className="tab-navigation">
      {tabs.map(tab => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            <Icon size={16} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default TabNavigation;