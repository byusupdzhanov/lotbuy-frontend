import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import AppImage from 'components/AppImage';

const LotInformation = ({ lot }) => {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [activeSpecTab, setActiveSpecTab] = useState('specifications');

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTimeRemaining = (deadline) => {
    const now = new Date();
    const end = new Date(deadline);
    const diff = end - now;
    
    if (diff <= 0) return 'Недействителен';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} дней, ${hours} часов осталось`;
    return `${hours} часов осталось`;
  };

  const truncateDescription = (text, maxLength = 300) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-2xl lg:text-3xl font-bold text-text-primary mb-2">
              {lot.title}
            </h1>
            <div className="flex items-center space-x-4 text-sm text-text-secondary">
              <span className="flex items-center space-x-1">
                <Icon name="MapPin" size={16} />
                <span>{lot.location.city}, {lot.location.state}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Icon name="Eye" size={16} />
                <span>{lot.viewCount} просмотров</span>
              </span>
              <span className="flex items-center space-x-1">
                <Icon name="Clock" size={16} />
                <span>Создан {formatDate(lot.timeline.created)}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Budget Range */}
        <div className="bg-primary-50 border border-primary-100 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-primary mb-1">Диапазон цены</h3>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(lot.budgetRange.min)} - {formatCurrency(lot.budgetRange.max)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-primary-700 mb-1">Окончание лота</p>
              <p className="font-semibold text-primary">
                {getTimeRemaining(lot.timeline.deadline)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Buyer Information */}
      <div className="bg-surface border border-border rounded-lg p-4">
        <h3 className="text-lg font-semibold text-text-primary mb-3">Информация о покупателе</h3>
        <div className="flex items-center space-x-4">
          <AppImage
            src={lot.buyer.avatar}
            alt={lot.buyer.name}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h4 className="font-semibold text-text-primary">{lot.buyer.name}</h4>
              {lot.buyer.verified && (
                <Icon name="CheckCircle" size={16} className="text-success-500" />
              )}
            </div>
            <div className="flex items-center space-x-4 text-sm text-text-secondary">
              <div className="flex items-center space-x-1">
                <Icon name="Star" size={14} className="text-warning-500 fill-current" />
                <span>{lot.buyer.rating}</span>
              </div>
              <span>{lot.buyer.totalDeals} сделок завершено</span>
              <span>На LotBuy с {formatDate(lot.buyer.joinedDate)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="bg-surface border border-border rounded-lg p-4">
        <h3 className="text-lg font-semibold text-text-primary mb-3">Описание</h3>
        <div className="prose prose-sm max-w-none text-text-secondary">
          <p className="whitespace-pre-line">
            {showFullDescription 
              ? lot.description 
              : truncateDescription(lot.description)
            }
          </p>
          {lot.description.length > 300 && (
            <button
              onClick={() => setShowFullDescription(!showFullDescription)}
              className="text-primary hover:underline text-sm font-medium mt-2"
            >
              {showFullDescription ? 'Скрыть' : 'Больше'}
            </button>
          )}
        </div>
      </div>

      {/* Specifications and Details Tabs */}
      <div className="bg-surface border border-border rounded-lg">
        <div className="border-b border-border">
          <div className="flex">
            <button
              onClick={() => setActiveSpecTab('specifications')}
              className={`px-4 py-3 text-sm font-medium transition-colors ${
                activeSpecTab === 'specifications'
                  ? 'text-primary border-b-2 border-primary' :'text-text-secondary hover:text-text-primary'
              }`}
            >
              Спецификации
            </button>
            <button
              onClick={() => setActiveSpecTab('timeline')}
              className={`px-4 py-3 text-sm font-medium transition-colors ${
                activeSpecTab === 'timeline' ?'text-primary border-b-2 border-primary' :'text-text-secondary hover:text-text-primary'
              }`}
            >
              Таймлайн
            </button>
            <button
              onClick={() => setActiveSpecTab('location')}
              className={`px-4 py-3 text-sm font-medium transition-colors ${
                activeSpecTab === 'location' ?'text-primary border-b-2 border-primary' :'text-text-secondary hover:text-text-primary'
              }`}
            >
              Местоположение
            </button>
          </div>
        </div>

        <div className="p-4">
          {activeSpecTab === 'specifications' && (
            <div className="space-y-3">
              {lot.specifications.map((spec, index) => (
                <div key={index} className="flex justify-between items-start py-2 border-b border-border last:border-b-0">
                  <span className="text-text-secondary font-medium">{spec.label}</span>
                  <span className="text-text-primary text-right flex-1 ml-4">{spec.value}</span>
                </div>
              ))}
            </div>
          )}

          {activeSpecTab === 'timeline' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-success-100 rounded-full flex items-center justify-center">
                  <Icon name="Calendar" size={16} className="text-success-600" />
                </div>
                <div>
                  <p className="font-medium text-text-primary">Лот создан</p>
                  <p className="text-sm text-text-secondary">{formatDate(lot.timeline.created)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-warning-100 rounded-full flex items-center justify-center">
                  <Icon name="Clock" size={16} className="text-warning-600" />
                </div>
                <div>
                  <p className="font-medium text-text-primary">Предпочтительная доставка</p>
                  <p className="text-sm text-text-secondary">{formatDate(lot.timeline.preferredDelivery)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-error-100 rounded-full flex items-center justify-center">
                  <Icon name="AlertCircle" size={16} className="text-error-600" />
                </div>
                <div>
                  <p className="font-medium text-text-primary">Крайний срок</p>
                  <p className="text-sm text-text-secondary">{formatDate(lot.timeline.deadline)}</p>
                </div>
              </div>
            </div>
          )}

          {activeSpecTab === 'location' && (
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Icon name="MapPin" size={20} className="text-primary mt-1" />
                <div>
                  <p className="font-medium text-text-primary">
                    {lot.location.city}, {lot.location.state}, {lot.location.country}
                  </p>
                  <p className="text-sm text-text-secondary mt-1">
                    Место самовывоза или доставки
                  </p>
                </div>
              </div>
              
              {/* Map */}
              <div className="w-full h-48 bg-secondary-100 rounded-lg overflow-hidden">
                <iframe
                  width="100%"
                  height="100%"
                  loading="lazy"
                  title={`${lot.location.city}, ${lot.location.state}`}
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.google.com/maps?q=${lot.location.coordinates.lat},${lot.location.coordinates.lng}&z=14&output=embed`}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tags */}
      {lot.tags && lot.tags.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-text-primary mb-3">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {lot.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-secondary-100 text-secondary-700 rounded-full text-sm font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-4 bg-surface border border-border rounded-lg">
          <Icon name="Eye" size={24} className="text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold text-text-primary">{lot.viewCount}</p>
          <p className="text-sm text-text-secondary">Просмотров</p>
        </div>
        <div className="text-center p-4 bg-surface border border-border rounded-lg">
          <Icon name="DollarSign" size={24} className="text-success-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-text-primary">{lot.offerCount}</p>
          <p className="text-sm text-text-secondary">Предложений</p>
        </div>
        <div className="text-center p-4 bg-surface border border-border rounded-lg">
          <Icon name="Bookmark" size={24} className="text-warning-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-text-primary">{lot.savedCount}</p>
          <p className="text-sm text-text-secondary">Сохранений</p>
        </div>
      </div>
    </div>
  );
};

export default LotInformation;