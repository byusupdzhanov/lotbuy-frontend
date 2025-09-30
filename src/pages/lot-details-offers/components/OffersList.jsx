import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';

const OffersList = ({ 
  offers = [], 
  isOwner = false, 
  onViewOffer, 
  onMessageSeller, 
  onAcceptOffer, 
  onCompareOffers,
  compact = false 
}) => {
  const [sortBy, setSortBy] = useState('price_low');
  const [filterBy, setFilterBy] = useState('all');

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const sortOffers = (offers) => {
    const sorted = [...offers];
    switch (sortBy) {
      case 'price_low':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price_high':
        return sorted.sort((a, b) => b.price - a.price);
      case 'rating':
        return sorted.sort((a, b) => b.seller.rating - a.seller.rating);
      case 'recent':
        return sorted.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
      default:
        return sorted;
    }
  };

  const filterOffers = (offers) => {
    switch (filterBy) {
      case 'verified':
        return offers.filter(offer => offer.seller.verified);
      case 'local':
        return offers.filter(offer => offer.deliveryOptions.some(opt => opt.type === 'pickup'));
      case 'shipping':
        return offers.filter(offer => offer.deliveryOptions.some(opt => opt.type === 'shipping'));
      default:
        return offers;
    }
  };

  const processedOffers = sortOffers(filterOffers(offers));

  if (offers.length === 0) {
    return (
      <div className="text-center py-8">
        <Icon name="DollarSign" size={48} className="text-secondary-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-text-primary mb-2">
          {isOwner ? 'No offers yet' : 'Be the first to make an offer'}
        </h3>
        <p className="text-text-secondary">
          {isOwner 
            ? 'Offers will appear here when sellers respond to your lot.' :'Submit your offer to start the negotiation process.'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      {!compact && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 bg-surface border border-border rounded-lg p-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Icon name="Filter" size={16} className="text-text-secondary" />
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="text-sm border border-border rounded px-2 py-1 bg-background"
              >
                <option value="all">All offers</option>
                <option value="verified">Verified sellers</option>
                <option value="local">Local pickup</option>
                <option value="shipping">Shipping available</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Icon name="ArrowUpDown" size={16} className="text-text-secondary" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm border border-border rounded px-2 py-1 bg-background"
              >
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="recent">Most Recent</option>
              </select>
            </div>
          </div>

          {isOwner && offers.length > 1 && (
            <button
              onClick={onCompareOffers}
              className="btn-secondary px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2"
            >
              <Icon name="BarChart3" size={16} />
              <span>Compare Offers</span>
            </button>
          )}
        </div>
      )}

      {/* Offers List */}
      <div className="space-y-4">
        {processedOffers.map((offer) => (
          <div
            key={offer.id}
            className={`bg-surface border border-border rounded-lg p-4 hover:border-primary-200 transition-colors ${
              compact ? 'p-3' : 'p-4'
            }`}
          >
            {/* Seller Info */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Image
                  src={offer.seller.avatar}
                  alt={offer.seller.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-semibold text-text-primary">{offer.seller.name}</h4>
                    {offer.seller.verified && (
                      <Icon name="CheckCircle" size={14} className="text-success-500" />
                    )}
                  </div>
                  <div className="flex items-center space-x-3 text-xs text-text-secondary">
                    <div className="flex items-center space-x-1">
                      <Icon name="Star" size={12} className="text-warning-500 fill-current" />
                      <span>{offer.seller.rating}</span>
                    </div>
                    <span>{offer.seller.totalSales} sales</span>
                    <span>{offer.seller.responseTime}</span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(offer.price, offer.currency)}
                </p>
                <p className="text-xs text-text-secondary">
                  {formatTimeAgo(offer.submittedAt)}
                </p>
              </div>
            </div>

            {/* Offer Description */}
            {!compact && (
              <div className="mb-4">
                <p className="text-sm text-text-secondary line-clamp-3">
                  {offer.description}
                </p>
              </div>
            )}

            {/* Delivery Options */}
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {offer.deliveryOptions.map((option, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center space-x-1 px-2 py-1 bg-secondary-100 text-secondary-700 rounded text-xs"
                  >
                    <Icon 
                      name={option.type === 'pickup' ? 'MapPin' : 'Truck'} 
                      size={12} 
                    />
                    <span>
                      {option.type === 'pickup' 
                        ? `Pickup: ${option.timeframe}`
                        : `Shipping: ${option.timeframe}`
                      }
                    </span>
                  </span>
                ))}
              </div>
            </div>

            {/* Key Features */}
            {!compact && (
              <div className="mb-4 flex flex-wrap gap-2">
                {offer.warranty && (
                  <span className="inline-flex items-center space-x-1 px-2 py-1 bg-success-100 text-success-700 rounded text-xs">
                    <Icon name="Shield" size={12} />
                    <span>{offer.warranty}</span>
                  </span>
                )}
                {offer.additionalServices && offer.additionalServices.length > 0 && (
                  <span className="inline-flex items-center space-x-1 px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs">
                    <Icon name="Plus" size={12} />
                    <span>{offer.additionalServices.length} extras</span>
                  </span>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <div className="flex space-x-2">
                <button
                  onClick={() => onViewOffer(offer)}
                  className="btn-secondary px-3 py-1.5 rounded text-sm font-medium flex items-center space-x-1"
                >
                  <Icon name="Eye" size={14} />
                  <span>View Details</span>
                </button>
                
                <button
                  onClick={() => onMessageSeller(offer)}
                  className="btn-secondary px-3 py-1.5 rounded text-sm font-medium flex items-center space-x-1"
                >
                  <Icon name="MessageCircle" size={14} />
                  <span>Message</span>
                </button>
              </div>

              {isOwner && (
                <button
                  onClick={() => onAcceptOffer(offer)}
                  className="btn-primary px-4 py-1.5 rounded text-sm font-medium flex items-center space-x-1"
                >
                  <Icon name="Check" size={14} />
                  <span>Accept Offer</span>
                </button>
              )}
            </div>

            {/* Status Badge */}
            <div className="mt-3 flex justify-between items-center">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                offer.status === 'pending' ?'bg-warning-100 text-warning-600'
                  : offer.status === 'accepted' ?'bg-success-100 text-success-600' :'bg-secondary-100 text-secondary-600'
              }`}>
                {offer.status === 'pending' ? 'Pending Review' : 
                 offer.status === 'accepted' ? 'Accepted' : 'Declined'}
              </span>

              {offer.images && offer.images.length > 0 && (
                <div className="flex items-center space-x-1 text-xs text-text-secondary">
                  <Icon name="Image" size={12} />
                  <span>{offer.images.length} photos</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Load More (if needed) */}
      {!compact && processedOffers.length >= 10 && (
        <div className="text-center pt-4">
          <button className="btn-secondary px-6 py-2 rounded-lg font-medium">
            Load More Offers
          </button>
        </div>
      )}
    </div>
  );
};

export default OffersList;