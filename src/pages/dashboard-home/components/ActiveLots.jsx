import React from 'react';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';

const ActiveLots = ({ lots = [], onViewLot }) => {
  const handleViewLot = (lotId) => {
    if (onViewLot) {
      onViewLot(lotId);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'status-success';
      case 'pending':
        return 'status-warning';
      case 'closed':
        return 'status-error';
      default:
        return 'bg-secondary-100 text-secondary-600';
    }
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-text-primary">Your Active Lots</h2>
        <button className="text-sm text-primary hover:underline">
          View All Lots
        </button>
      </div>

      {lots.length === 0 ? (
        <div className="text-center py-8">
          <Icon name="Package" size={48} className="text-secondary-300 mx-auto mb-3" />
          <p className="text-text-secondary mb-2">No active lots</p>
          <p className="text-sm text-text-secondary mb-4">
            Create your first lot to start receiving offers
          </p>
          <button className="btn-primary px-4 py-2 rounded-lg text-sm">
            Create Lot
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {lots.map((lot) => (
            <div
              key={lot.id}
              className="border border-border rounded-lg p-4 hover:shadow-sm transition-all duration-200 cursor-pointer"
              onClick={() => handleViewLot(lot.id)}
            >
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-secondary-100">
                  <Image
                    src={lot.image}
                    alt={lot.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm font-semibold text-text-primary line-clamp-1">
                      {lot.title}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lot.status)}`}>
                      {lot.status}
                    </span>
                  </div>

                  <p className="text-sm text-text-secondary line-clamp-2 mb-3">
                    {lot.description}
                  </p>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                      <span className="text-text-primary font-medium">
                        {lot.budget}
                      </span>
                      <div className="flex items-center space-x-1 text-text-secondary">
                        <Icon name="MessageSquare" size={14} />
                        <span>{lot.offersCount} offers</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1 text-text-secondary">
                      <Icon name="Clock" size={14} />
                      <span>{lot.timeLeft}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActiveLots;