import React, { useState } from 'react';
import Icon from 'components/AppIcon';

const SocialAuth = ({ onSuccess }) => {
  const [loadingProvider, setLoadingProvider] = useState(null);

  const socialProviders = [
    {
      id: 'google',
      name: 'Google',
      icon: 'Chrome',
      color: 'text-red-500',
      bgColor: 'hover:bg-red-50'
    },
    {
      id: 'facebook',
      name: 'Github',
      icon: 'Github',
      color: 'text-black',
      bgColor: 'hover:bg-blue-50'
    }
  ];

  const handleSocialAuth = async (provider) => {
    setLoadingProvider(provider.id);

    try {
      // Simulate social auth API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock successful social authentication
      const userData = {
        id: Date.now(),
        email: `user@${provider.id}.com`,
        name: `${provider.name} User`,
        role: 'buyer',
        avatarUrl: `https://randomuser.me/api/portraits/men/${Math.floor(Math.random() * 50) + 1}.jpg`,
        provider: provider.id
      };

      onSuccess({
        token: `${provider.id}-demo-token`,
        user: {
          id: userData.id,
          email: userData.email,
          fullName: userData.name,
          role: userData.role,
          avatarUrl: userData.avatarUrl
        }
      });
      
    } catch (error) {
      console.error(`${provider.name} authentication error:`, error);
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-surface text-text-secondary">Или войти с</span>
        </div>
      </div>

      {/* Social Auth Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {socialProviders.map((provider) => (
          <button
            key={provider.id}
            type="button"
            onClick={() => handleSocialAuth(provider)}
            disabled={loadingProvider !== null}
            className={`flex items-center justify-center px-4 py-3 border border-border rounded-lg transition-all duration-200 ${
              provider.bgColor
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loadingProvider === provider.id ? (
              <Icon name="Loader2" size={18} className="animate-spin text-text-secondary" />
            ) : (
              <Icon name={provider.icon} size={18} className={provider.color} />
            )}
            <span className="ml-3 text-sm font-medium text-text-primary">
              {loadingProvider === provider.id ? 'Connecting...' : provider.name}
            </span>
          </button>
        ))}
      </div>

      {/* Social Auth Benefits */}
      <div className="bg-secondary-50 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Icon name="Shield" size={16} className="text-primary mt-0.5" />
          <div>
            <p className="text-sm font-medium text-text-primary">Быстро и безопасно</p>
            <p className="text-xs text-text-secondary mt-1">
              Ваши аккаунты в социальных сетях используются только для безопасной аутентификации. Мы никогда не публикуем информацию от вашего имени.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialAuth;