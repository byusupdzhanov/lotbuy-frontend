import React from 'react';
import Icon from 'components/AppIcon';
import AppImage from 'components/AppImage';

const formatCurrency = (amount, currencyCode = 'USD') => {
  const value = Number(amount) || 0;
  const code = (currencyCode || 'USD').toUpperCase();
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: code,
    }).format(value);
  } catch (error) {
    return `${code} ${value.toLocaleString()}`;
  }
};

const OfferCard = ({ offer, isOwner, isSeller, onEdit, onDelete, onAccept, onMessage }) => {
  const createdLabel = new Date(offer.createdAt).toLocaleString();
  const canMessage = isOwner || isSeller;

  return (
    <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-secondary-200">
            <AppImage
              src={offer.sellerAvatarUrl || undefined}
              alt={offer.sellerName}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="font-semibold text-text-primary">{offer.sellerName}</p>
            <p className="text-xs text-text-secondary">Подтверждено {createdLabel}</p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-xl font-semibold text-text-primary">
            {formatCurrency(offer.priceAmount, offer.currencyCode)}
          </p>
          <span className="inline-flex items-center px-2 py-1 mt-2 rounded-full text-xs font-medium bg-secondary-100 text-text-secondary capitalize">
            {offer.status}
          </span>
        </div>
      </div>

      {offer.message && (
        <div className="text-sm text-text-secondary whitespace-pre-line">
          {offer.message}
        </div>
      )}

      <div className="flex flex-wrap gap-3 justify-between">
        <div className="flex items-center space-x-3 text-xs text-text-secondary">
          <span className="inline-flex items-center space-x-1">
            <Icon name="Clock" size={14} />
            <span>Последнее обновление {new Date(offer.updatedAt).toLocaleString()}</span>
          </span>
          {offer.sellerRating != null && (
            <span className="inline-flex items-center space-x-1">
              <Icon name="Star" size={14} className="text-warning-500" />
              <span>{offer.sellerRating.toFixed(1)} рейтинг</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {canMessage && (
            <button
              onClick={() => onMessage?.(offer)}
              className="px-3 py-2 rounded-lg text-sm font-medium border border-secondary-300 text-text-secondary hover:text-primary hover:border-primary flex items-center space-x-1"
            >
              <Icon name="MessageCircle" size={14} />
              <span>Сообщение</span>
            </button>
          )}
          {isSeller && (
            <>
              <button
                onClick={() => onEdit(offer)}
                className="btn-secondary px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-1"
              >
                <Icon name="Edit" size={14} />
                <span>Изменить</span>
              </button>
              <button
                onClick={() => onDelete(offer.id)}
                className="px-3 py-2 rounded-lg text-sm font-medium border border-error-300 text-error-600 hover:bg-error-50 flex items-center space-x-1"
              >
                <Icon name="Trash" size={14} />
                <span>Удалить</span>
              </button>
            </>
          )}
          {isOwner && offer.status === 'pending' && (
            <button
              onClick={() => onAccept(offer.id)}
              className="btn-primary px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2"
            >
              <Icon name="CheckCircle" size={16} />
              <span>Принять</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const OffersList = ({
  offers = [],
  loading = false,
  isOwner = false,
  currentUserId,
  onEditOffer,
  onDeleteOffer,
  onAcceptOffer,
  onMessageSeller,
}) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="h-40 bg-secondary-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!offers.length) {
    return (
      <div className="bg-surface border border-border rounded-xl p-10 text-center">
        <Icon name="Inbox" size={36} className="mx-auto text-secondary-300 mb-4" />
        <h3 className="text-lg font-semibold text-text-primary mb-2">Пока нет преждложений</h3>
        <p className="text-text-secondary text-sm">
          {isOwner
            ? 'Sellers will appear here when they submit offers to your lot.'
            : 'Be the first to submit an offer for this lot.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {offers.map((offer) => (
        <OfferCard
          key={offer.id}
          offer={offer}
          isOwner={isOwner}
          isSeller={currentUserId != null && offer.sellerId === currentUserId}
          onEdit={onEditOffer}
          onDelete={onDeleteOffer}
          onAccept={onAcceptOffer}
          onMessage={onMessageSeller}
        />
      ))}
    </div>
  );
};

export default OffersList;
