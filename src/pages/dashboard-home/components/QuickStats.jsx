import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from 'components/AppIcon';

const QuickStats = ({ stats = {} }) => {
  const navigate = useNavigate();

  const statsConfig = [
    {
      key: 'activeLots',
      label: 'Активные лоты',
      icon: 'Package',
      color: 'text-primary',
      bgColor: 'bg-primary-50',
      description: 'Лоты, получающие предложения',
      onClick: () => navigate('/browse-lots')
    },
    {
      key: 'pendingOffers',
      label: 'Полученные предложения',
      icon: 'DollarSign',
      color: 'text-success-500',
      bgColor: 'bg-success-50',
      description: 'Предложения от продавцов',
      onClick: () => navigate('/dashboard-home')
    },
    {
      key: 'ongoingDeals',
      fallbackKey: 'activeDeals',
      label: 'Текущие сделки',
      icon: 'Handshake',
      color: 'text-accent-500',
      bgColor: 'bg-accent-50',
      description: 'Сделки в процессе',
      onClick: () => navigate('/deals')
    },
    {
      key: 'unreadMessages',
      fallbackKey: 'incomingMessages',
      label: 'Непрочитанные сообщения',
      icon: 'MessageCircle',
      color: 'text-warning-500',
      bgColor: 'bg-warning-50',
      description: 'Сообщения от продавцов',
      onClick: () => navigate('/lot-details-offers')
    }
  ];

  return (
    <div className="mb-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsConfig.map((stat) => (
          <button
            key={stat.key}
            onClick={stat.onClick}
            className="card p-4 hover:shadow-md transition-all duration-200 text-left group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                <Icon name={stat.icon} size={20} className={stat.color} />
              </div>
              <Icon name="ArrowUpRight" size={16} className="text-text-secondary group-hover:text-primary transition-colors duration-200" />
            </div>
            
            <div className="space-y-1">
              <p className="text-2xl font-bold text-text-primary">
                {stats[stat.key] ?? stats[stat.fallbackKey] ?? 0}
              </p>
              <p className="text-sm font-medium text-text-primary">
                {stat.label}
              </p>
              <p className="text-xs text-text-secondary">
                {stat.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickStats;