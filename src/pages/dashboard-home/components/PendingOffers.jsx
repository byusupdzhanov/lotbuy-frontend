import React from 'react';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';

const PendingOffers = ({ offers = [], onViewOffer, onMessageSeller }) => {
  const handleViewOffer = (offerId) => {
    if (onViewOffer) {
      onViewOffer(offerId);
    }
  };

  const handleMessageSeller = (sellerId, e) => {
    e.stopPropagation();
    if (onMessageSeller) {
      onMessageSeller(sellerId);
    }
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-text-primary">Pending Offers</h2>
        <button className="text-sm text-primary hover:underline">
          View All Offers
        </button>
      </div>

      {offers.length === 0 ? (
        <div className="text-center py-8">
          <Icon name="DollarSign" size={48} className="text-secondary-300 mx-auto mb-3" />
          <p className="text-text-secondary mb-2">No pending offers</p>
          <p className="text-sm text-text-secondary">
            Offers from sellers will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="border border-border rounded-lg p-4 hover:shadow-sm transition-all duration-200 cursor-pointer"
              onClick={() => handleViewOffer(offer.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-text-primary line-clamp-1 mb-1">
                    {offer.lotTitle}
                  </h3>
                  <p className="text-xs text-text-secondary">
                    {offer.timeReceived}
                  </p>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <p className="text-lg font-bold text-success-600">
                    {offer.offerAmount}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src={offer.sellerAvatar}
                    alt={offer.sellerName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary">
                    {offer.sellerName}
                  </p>
                  <div className="flex items-center space-x-2 text-xs text-text-secondary">
                    <div className="flex items-center space-x-1">
                      <Icon name="Star" size={12} className="text-accent-500" />
                      <span>{offer.rating}</span>
                    </div>
                    <span>•</span>
                    <span>{offer.completedDeals} deals</span>
                  </div>
                </div>
                <button
                  onClick={(e) => handleMessageSeller(offer.sellerId, e)}
                  className="p-2 text-text-secondary hover:text-primary hover:bg-secondary-100 rounded-lg transition-all duration-200"
                  title="Message seller"
                >
                  <Icon name="MessageCircle" size={16} />
                </button>
              </div>

              <p className="text-sm text-text-secondary line-clamp-2 mb-3">
                {offer.offerDescription}
              </p>

              <div className="flex items-center justify-between">
                <button className="text-sm text-primary hover:underline font-medium">
                  View Details
                </button>
                <div className="flex items-center space-x-2">
                  <button className="px-3 py-1 text-xs bg-error-50 text-error-600 rounded-full hover:bg-error-100 transition-colors duration-200">
                    Decline
                  </button>
                  <button className="px-3 py-1 text-xs bg-success-50 text-success-600 rounded-full hover:bg-success-100 transition-colors duration-200">
                    Accept
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingOffers;