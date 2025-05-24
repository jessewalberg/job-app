import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Briefcase, 
  Sparkles, 
  Download, 
  Copy, 
  Settings,
  History,
  CreditCard,
  User,
  ChevronRight,
  Check,
  AlertCircle
} from 'lucide-react';
import { StorageService } from '@/services/storage';
import { apiService } from '@/services/api';
import TabNavigation from './components/TabNavigation';
import GenerateTab from './components/GenerateTab';
import HistoryTab from './components/HistoryTab';
import SettingsTab from './components/SettingsTab';
import type { User as UserType } from '@/types';

type TabType = 'generate' | 'history' | 'settings';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('generate');
  const [user, setUser] = useState<UserType | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleTabChange = (tab: string): void => {
    setActiveTab(tab as TabType);
  };

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async (): Promise<void> => {
    try {
      setLoading(true);
      const token = await StorageService.getToken();
      
      if (token) {
        const userProfile = await apiService.getUserProfile();
        setUser(userProfile);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Failed to initialize app:', error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (credentials: { email: string; password: string }): Promise<void> => {
    try {
      const response = await apiService.login(credentials);
      await StorageService.setToken(response.token);
      setUser(response.user);
      setIsAuthenticated(true);
    } catch (error) {
      throw error;
    }
  };

  const handleLogout = async (): Promise<void> => {
    await StorageService.clearToken();
    setUser(null);
    setIsAuthenticated(false);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return (
    <div className="extension-container">
      <Header user={user!} onLogout={handleLogout} />
      
      <TabNavigation 
        activeTab={activeTab} 
        onTabChange={handleTabChange}
        user={user!}
      />

      <div className="tab-content">
        {activeTab === 'generate' && (
          <GenerateTab user={user!} onUserUpdate={setUser} />
        )}
        {activeTab === 'history' && (
          <HistoryTab user={user!} />
        )}
        {activeTab === 'settings' && (
          <SettingsTab user={user!} onUserUpdate={setUser} />
        )}
      </div>
    </div>
  );
};

const LoadingSpinner: React.FC = () => (
  <div className="loading-container">
    <div className="spinner"></div>
    <p>Loading CoverCraft...</p>
  </div>
);

interface AuthScreenProps {
  onLogin: (credentials: { email: string; password: string }) => Promise<void>;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await onLogin({ email: formData.email, password: formData.password });
      } else {
        await apiService.register(formData);
        await onLogin({ email: formData.email, password: formData.password });
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-header">
        <div className="brand">
          <Sparkles className="brand-icon" />
          <h1>CoverCraft</h1>
        </div>
        <p>AI-Powered Cover Letter Generator</p>
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
        {!isLogin && (
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Enter your name"
              required
            />
          </div>
        )}

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            placeholder="Enter your email"
            required
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            placeholder="Enter your password"
            required
          />
        </div>

        {error && (
          <div className="error-message">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Sign Up')}
        </button>

        <div className="auth-switch">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button" 
            className="link-button"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </div>
      </form>
    </div>
  );
};

interface HeaderProps {
  user: UserType;
  onLogout: () => Promise<void>;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => (
  <div className="header">
    <div className="header-content">
      <div className="brand">
        <Sparkles className="brand-icon" />
        <span>CoverCraft</span>
      </div>
      <div className="user-info">
        <div className="credits">
          <CreditCard size={14} />
          <span>{user?.credits || 0}</span>
        </div>
        <button className="user-menu" onClick={onLogout}>
          <User size={14} />
        </button>
      </div>
    </div>
  </div>
);

export default App;