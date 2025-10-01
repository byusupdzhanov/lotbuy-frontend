import React from 'react';
import Icon from 'components/AppIcon';

const getVisualsForType = (type) => {
  switch (type) {
    case 'offer.received':
      return { icon: 'DollarSign', iconColor: 'text-success-500', bg: 'bg-success-50' };
    case 'message.new':
      return { icon: 'MessageCircle', iconColor: 'text-primary', bg: 'bg-primary-50' };
    case 'deal.update':
      return { icon: 'Handshake', iconColor: 'text-accent-500', bg: 'bg-accent-50' };
    default:
      return { icon: 'Activity', iconColor: 'text-secondary-500', bg: 'bg-secondary-100' };
  }
};

const RecentActivity = ({ activities = [], onActivityAction }) => {
  const handleActivityClick = (activity) => {
    if (onActivityAction) {
      onActivityAction(activity);
    }
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-text-primary">Recent Activity</h2>
        <button className="text-sm text-primary hover:underline">
          View All
        </button>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-8">
          <Icon name="Activity" size={48} className="text-secondary-300 mx-auto mb-3" />
          <p className="text-text-secondary">No recent activity</p>
          <p className="text-sm text-text-secondary mt-1">
            Your activity will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => {
            const visuals = getVisualsForType(activity.type);
            return (
              <div
                key={activity.id}
                className="flex items-start space-x-4 p-4 rounded-lg hover:bg-secondary-50 transition-colors duration-200 cursor-pointer"
                onClick={() => handleActivityClick(activity)}
              >
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${visuals.bg}`}>
                  <Icon name={visuals.icon} size={18} className={visuals.iconColor} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-medium text-text-primary truncate">
                      {activity.title}
                    </h3>
                    <span className="text-xs text-text-secondary flex-shrink-0 ml-2">
                      {new Date(activity.createdAt).toLocaleString()}
                    </span>
                  </div>

                  {activity.body && (
                    <p className="text-sm text-text-secondary line-clamp-2 mb-2">
                      {activity.body}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecentActivity;