import React from 'react';
import Icon from 'components/AppIcon';

const Reviews = ({ stats }) => {
  return (
    <div className="card p-6 text-center text-text-secondary space-y-3">
      <Icon name="Star" size={36} className="mx-auto text-warning-500" />
      <p className="text-text-primary font-semibold">Reviews coming soon</p>
      <p className="text-sm">Complete more deals to start receiving ratings from sellers.</p>
      <div className="flex items-center justify-center space-x-4 text-sm">
        <span>Deals completed: {stats?.completedDeals ?? 0}</span>
        <span>Offers made: {stats?.offersMade ?? 0}</span>
      </div>
    </div>
  );
};

export default Reviews;
