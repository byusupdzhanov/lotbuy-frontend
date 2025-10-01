import React from 'react';
import Icon from 'components/AppIcon';
import AppImage from 'components/AppImage';

const formatCurrency = (amount, currency = 'USD') => {
  const value = Number(amount) || 0;
  const code = (currency || 'USD').toUpperCase();
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: code }).format(value);
  } catch (error) {
    return `${code} ${value.toLocaleString()}`;
  }
};

const formatDeadline = (deadline) => {
  if (!deadline) return null;
  const target = new Date(deadline);
  const now = new Date();
  if (Number.isNaN(target.getTime())) return null;
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return 'Deadline passed';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days > 0) return `${days} day${days === 1 ? '' : 's'} left`;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours > 0) return `${hours} hour${hours === 1 ? '' : 's'} left`;
  const minutes = Math.floor(diff / (1000 * 60));
  return `${minutes} min left`;
};

const buildLocation = (lot) => {
  const segments = [lot.locationCity, lot.locationRegion, lot.locationCountry].filter(Boolean);
  return segments.join(', ');
};

const formatCurrency = (amount, currency = 'USD') => {
  const value = Number(amount) || 0;
  const code = (currency || 'USD').toUpperCase();
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: code }).format(value);
  } catch (error) {
    return `${code} ${value.toLocaleString()}`;
  }
};

const formatDeadline = (deadline) => {
  if (!deadline) return null;
  const target = new Date(deadline);
  const now = new Date();
  if (Number.isNaN(target.getTime())) return null;
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return 'Deadline passed';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days > 0) return `${days} day${days === 1 ? '' : 's'} left`;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours > 0) return `${hours} hour${hours === 1 ? '' : 's'} left`;
  const minutes = Math.floor(diff / (1000 * 60));
  return `${minutes} min left`;
};

const buildLocation = (lot) => {
  const segments = [lot.locationCity, lot.locationRegion, lot.locationCountry].filter(Boolean);
  return segments.join(', ');
};

const ActiveLots = ({ lots = [], onViewLot }) => {
  const handleViewLot = (lotId) => {
    if (onViewLot) {
      onViewLot(lotId);
    }
  };

  const getStatusColor = (status) => {
    const value = (status || '').toLowerCase();
    if (value === 'open') return 'status-success';
    if (value === 'in_progress') return 'status-warning';
    if (value === 'completed' || value === 'closed') return 'status-error';
    return 'bg-secondary-100 text-secondary-600';
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-text-primary">Your Active Lots</h2>
        <button className="text-sm text-primary hover:underline" onClick={() => onViewLot?.(lots[0]?.id)}>
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
                  <AppImage
                    src={lot.imageUrl || undefined}
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

                  {lot.description && (
                    <p className="text-sm text-text-secondary line-clamp-2 mb-3">
                      {lot.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-3 text-xs text-text-secondary mb-3">
                    {lot.category && (
                      <span className="inline-flex items-center space-x-1">
                        <Icon name="Tag" size={12} />
                        <span className="capitalize">{lot.category}</span>
                      </span>
                    )}
                    {buildLocation(lot) && (
                      <span className="inline-flex items-center space-x-1">
                        <Icon name="MapPin" size={12} />
                        <span>{buildLocation(lot)}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                      <span className="text-text-primary font-medium">
                        {formatCurrency(lot.budgetAmount, lot.currencyCode)}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1 text-text-secondary">
                      {lot.deadlineAt ? (
                        <>
                          <Icon name="Clock" size={14} />
                          <span>{formatDeadline(lot.deadlineAt)}</span>
                        </>
                      ) : (
                        <>
                          <Icon name="Calendar" size={14} />
                          <span>{new Date(lot.createdAt).toLocaleDateString()}</span>
                        </>
                      )}
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