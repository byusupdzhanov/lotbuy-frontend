import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from 'components/ui/Header';
import Icon from 'components/AppIcon';
import AppImage from 'components/AppImage';
import RecentActivity from './components/RecentActivity';
import QuickStats from './components/QuickStats';
import ActiveLots from './components/ActiveLots';
import PendingOffers from './components/PendingOffers';
import { useAuth } from 'context/AuthContext';
import { getDashboard } from 'lib/api/dashboard';
import { APIError } from 'lib/api/client';

const DashboardHome = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getDashboard();
      setDashboardData(data);
    } catch (err) {
      const message = err instanceof APIError ? err.message : 'Failed to load dashboard data.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleQuickAction = (action) => {
    switch (action) {
      case 'create_lot': navigate('/create-lot');
        break;
      case 'browse_lots': navigate('/browse-lots');
        break;
      case 'view_profile': navigate('/user-profile');
        break;
      default:
        console.log('Quick action:', action);
    }
  };

  const handleActivityAction = (activity) => {
    if (!activity) return;
    if (activity.metadata?.requestId) {
      navigate(`/lot-details-offers?id=${activity.metadata.requestId}`);
    } else if (activity.actionPath) {
      navigate(activity.actionPath);
    }
  };

  const currentUser = dashboardData?.user || user || null;
  const stats = dashboardData?.stats;

  const quickStats = useMemo(() => ({
    activeLots: stats?.activeLots ?? 0,
    pendingOffers: stats?.pendingOffers ?? 0,
    ongoingDeals: stats?.activeDeals ?? 0,
    unreadMessages: stats?.incomingMessages ?? 0,
  }), [stats]);

  const welcomeName = useMemo(() => {
    if (!currentUser?.fullName) return 'there';
    return currentUser.fullName.split(' ')[0];
  }, [currentUser?.fullName]);

  const profileSummary = useMemo(() => {
    if (!currentUser) return null;
    const ratingSource = typeof currentUser.rating === 'number' ? currentUser.rating : null;
    const derivedRating = stats?.completedDeals
      ? Math.min(5, 4 + stats.completedDeals / 50)
      : null;
    const ratingValue = ratingSource != null ? ratingSource : derivedRating;
    return {
      avatar: currentUser.avatarUrl,
      rating: ratingValue != null ? ratingValue.toFixed(1) : '—',
      deals: currentUser.completedDeals ?? stats?.completedDeals ?? 0,
    };
  }, [currentUser, stats]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-16 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Icon name="Loader2" size={48} className="text-primary animate-spin mx-auto mb-4" />
            <p className="text-text-secondary">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-16 flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md px-6">
            <Icon name="AlertTriangle" size={48} className="text-error-500 mx-auto mb-4" />
            <p className="text-text-primary font-semibold mb-2">{error}</p>
            <p className="text-text-secondary mb-6">Try refreshing the dashboard to load the latest information.</p>
            <button onClick={loadDashboard} className="btn-primary px-5 py-2 rounded-lg text-sm font-medium">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-text-primary mb-2">
                  Welcome back, {welcomeName}!
                </h1>
                <p className="text-text-secondary">
                  Manage your lots, review offers, and complete deals all in one place.
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="hidden sm:flex items-center space-x-2 text-sm text-text-secondary">
                  <Icon name="Star" size={16} className="text-accent-500" />
                  <span>{profileSummary?.rating ?? '—'} rating</span>
                  <span>•</span>
                  <span>{profileSummary?.deals ?? 0} deals</span>
                </div>
                <button
                  onClick={() => handleQuickAction('view_profile')}
                  className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-200 hover:border-primary-500 transition-colors duration-200"
                >
                  <AppImage
                    src={profileSummary?.avatar}
                    alt={currentUser?.fullName}
                    className="w-full h-full object-cover"
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => handleQuickAction('create_lot')}
                className="btn-primary p-6 rounded-xl text-left hover:shadow-md transition-all duration-200 group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <Icon name="Plus" size={24} color="white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Create New Lot</h3>
                    <p className="text-white text-opacity-80 text-sm">Post what you're looking to buy</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleQuickAction('browse_lots')}
                className="btn-secondary p-6 rounded-xl text-left hover:shadow-md transition-all duration-200 group border border-border"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <Icon name="Search" size={24} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary mb-1">Browse Available Lots</h3>
                    <p className="text-text-secondary text-sm">Find lots to make offers on</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <QuickStats stats={quickStats} />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Active Lots & Pending Offers */}
            <div className="lg:col-span-2 space-y-8">
              <ActiveLots
                lots={dashboardData?.activeLots ?? []}
                onViewLot={(lotId) => navigate(`/lot-details-offers?id=${lotId}`)}
              />

              <PendingOffers
                offers={dashboardData?.pendingOffers ?? []}
                onViewOffer={(offer) => navigate(`/lot-details-offers?id=${offer.requestId}`)}
                onMessageSeller={(offer) => navigate(`/lot-details-offers?id=${offer.requestId}&offer=${offer.offer.id}`)}
              />
            </div>

            {/* Right Column - Recent Activity */}
            <div className="lg:col-span-1">
              <RecentActivity
                activities={dashboardData?.notifications ?? []}
                onActivityAction={handleActivityAction}
              />
            </div>
          </div>

          {/* Mobile Bottom Spacing */}
          <div className="h-20 lg:hidden" />
        </div>
      </main>
    </div>
  );
};

export default DashboardHome;