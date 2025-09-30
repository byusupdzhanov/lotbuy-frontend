import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from 'components/AppIcon';

const QuickStats = ({ stats = {} }) => {
  const navigate = useNavigate();

  const statsConfig = [
    {
      key: 'activeLots',
      label: 'Active Lots',
      icon: 'Package',
      color: 'text-primary',
      bgColor: 'bg-primary-50',
      description: 'Lots accepting offers',
      onClick: () => navigate('/browse-lots')
    },
    {
      key: 'pendingOffers',
      label: 'Pending Offers',
      icon: 'DollarSign',
      color: 'text-success-500',
      bgColor: 'bg-success-50',
      description: 'Offers to review',
      onClick: () => navigate('/lot-details-offers')
    },
    {
      key: 'ongoingDeals',
      label: 'Ongoing Deals',
      icon: 'Handshake',
      color: 'text-accent-500',
      bgColor: 'bg-accent-50',
      description: 'Deals in progress',
      onClick: () => navigate('/user-profile')
    },
    {
      key: 'unreadMessages',
      label: 'Unread Messages',
      icon: 'MessageCircle',
      color: 'text-warning-500',
      bgColor: 'bg-warning-50',
      description: 'New messages',
      onClick: () => navigate('/user-profile')
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
                {stats[stat.key] || 0}
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