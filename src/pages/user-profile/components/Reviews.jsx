import React from 'react';
import Icon from 'components/AppIcon';

const Reviews = ({ stats }) => {
  return (
    <div className="card p-6 text-center text-text-secondary space-y-3">
      <Icon name="Star" size={36} className="mx-auto text-warning-500" />
      <p className="text-text-primary font-semibold">Отзывы скоро появятся</p>
      <p className="text-sm">Заключайте больше сделок, чтобы начать получать рейтинги от продавцов.</p>
      <div className="flex items-center justify-center space-x-4 text-sm">
        <span>Сделок выполненно: {stats?.completedDeals ?? 0}</span>
        <span>Предложений отправлено: {stats?.offersMade ?? 0}</span>
      </div>
    </div>
  );
};

export default Reviews;
