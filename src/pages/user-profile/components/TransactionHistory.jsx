import React from 'react';
import Icon from 'components/AppIcon';

const formatCurrency = (amount, currency = 'USD') => {
  const value = Number(amount) || 0;
  const code = (currency || 'USD').toUpperCase();
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: code }).format(value);
  } catch (error) {
    return `${code} ${value.toLocaleString()}`;
  }
};

const TransactionHistory = ({ deals = [] }) => {
  if (!deals.length) {
    return (
      <div className="card p-6 text-center text-text-secondary">
        <Icon name="Archive" size={32} className="mx-auto mb-3 text-secondary-300" />
        <p>You have not completed any deals yet.</p>
      </div>
    );
  }

  return (
    <div className="card p-6 space-y-4">
      <h3 className="text-lg font-semibold text-text-primary">Recent Deals</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-text-secondary uppercase tracking-wide">
              <th className="py-3 pr-4">Lot</th>
              <th className="py-3 pr-4">Offer</th>
              <th className="py-3 pr-4">Status</th>
              <th className="py-3 pr-4">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {deals.map((deal) => (
              <tr key={deal.id} className="hover:bg-secondary-50">
                <td className="py-3 pr-4">
                  <p className="font-medium text-text-primary line-clamp-1">{deal.request?.title}</p>
                  <p className="text-xs text-text-secondary">#{deal.requestId}</p>
                </td>
                <td className="py-3 pr-4">
                  {formatCurrency(deal.totalAmount, deal.currencyCode)}
                </td>
                <td className="py-3 pr-4 capitalize text-text-secondary">{deal.status.replace('_', ' ')}</td>
                <td className="py-3 pr-4 text-text-secondary">
                  {new Date(deal.updatedAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionHistory;
