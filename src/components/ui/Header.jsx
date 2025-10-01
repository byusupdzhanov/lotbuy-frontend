import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import { useAuth } from 'context/AuthContext';
import { listNotifications, markNotificationRead } from 'lib/api/notifications';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout } = useAuth();
  const [authUser, setAuthUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const notificationsRef = useRef(null);

  const navigationItems = [
    {
      label: 'Home',
      path: '/dashboard-home',
      icon: 'Home',
      tooltip: 'Dashboard overview'
    },
    {
      label: 'Browse',
      path: '/browse-lots',
      icon: 'Search',
      tooltip: 'Find lots to bid on'
    },
    {
      label: 'Deals',
      path: '/deals',
      icon: 'Handshake',
      tooltip: 'Manage your active deals'
    },
    {
      label: 'Create',
      path: '/create-lot',
      icon: 'Plus',
      tooltip: 'Create new lot'
    },
    {
      label: 'Profile',
      path: '/user-profile',
      icon: 'User',
      tooltip: 'Manage your account'
    }
  ];

  const isActiveTab = (path) => {
    if (path === '/dashboard-home' && location.pathname === '/') return true;
    return location.pathname === path;
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse-lots?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsSearchFocused(false);
    }
  };

  const fetchNotifications = async () => {
    setLoadingNotifications(true);
    try {
      const data = await listNotifications({ limit: 8 });
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      setNotifications([]);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const handleNotificationClick = () => {
    setNotificationsOpen((prev) => {
      const next = !prev;
      if (!prev) {
        fetchNotifications();
      }
      return next;
    });
  };

  const handleNotificationSelect = async (notification) => {
    if (!notification) return;
    if (!notification.isRead) {
      try {
        await markNotificationRead(notification.id);
        setNotifications((prev) =>
          prev.map((item) =>
            item.id === notification.id ? { ...item, isRead: true } : item
          )
        );
        setNotificationCount((prev) => Math.max(prev - 1, 0));
      } catch (error) {
        // ignore mark read errors
      }
    }
    if (notification.metadata?.offerId) {
      navigate(`/lot-details-offers?id=${notification.metadata.requestId}`);
      setNotificationsOpen(false);
    }
  };

  const formatNotificationTime = (timestamp) => {
    if (!timestamp) return '';
    try {
      return new Date(timestamp).toLocaleString();
    } catch (error) {
      return '';
    }
  };

  const handleProfileClick = () => {
    if (authUser) {
      navigate('/user-profile');
    } else {
      navigate('/login-register');
    }
  };

  const handleAuthClick = () => {
    if (authUser) {
      logout?.();
      navigate('/login-register');
    } else {
      navigate('/login-register');
    }
  };

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Close mobile menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && !event.target.closest('.mobile-menu-container')) {
        setIsMobileMenuOpen(false);
      }
      if (notificationsOpen && notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMobileMenuOpen, notificationsOpen]);

  useEffect(() => {
    setAuthUser(user ?? null);
    const count = user?.stats?.unreadNotifications ?? 0;
    setNotificationCount(count);
  }, [user]);

  const userInitials = authUser?.fullName
    ? authUser.fullName.split(' ').map((part) => part.charAt(0)).join('').slice(0, 2).toUpperCase()
    : null;

  return (
    <header className="fixed top-0 left-0 right-0 bg-surface border-b border-border z-100">
      <div className="mx-4 lg:mx-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={() => navigate('/dashboard-home')}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity duration-200"
            >
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Icon name="Gavel" size={20} color="white" />
              </div>
              <span className="text-xl font-semibold text-text-primary hidden sm:block">
                Lotbuy
              </span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`nav-tab relative px-4 py-2 rounded-md transition-all duration-200 ${
                  isActiveTab(item.path)
                    ? 'nav-tab-active bg-primary-50 text-primary' :'text-text-secondary hover:text-text-primary hover:bg-secondary-100'
                }`}
                title={item.tooltip}
              >
                <div className="flex items-center space-x-2">
                  <Icon name={item.icon} size={18} />
                  <span className="font-medium">{item.label}</span>
                </div>
                {isActiveTab(item.path) && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-primary rounded-full" />
                )}
              </button>
            ))}
          </nav>

          {/* Search Bar */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <div className="relative">
                <Icon
                  name="Search"
                  size={18}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  placeholder="Search lots..."
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg transition-all duration-200 ${
                    isSearchFocused
                      ? 'border-primary-500 ring-2 ring-primary-100' :'border-border hover:border-secondary-300'
                  } bg-background focus:bg-surface`}
                />
              </div>
            </form>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2">
            {/* Mobile Search */}
            <button
              onClick={() => navigate('/browse-lots')}
              className="md:hidden p-2 text-text-secondary hover:text-text-primary hover:bg-secondary-100 rounded-lg transition-all duration-200"
            >
              <Icon name="Search" size={20} />
            </button>

            {/* Notifications */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={handleNotificationClick}
                className={`relative p-2 rounded-lg transition-all duration-200 ${
                  notificationsOpen
                    ? 'text-primary bg-primary-50'
                    : 'text-text-secondary hover:text-text-primary hover:bg-secondary-100'
                }`}
              >
                <Icon name="Bell" size={20} />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 notification-badge min-w-[18px] h-[18px] flex items-center justify-center text-xs">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-surface border border-border rounded-xl shadow-xl overflow-hidden z-100">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <span className="font-semibold text-sm text-text-primary">Notifications</span>
                    {notificationCount > 0 && (
                      <span className="text-xs text-text-secondary">{notificationCount} unread</span>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {loadingNotifications ? (
                      <div className="py-6 text-center text-text-secondary text-sm">Loading...</div>
                    ) : notifications.length === 0 ? (
                      <div className="py-6 text-center text-text-secondary text-sm">No notifications yet</div>
                    ) : (
                      notifications.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleNotificationSelect(item)}
                          className={`w-full text-left px-4 py-3 flex flex-col space-y-1 transition-colors duration-200 ${
                            item.isRead ? 'bg-surface hover:bg-secondary-50' : 'bg-primary-50/40 hover:bg-primary-50'
                          }`}
                        >
                          <span className="text-sm font-medium text-text-primary line-clamp-1">{item.title}</span>
                          {item.body && (
                            <span className="text-xs text-text-secondary line-clamp-2">{item.body}</span>
                          )}
                          <span className="text-[11px] text-text-tertiary">{formatNotificationTime(item.createdAt)}</span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile/Auth */}
            {authUser ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleAuthClick}
                  className="p-2 text-text-secondary hover:text-error-600 hover:bg-error-50 rounded-lg transition-all duration-200"
                  title="Sign out"
                >
                  <Icon name="LogOut" size={20} />
                </button>
                <button
                  onClick={handleProfileClick}
                  className="w-10 h-10 rounded-full bg-primary-100 text-primary font-semibold flex items-center justify-center hover:bg-primary-200 transition-all duration-200"
                  title="View profile"
                >
                  {authUser.avatarUrl ? (
                    <img
                      src={authUser.avatarUrl}
                      alt={authUser.fullName}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <span>{userInitials ?? 'U'}</span>
                  )}
                </button>
              </div>
            ) : (
              <button
                onClick={handleAuthClick}
                className="p-2 text-text-secondary hover:text-text-primary hover:bg-secondary-100 rounded-lg transition-all duration-200"
              >
                <Icon name="LogIn" size={20} />
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-text-secondary hover:text-text-primary hover:bg-secondary-100 rounded-lg transition-all duration-200 mobile-menu-container"
            >
              <Icon name={isMobileMenuOpen ? "X" : "Menu"} size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-surface border-t border-border mobile-menu-container animation-slide-in">
          <div className="px-4 py-2 space-y-1">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="mb-3">
              <div className="relative">
                <Icon
                  name="Search"
                  size={18}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search lots..."
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all duration-200"
                />
              </div>
            </form>

            {/* Mobile Navigation Items */}
            {navigationItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                  isActiveTab(item.path)
                    ? 'bg-primary-50 text-primary border-l-4 border-primary' :'text-text-secondary hover:text-text-primary hover:bg-secondary-100'
                }`}
              >
                <Icon name={item.icon} size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}

            {/* Mobile Auth Button */}
            <button
              onClick={handleAuthClick}
              className="w-full flex items-center space-x-3 px-3 py-3 text-text-secondary hover:text-text-primary hover:bg-secondary-100 rounded-lg transition-all duration-200 mt-2 border-t border-border pt-4"
            >
              <Icon name={authUser ? 'LogOut' : 'LogIn'} size={20} />
              <span className="font-medium">{authUser ? 'Sign Out' : 'Sign In'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;