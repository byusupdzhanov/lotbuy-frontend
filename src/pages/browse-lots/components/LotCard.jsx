import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from 'components/AppIcon';
import AppImage from 'components/AppImage';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop';

const formatCurrency = (amount, currencyCode = 'USD') => {
  const value = Number(amount) || 0;
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: 0,
    }).format(value);
  } catch (error) {
    return `${currencyCode} ${value.toLocaleString()}`;
  }
};

const formatRelativeTime = (dateString) => {
  if (!dateString) return '';
  const value = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - value.getTime();
  const diffMinutes = Math.round(diffMs / (1000 * 60));
  if (diffMinutes < 1) return 'только что';
  if (diffMinutes < 60) return `${diffMinutes}м назад`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}ч назад`;
  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}д назад`;
};

const LotCard = ({ lot, canMakeOffer = true }) => {
  const navigate = useNavigate();

  const displayImage = lot.imageUrl || FALLBACK_IMAGE;
  const budgetLabel = useMemo(
    () => formatCurrency(lot.budgetAmount, lot.currencyCode),
    [lot.budgetAmount, lot.currencyCode]
  );
  const createdLabel = useMemo(() => formatRelativeTime(lot.createdAt), [lot.createdAt]);

  const handleViewDetails = () => {
    navigate(`/lot-details-offers?id=${lot.id}`);
  };

  const handleMakeOffer = (event) => {
    event.stopPropagation();
    navigate(`/lot-details-offers?id=${lot.id}`);
  };

  return (
    <div
      className="bg-surface border border-border rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-shadow duration-200 cursor-pointer"
      onClick={handleViewDetails}
    >
      <div className="relative">
        <div className="aspect-video bg-secondary-100">
          <AppImage src={displayImage} alt={lot.title} className="w-full h-full object-cover" />
        </div>
        {createdLabel && (
          <span className="absolute top-3 left-3 px-2 py-1 rounded-full text-xs bg-black/70 text-white">
            {createdLabel}
          </span>
        )}
      </div>

      <div className="p-5 space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-text-primary mb-1 line-clamp-1">{lot.title}</h3>
          <p className="text-sm text-text-secondary line-clamp-2">
            {lot.description || 'Не предоставлено дополнительное описание.'}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-text-secondary uppercase tracking-wide">Бюджет</p>
            <p className="text-lg font-semibold text-text-primary">{budgetLabel}</p>
          </div>
          {lot.status && (
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-secondary-100 text-text-secondary capitalize">
              {lot.status}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-secondary-200">
              <AppImage
                src={lot.buyerAvatarUrl || undefined}
                alt={lot.buyerName || 'Покупатель'}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">
                {lot.buyerName || 'Анонимный покупатель'}
              </p>
              <p className="text-xs text-text-secondary">Лот #{lot.id}</p>
            </div>
          </div>

          {canMakeOffer && (
            <button
              onClick={handleMakeOffer}
              className="btn-primary px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2"
            >
              <Icon name="Handshake" size={16} />
              <span>Сделать предложение</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LotCard;
