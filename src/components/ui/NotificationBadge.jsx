import React, { useState, useEffect, useRef } from 'react';
import Icon from '../AppIcon';

const NotificationBadge = ({ 
  count = 0, 
  maxCount = 9, 
  showDropdown = true,
  onNotificationClick,
  className = ""
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);

  // Mock notifications data
  useEffect(() => {
    setNotifications([
      {
        id: 1,
        type: 'offer',
        title: 'New Offer Received',
        message: 'John Smith made an offer on your Electronics Lot',
        timestamp: '2 minutes ago',
        isRead: false,
        icon: 'DollarSign',
        iconColor: 'text-success-500'
      },
      {
        id: 2,
        type: 'message',
        title: 'New Message',
        message: 'Sarah Johnson sent you a message about Furniture Lot',
        timestamp: '15 minutes ago',
        isRead: false,
        icon: 'MessageCircle',
        iconColor: 'text-primary'
      },
      {
        id: 3,
        type: 'lot_update',
        title: 'Lot Status Update',
        message: 'Your Office Equipment lot has been approved',
        timestamp: '1 hour ago',
        isRead: true,
        icon: 'CheckCircle',
        iconColor: 'text-success-500'
      },
      {
        id: 4,
        type: 'deadline',
        title: 'Deadline Reminder',
        message: 'Offer deadline for Industrial Tools lot expires in 2 hours',
        timestamp: '2 hours ago',
        isRead: true,
        icon: 'Clock',
        iconColor: 'text-warning-500'
      },
      {
        id: 5,
        type: 'system',
        title: 'Account Verification',
        message: 'Your account has been successfully verified',
        timestamp: '1 day ago',
        isRead: true,
        icon: 'Shield',
        iconColor: 'text-primary'
      }
    ]);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleBadgeClick = () => {
    if (onNotificationClick) {
      onNotificationClick();
    }
    if (showDropdown) {
      setIsDropdownOpen(!isDropdownOpen);
    }
  };

  const handleNotificationItemClick = (notification) => {
    // Mark as read
    setNotifications(prev => 
      prev.map(n => 
        n.id === notification.id ? { ...n, isRead: true } : n
      )
    );

    // Handle navigation based on notification type
    switch (notification.type) {
      case 'offer': console.log('Navigate to offers page');
        break;
      case 'message': console.log('Navigate to messages');
        break;
      case 'lot_update': console.log('Navigate to lot details');
        break;
      default:
        console.log('Handle notification:', notification);
    }

    setIsDropdownOpen(false);
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, isRead: true }))
    );
  };

  const handleClearAll = () => {
    setNotifications([]);
    setIsDropdownOpen(false);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const displayCount = count || unreadCount;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Notification Badge Button */}
      <button
        onClick={handleBadgeClick}
        className="relative p-2 text-text-secondary hover:text-text-primary hover:bg-secondary-100 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        aria-label={`Notifications (${displayCount} unread)`}
      >
        <Icon name="Bell" size={20} />
        {displayCount > 0 && (
          <span className="absolute -top-1 -right-1 notification-badge min-w-[18px] h-[18px] flex items-center justify-center text-xs animate-pulse-slow">
            {displayCount > maxCount ? `${maxCount}+` : displayCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {showDropdown && isDropdownOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-surface rounded-lg shadow-lg border border-border z-200 animation-slide-in">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="text-lg font-semibold text-text-primary">Notifications</h3>
            {notifications.length > 0 && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-primary hover:underline"
                >
                  Mark all read
                </button>
                <button
                  onClick={handleClearAll}
                  className="text-xs text-text-secondary hover:text-error-500"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Icon name="Bell" size={48} className="text-secondary-300 mx-auto mb-3" />
                <p className="text-text-secondary">No notifications yet</p>
                <p className="text-sm text-text-secondary mt-1">
                  We'll notify you when something important happens
                </p>
              </div>
            ) : (
              <div className="py-2">
                {notifications.map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationItemClick(notification)}
                    className={`w-full text-left px-4 py-3 hover:bg-secondary-50 transition-colors duration-200 border-l-4 ${
                      notification.isRead 
                        ? 'border-transparent' :'border-primary bg-primary-50'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`flex-shrink-0 ${notification.iconColor}`}>
                        <Icon name={notification.icon} size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm font-medium ${
                            notification.isRead ? 'text-text-secondary' : 'text-text-primary'
                          }`}>
                            {notification.title}
                          </p>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 ml-2" />
                          )}
                        </div>
                        <p className="text-sm text-text-secondary mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-text-secondary mt-2">
                          {notification.timestamp}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-border">
              <button
                onClick={() => {
                  console.log('View all notifications');
                  setIsDropdownOpen(false);
                }}
                className="w-full text-center text-sm text-primary hover:underline py-2"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBadge;