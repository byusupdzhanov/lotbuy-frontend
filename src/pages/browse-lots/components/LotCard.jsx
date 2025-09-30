import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';

const LotCard = ({ lot, viewMode = 'grid', onBookmarkToggle, onMakeOffer }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/lot-details-offers?id=${lot.id}`);
  };

  const handleBookmarkClick = (e) => {
    e.stopPropagation();
    onBookmarkToggle(lot.id);
  };

  const handleMakeOfferClick = (e) => {
    e.stopPropagation();
    onMakeOffer(lot.id);
  };

  const formatBudget = (min, max) => {
    return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
  };

  const getTimeRemainingColor = (timeRemaining) => {
    const days = parseInt(timeRemaining.split(' ')[0]);
    if (days <= 1) return 'text-error-500';
    if (days <= 2) return 'text-warning-500';
    return 'text-text-secondary';
  };

  if (viewMode === 'list') {
    return (
      <div 
        className="bg-surface rounded-lg border border-border hover:shadow-md transition-all duration-200 cursor-pointer"
        onClick={handleCardClick}
      >
        <div className="p-6">
          <div className="flex items-start space-x-4">
            {/* Image */}
            <div className="flex-shrink-0 w-32 h-24 rounded-lg overflow-hidden">
              <Image
                src={lot.image}
                alt={lot.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-text-primary mb-1 line-clamp-1">
                    {lot.title}
                  </h3>
                  <p className="text-text-secondary text-sm line-clamp-2 mb-3">
                    {lot.description}
                  </p>
                </div>
                
                <button
                  onClick={handleBookmarkClick}
                  className="p-2 text-text-secondary hover:text-primary transition-colors duration-200"
                >
                  <Icon 
                    name={lot.isBookmarked ? "Bookmark" : "BookmarkPlus"} 
                    size={18}
                    className={lot.isBookmarked ? "fill-current text-primary" : ""}
                  />
                </button>
              </div>

              <div className="flex items-center space-x-4 mb-3">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary">
                  {lot.category}
                </span>
                <span className="text-sm text-text-secondary">
                  <Icon name="MapPin" size={14} className="inline mr-1" />
                  {lot.location}
                </span>
                <span className="text-sm text-text-secondary">
                  <Icon name="Package" size={14} className="inline mr-1" />
                  {lot.condition}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div>
                    <p className="text-sm text-text-secondary">Budget</p>
                    <p className="font-semibold text-text-primary">
                      {formatBudget(lot.budgetMin, lot.budgetMax)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-text-secondary">Offers</p>
                    <p className="font-semibold text-text-primary">
                      {lot.offerCount}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-text-secondary">Time Left</p>
                    <p className={`font-semibold ${getTimeRemainingColor(lot.timeRemaining)}`}>
                      {lot.timeRemaining}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleMakeOfferClick}
                  className="btn-primary px-4 py-2 rounded-lg font-medium"
                >
                  Make Offer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-surface rounded-lg border border-border hover:shadow-md transition-all duration-200 cursor-pointer group"
      onClick={handleCardClick}
    >
      {/* Image */}
      <div className="relative">
        <div className="aspect-video rounded-t-lg overflow-hidden">
          <Image
            src={lot.image}
            alt={lot.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        
        {/* Bookmark Button */}
        <button
          onClick={handleBookmarkClick}
          className="absolute top-3 right-3 p-2 bg-white bg-opacity-90 backdrop-blur-sm rounded-full text-text-secondary hover:text-primary transition-colors duration-200"
        >
          <Icon 
            name={lot.isBookmarked ? "Bookmark" : "BookmarkPlus"} 
            size={16}
            className={lot.isBookmarked ? "fill-current text-primary" : ""}
          />
        </button>

        {/* Tags */}
        {lot.tags && lot.tags.length > 0 && (
          <div className="absolute top-3 left-3 flex flex-wrap gap-1">
            {lot.tags.map((tag, index) => (
              <span
                key={index}
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  tag === 'Urgent' ?'bg-error-100 text-error-600'
                    : tag === 'Popular' ?'bg-accent-100 text-accent-600' :'bg-success-100 text-success-600'
                }`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-text-primary mb-2 line-clamp-1">
            {lot.title}
          </h3>
          <p className="text-text-secondary text-sm line-clamp-2 mb-3">
            {lot.description}
          </p>
        </div>

        {/* Category and Location */}
        <div className="flex items-center justify-between mb-3">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary">
            {lot.category}
          </span>
          <span className="text-sm text-text-secondary">
            <Icon name="MapPin" size={14} className="inline mr-1" />
            {lot.location.split(',')[0]}
          </span>
        </div>

        {/* Budget */}
        <div className="mb-3">
          <p className="text-sm text-text-secondary mb-1">Budget Range</p>
          <p className="font-semibold text-text-primary">
            {formatBudget(lot.budgetMin, lot.budgetMax)}
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4 text-sm">
            <span className="text-text-secondary">
              <Icon name="Users" size={14} className="inline mr-1" />
              {lot.offerCount} offers
            </span>
            <span className={`${getTimeRemainingColor(lot.timeRemaining)}`}>
              <Icon name="Clock" size={14} className="inline mr-1" />
              {lot.timeRemaining}
            </span>
          </div>
        </div>

        {/* Buyer Info */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
          <div className="flex items-center space-x-2">
            <Image
              src={lot.buyer.avatar}
              alt={lot.buyer.name}
              className="w-6 h-6 rounded-full"
            />
            <span className="text-sm text-text-secondary">{lot.buyer.name}</span>
            <div className="flex items-center">
              <Icon name="Star" size={12} className="text-accent-500 fill-current" />
              <span className="text-xs text-text-secondary ml-1">{lot.buyer.rating}</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleMakeOfferClick}
          className="w-full btn-primary py-2 rounded-lg font-medium flex items-center justify-center space-x-2"
        >
          <Icon name="DollarSign" size={16} />
          <span>Make Offer</span>
        </button>
      </div>
    </div>
  );
};

export default LotCard;