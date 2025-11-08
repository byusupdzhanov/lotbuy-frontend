import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from 'components/AppIcon';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import SocialAuth from './components/SocialAuth';
import { useAuth } from 'context/AuthContext';

const LoginRegister = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login, initializing } = useAuth();
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
    if (!initializing && user) {
      navigate('/dashboard-home', { replace: true });
    }
  }, [initializing, user, navigate]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Update URL without causing navigation
    const newUrl = tab === 'register' ? '/login-register?tab=register' : '/login-register';
    window.history.replaceState({}, '', newUrl);
  };

  const handleAuthSuccess = (authPayload) => {
    if (authPayload) {
      login(authPayload);
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
              <h1 className="text-2xl font-bold text-text-primary">LotBuy</h1>
              <p className="text-sm text-text-secondary">Обратный спрос</p>
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
              {activeTab === 'login' ? 'С возвращением' : 'Присоединяйтесь'}
            </h2>
            <p className="text-text-secondary">
              {activeTab === 'login' ?'Войдите в аккаунт, чтобы смотреть лоты и оставлять предложения' :'Создайте аккаунт, что прочувствовать все преимущества LotBuy'
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
                Войти
              </button>
              <button
                onClick={() => handleTabChange('register')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === 'register' ?'bg-surface text-text-primary shadow-sm' :'text-text-secondary hover:text-text-primary'
                }`}
              >
                Создать аккаунт
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
              Продолжая, вы соглашаетесь с{' '}
              <button className="text-primary hover:underline">Условия обслуживания</button>
              {' '}и{' '}
              <button className="text-primary hover:underline">Политика конфиденциальности</button>
            </p>
            
            <div className="pt-4">
              <button
                onClick={() => navigate('/browse-lots')}
                className="text-sm text-primary hover:underline"
              >
                Смотреть лоты без входа
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 border-t border-border">
        <div className="max-w-md mx-auto text-center">
          <p className="text-xs text-text-secondary">
            © {new Date().getFullYear()} ООО "ЛотБай". Все права защищены.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LoginRegister;