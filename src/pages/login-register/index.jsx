import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from 'components/AppIcon';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import SocialAuth from './components/SocialAuth';

const LoginRegister = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('login');
  const [isLoading, setIsLoading] = useState(false);

  // Check for tab parameter in URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('tab');
    if (tab === 'register') {
      setActiveTab('register');
    }
  }, [location.search]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem('lotbuy-auth');
      if (raw) {
        navigate('/dashboard-home', { replace: true });
      }
    } catch (error) {
      console.warn('Unable to check auth status', error);
    }
  }, [navigate]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Update URL without causing navigation
    const newUrl = tab === 'register' ? '/login-register?tab=register' : '/login-register';
    window.history.replaceState({}, '', newUrl);
  };

  const handleAuthSuccess = (authPayload) => {
    if (authPayload && typeof window !== 'undefined') {
      try {
        window.localStorage.setItem('lotbuy-auth', JSON.stringify(authPayload));
      } catch (error) {
        console.warn('Unable to persist auth payload', error);
      }
    }
    navigate('/dashboard-home');
  };

  const handleLogoClick = () => {
    navigate('/dashboard-home');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header with Logo */}
      <header className="w-full py-6 px-4">
        <div className="max-w-md mx-auto">
          <button
            onClick={handleLogoClick}
            className="flex items-center space-x-3 mx-auto hover:opacity-80 transition-opacity duration-200"
          >
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Icon name="Gavel" size={24} color="white" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold text-text-primary">PeerAuction</h1>
              <p className="text-sm text-text-secondary">Peer-to-peer marketplace</p>
            </div>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Welcome Message */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-text-primary mb-2">
              {activeTab === 'login' ? 'Welcome Back' : 'Join PeerAuction'}
            </h2>
            <p className="text-text-secondary">
              {activeTab === 'login' ?'Sign in to access your auction marketplace' :'Create your account to start buying and selling'
              }
            </p>
          </div>

          {/* Auth Container */}
          <div className="card p-6 sm:p-8">
            {/* Tab Navigation */}
            <div className="flex mb-6 bg-secondary-100 rounded-lg p-1">
              <button
                onClick={() => handleTabChange('login')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === 'login' ?'bg-surface text-text-primary shadow-sm' :'text-text-secondary hover:text-text-primary'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => handleTabChange('register')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === 'register' ?'bg-surface text-text-primary shadow-sm' :'text-text-secondary hover:text-text-primary'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Auth Forms */}
            <div className="space-y-6">
              {activeTab === 'login' ? (
                <LoginForm 
                  onSuccess={handleAuthSuccess}
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                />
              ) : (
                <RegisterForm 
                  onSuccess={handleAuthSuccess}
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                />
              )}

              {/* Social Authentication */}
              <SocialAuth onSuccess={handleAuthSuccess} />
            </div>
          </div>

          {/* Additional Links */}
          <div className="text-center mt-6 space-y-2">
            <p className="text-sm text-text-secondary">
              By continuing, you agree to our{' '}
              <button className="text-primary hover:underline">Terms of Service</button>
              {' '}and{' '}
              <button className="text-primary hover:underline">Privacy Policy</button>
            </p>
            
            <div className="pt-4">
              <button
                onClick={() => navigate('/browse-lots')}
                className="text-sm text-primary hover:underline"
              >
                Browse lots without signing in
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 border-t border-border">
        <div className="max-w-md mx-auto text-center">
          <p className="text-xs text-text-secondary">
            © {new Date().getFullYear()} PeerAuction. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LoginRegister;