import React, { useState } from 'react';
import { User, CreditCard, Bell, Shield, ExternalLink, LogOut } from 'lucide-react';
import { apiService } from '@/services/api';
import type { SettingsTabProps } from '@/types';

const SettingsTab: React.FC<SettingsTabProps> = ({ user, onUserUpdate }) => {
  const [notifications, setNotifications] = useState(true);
  const [autoDetect, setAutoDetect] = useState(true);

  const handleUpgrade = async (): Promise<void> => {
    try {
      const session = await apiService.createBillingSession('price_pro_monthly');
      window.open(session.url, '_blank');
    } catch (error) {
      console.error('Failed to create billing session:', error);
    }
  };

  const handleManageBilling = (): void => {
    window.open('https://covercraft.ai/billing', '_blank');
  };

  return (
    <div className="settings-tab">
      <SettingsSection title="Account" icon={User}>
        <div className="account-info">
          <div className="info-row">
            <span>Email:</span>
            <span>{user.email}</span>
          </div>
          <div className="info-row">
            <span>Name:</span>
            <span>{user.name}</span>
          </div>
          <div className="info-row">
            <span>Plan:</span>
            <span className="plan-badge">{user.plan}</span>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="Billing & Credits" icon={CreditCard}>
        <div className="credits-info">
          <div className="credits-display">
            <span className="credits-number">{user.credits}</span>
            <span className="credits-label">Credits Remaining</span>
          </div>
          
          {user.plan === 'free' && (
            <div className="upgrade-prompt">
              <p>Upgrade to Pro for unlimited cover letters</p>
              <button className="primary-button" onClick={handleUpgrade}>
                Upgrade to Pro - $19/month
              </button>
            </div>
          )}
          
          <button className="secondary-button" onClick={handleManageBilling}>
            <ExternalLink size={16} />
            Manage Billing
          </button>
        </div>
      </SettingsSection>

      <SettingsSection title="Preferences" icon={Bell}>
        <div className="preferences">
          <SettingToggle
            label="Auto-detect job postings"
            description="Automatically scan pages for job information"
            checked={autoDetect}
            onChange={setAutoDetect}
          />
          <SettingToggle
            label="Email notifications"
            description="Receive updates about new features"
            checked={notifications}
            onChange={setNotifications}
          />
        </div>
      </SettingsSection>

      <SettingsSection title="Privacy & Security" icon={Shield}>
        <div className="privacy-info">
          <p>Your resume data is encrypted and secure. We never share your information with third parties.</p>
          <button className="link-button">
            <ExternalLink size={16} />
            Privacy Policy
          </button>
        </div>
      </SettingsSection>

      <div className="settings-footer">
        <button className="danger-button">
          <LogOut size={16} />
          Sign Out
        </button>
        <div className="version-info">
          Version 1.0.0
        </div>
      </div>
    </div>
  );
};

interface SettingsSectionProps {
  title: string;
  icon: React.ComponentType<{ size?: number | string }>;
  children: React.ReactNode;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ title, icon: Icon, children }) => (
  <div className="settings-section">
    <div className="section-header">
      <Icon size={18} />
      <h4>{title}</h4>
    </div>
    <div className="section-content">
      {children}
    </div>
  </div>
);

interface SettingToggleProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const SettingToggle: React.FC<SettingToggleProps> = ({ label, description, checked, onChange }) => (
  <div className="setting-toggle">
    <div className="toggle-info">
      <span className="toggle-label">{label}</span>
      <span className="toggle-description">{description}</span>
    </div>
    <label className="toggle-switch">
      <input 
        type="checkbox" 
        checked={checked} 
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="toggle-slider"></span>
    </label>
  </div>
);

export default SettingsTab;