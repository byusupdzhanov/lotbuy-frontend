import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';

const OfferComparisonModal = ({ offers = [], onClose, onSelectOffer }) => {
  const [selectedOffers, setSelectedOffers] = useState(offers.slice(0, 3));
  const [sortBy, setSortBy] = useState('price');

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

  const handleOfferSelection = (offer) => {
    if (selectedOffers.find(o => o.id === offer.id)) {
      setSelectedOffers(prev => prev.filter(o => o.id !== offer.id));
    } else if (selectedOffers.length < 3) {
      setSelectedOffers(prev => [...prev, offer]);
    }
  };

  const getComparisonScore = (offer) => {
    // Simple scoring algorithm based on price, rating, and response time
    const priceScore = Math.max(0, 100 - (offer.price / 100)); // Lower price = higher score
    const ratingScore = offer.seller.rating * 20; // Rating out of 5 * 20 = 100
    const responseScore = offer.seller.responseTime.includes('< 2') ? 100 : 
                         offer.seller.responseTime.includes('< 4') ? 80 : 60;
    
    return Math.round((priceScore + ratingScore + responseScore) / 3);
  };

  const getBestValue = () => {
    return selectedOffers.reduce((best, current) => {
      const currentScore = getComparisonScore(current);
      const bestScore = getComparisonScore(best);
      return currentScore > bestScore ? current : best;
    }, selectedOffers[0]);
  };

  const modalContent = (
    <div className="fixed inset-0 z-1000 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-subtle">
      <div className="w-full max-w-6xl bg-surface rounded-xl shadow-xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-2xl font-semibold text-text-primary">Compare Offers</h2>
            <p className="text-sm text-text-secondary mt-1">
              Select up to 3 offers to compare side by side
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-text-secondary hover:text-text-primary hover:bg-secondary-100 rounded-lg transition-all duration-200"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row h-full">
          {/* Offer Selection Sidebar */}
          <div className="lg:w-80 border-r border-border bg-secondary-50">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold text-text-primary mb-2">All Offers ({offers.length})</h3>
              <div className="flex items-center space-x-2">
                <Icon name="ArrowUpDown" size={16} className="text-text-secondary" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-sm border border-border rounded px-2 py-1 bg-background"
                >
                  <option value="price">Price</option>
                  <option value="rating">Rating</option>
                  <option value="recent">Most Recent</option>
                </select>
              </div>
            </div>
            
            <div className="overflow-y-auto max-h-96 p-2">
              {offers.map((offer) => {
                const isSelected = selectedOffers.find(o => o.id === offer.id);
                const canSelect = selectedOffers.length < 3 || isSelected;
                
                return (
                  <button
                    key={offer.id}
                    onClick={() => handleOfferSelection(offer)}
                    disabled={!canSelect}
                    className={`w-full text-left p-3 rounded-lg mb-2 transition-all duration-200 ${
                      isSelected
                        ? 'bg-primary-100 border-2 border-primary'
                        : canSelect
                        ? 'bg-surface border border-border hover:border-primary-200' :'bg-secondary-100 border border-border opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Image
                          src={offer.seller.avatar}
                          alt={offer.seller.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-medium text-sm">{offer.seller.name}</p>
                          <div className="flex items-center space-x-1">
                            <Icon name="Star" size={12} className="text-warning-500 fill-current" />
                            <span className="text-xs text-text-secondary">{offer.seller.rating}</span>
                          </div>
                        </div>
                      </div>
                      {isSelected && (
                        <Icon name="Check" size={16} className="text-primary" />
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-primary">
                        {formatCurrency(offer.price)}
                      </span>
                      <span className="text-xs text-text-secondary">
                        {formatTimeAgo(offer.submittedAt)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Comparison Table */}
          <div className="flex-1 overflow-hidden">
            {selectedOffers.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Icon name="BarChart3" size={48} className="text-secondary-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    Select offers to compare
                  </h3>
                  <p className="text-text-secondary">
                    Choose up to 3 offers from the sidebar to see a detailed comparison
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-full overflow-y-auto">
                {/* Best Value Banner */}
                {selectedOffers.length > 1 && (
                  <div className="bg-success-50 border-b border-success-100 p-4">
                    <div className="flex items-center space-x-2">
                      <Icon name="Award" size={20} className="text-success-600" />
                      <span className="font-semibold text-success-800">
                        Best Value: {getBestValue().seller.name} - {formatCurrency(getBestValue().price)}
                      </span>
                    </div>
                  </div>
                )}

                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {selectedOffers.map((offer) => {
                      const isBestValue = selectedOffers.length > 1 && getBestValue().id === offer.id;
                      
                      return (
                        <div
                          key={offer.id}
                          className={`bg-surface border rounded-lg p-4 ${
                            isBestValue ? 'border-success-300 bg-success-50' : 'border-border'
                          }`}
                        >
                          {/* Header */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <Image
                                src={offer.seller.avatar}
                                alt={offer.seller.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                              <div>
                                <h4 className="font-semibold text-text-primary">{offer.seller.name}</h4>
                                <div className="flex items-center space-x-1">
                                  <Icon name="Star" size={14} className="text-warning-500 fill-current" />
                                  <span className="text-sm text-text-secondary">{offer.seller.rating}</span>
                                  {offer.seller.verified && (
                                    <Icon name="CheckCircle" size={14} className="text-success-500" />
                                  )}
                                </div>
                              </div>
                            </div>
                            {isBestValue && (
                              <div className="bg-success-100 text-success-800 px-2 py-1 rounded text-xs font-medium">
                                Best Value
                              </div>
                            )}
                          </div>

                          {/* Price */}
                          <div className="mb-4">
                            <p className="text-2xl font-bold text-primary">
                              {formatCurrency(offer.price)}
                            </p>
                            <p className="text-sm text-text-secondary">
                              Score: {getComparisonScore(offer)}/100
                            </p>
                          </div>

                          {/* Key Metrics */}
                          <div className="space-y-3 mb-4">
                            <div className="flex justify-between">
                              <span className="text-sm text-text-secondary">Response Time</span>
                              <span className="text-sm font-medium">{offer.seller.responseTime}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-text-secondary">Total Sales</span>
                              <span className="text-sm font-medium">{offer.seller.totalSales}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-text-secondary">Location</span>
                              <span className="text-sm font-medium">{offer.seller.location}</span>
                            </div>
                          </div>

                          {/* Delivery Options */}
                          <div className="mb-4">
                            <h5 className="text-sm font-medium text-text-primary mb-2">Delivery</h5>
                            <div className="space-y-1">
                              {offer.deliveryOptions.map((option, index) => (
                                <div key={index} className="flex items-center space-x-2 text-xs">
                                  <Icon 
                                    name={option.type === 'pickup' ? 'MapPin' : 'Truck'} 
                                    size={12} 
                                    className="text-text-secondary"
                                  />
                                  <span className="text-text-secondary">
                                    {option.type === 'pickup' 
                                      ? `Pickup: ${option.timeframe}`
                                      : `Shipping: ${option.timeframe}`
                                    }
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Key Features */}
                          <div className="mb-4">
                            <div className="flex flex-wrap gap-1">
                              {offer.warranty && (
                                <span className="px-2 py-1 bg-success-100 text-success-700 rounded text-xs">
                                  Warranty
                                </span>
                              )}
                              {offer.additionalServices && offer.additionalServices.length > 0 && (
                                <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs">
                                  +{offer.additionalServices.length} extras
                                </span>
                              )}
                              {offer.images && offer.images.length > 0 && (
                                <span className="px-2 py-1 bg-secondary-100 text-secondary-700 rounded text-xs">
                                  {offer.images.length} photos
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="space-y-2">
                            <button
                              onClick={() => onSelectOffer(offer)}
                              className="btn-primary w-full py-2 rounded text-sm font-medium"
                            >
                              Accept Offer
                            </button>
                            <button
                              onClick={() => console.log('Message seller:', offer.seller.name)}
                              className="btn-secondary w-full py-2 rounded text-sm font-medium"
                            >
                              Message Seller
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Detailed Comparison Table */}
                  {selectedOffers.length > 1 && (
                    <div className="mt-8">
                      <h3 className="text-lg font-semibold text-text-primary mb-4">Detailed Comparison</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full border border-border rounded-lg">
                          <thead className="bg-secondary-50">
                            <tr>
                              <th className="text-left p-3 border-b border-border font-medium text-text-primary">
                                Feature
                              </th>
                              {selectedOffers.map((offer) => (
                                <th key={offer.id} className="text-left p-3 border-b border-border font-medium text-text-primary">
                                  {offer.seller.name}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="p-3 border-b border-border font-medium">Price</td>
                              {selectedOffers.map((offer) => (
                                <td key={offer.id} className="p-3 border-b border-border">
                                  <span className="font-bold text-primary">
                                    {formatCurrency(offer.price)}
                                  </span>
                                </td>
                              ))}
                            </tr>
                            <tr>
                              <td className="p-3 border-b border-border font-medium">Rating</td>
                              {selectedOffers.map((offer) => (
                                <td key={offer.id} className="p-3 border-b border-border">
                                  <div className="flex items-center space-x-1">
                                    <Icon name="Star" size={14} className="text-warning-500 fill-current" />
                                    <span>{offer.seller.rating}</span>
                                  </div>
                                </td>
                              ))}
                            </tr>
                            <tr>
                              <td className="p-3 border-b border-border font-medium">Response Time</td>
                              {selectedOffers.map((offer) => (
                                <td key={offer.id} className="p-3 border-b border-border">
                                  {offer.seller.responseTime}
                                </td>
                              ))}
                            </tr>
                            <tr>
                              <td className="p-3 border-b border-border font-medium">Warranty</td>
                              {selectedOffers.map((offer) => (
                                <td key={offer.id} className="p-3 border-b border-border">
                                  {offer.warranty || 'Not specified'}
                                </td>
                              ))}
                            </tr>
                            <tr>
                              <td className="p-3 font-medium">Timeline</td>
                              {selectedOffers.map((offer) => (
                                <td key={offer.id} className="p-3">
                                  {offer.timeline}
                                </td>
                              ))}
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default OfferComparisonModal;