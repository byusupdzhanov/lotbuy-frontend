import React, { useState } from 'react';
import Icon from 'components/AppIcon';

const Settings = () => {
  const [notifications, setNotifications] = useState({
    emailOffers: true,
    emailMessages: true,
    pushOffers: true,
    pushMessages: false,
  });
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    showEmail: false,
    showLocation: true,
  });

  const handleToggle = (group, key) => {
    if (group === 'notifications') {
      setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
    } else {
      setPrivacy((prev) => ({ ...prev, [key]: !prev[key] }));
    }
  };

  return (
    <div className="space-y-8">
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center space-x-2">
          <Icon name="Bell" size={18} />
          <span>Уведомления</span>
        </h3>
        <div className="space-y-3">
          {[{
            key: 'emailOffers',
            label: 'Уведомлять меня по почте о новых предложениях',
          }, {
            key: 'emailMessages',
            label: 'Уведомлять меня по почте о новых сообщениях',
          }, {
            key: 'pushOffers',
            label: 'Отправлять push-уведомления о новых предложениях',
          }, {
            key: 'pushMessages',
            label: 'Отправлять push-уведомления о новых сообщениях',
          }].map(({ key, label }) => (
            <label key={key} className="flex items-center justify-between text-sm text-text-secondary">
              <span>{label}</span>
              <input
                type="checkbox"
                checked={notifications[key]}
                onChange={() => handleToggle('notifications', key)}
                className="rounded border-border focus:ring-primary-500 focus:border-primary-500"
              />
            </label>
          ))}
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center space-x-2">
          <Icon name="Shield" size={18} />
          <span>Безопасность</span>
        </h3>
        <div className="space-y-3 text-sm text-text-secondary">
          <label className="flex items-center justify-between">
            <span>Сделать мой профиль открытом для других пользователей</span>
            <input
              type="checkbox"
              checked={privacy.profileVisibility === 'public'}
              onChange={() => setPrivacy((prev) => ({
                ...prev,
                profileVisibility: prev.profileVisibility === 'public' ? 'private' : 'public',
              }))}
              className="rounded border-border focus:ring-primary-500 focus:border-primary-500"
            />
          </label>
          <label className="flex items-center justify-between">
            <span>Отображать город</span>
            <input
              type="checkbox"
              checked={privacy.showLocation}
              onChange={() => handleToggle('privacy', 'showLocation')}
              className="rounded border-border focus:ring-primary-500 focus:border-primary-500"
            />
          </label>
          <label className="flex items-center justify-between">
            <span>Отображать почту в профиле</span>
            <input
              type="checkbox"
              checked={privacy.showEmail}
              onChange={() => handleToggle('privacy', 'showEmail')}
              className="rounded border-border focus:ring-primary-500 focus:border-primary-500"
            />
          </label>
        </div>
      </div>
    </div>
  );
};

export default Settings;
