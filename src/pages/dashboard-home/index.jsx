import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from 'components/ui/Header';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';
import RecentActivity from './components/RecentActivity';
import QuickStats from './components/QuickStats';
import ActiveLots from './components/ActiveLots';
import PendingOffers from './components/PendingOffers';

const DashboardHome = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [dashboardData, setDashboardData] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Mock user data
  useEffect(() => {
    const mockUser = {
      id: 1,
      name: "John Smith",
      email: "john.smith@example.com",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      rating: 4.8,
      totalDeals: 23,
      memberSince: "2023-01-15"
    };

    const mockDashboardData = {
      quickStats: {
        activeLots: 3,
        pendingOffers: 8,
        ongoingDeals: 2,
        unreadMessages: 5
      },
      recentActivity: [
        {
          id: 1,
          type: 'offer_received',
          title: 'New offer received',
          description: 'Sarah Johnson made an offer on your iPhone 15 Pro lot',
          timestamp: '2 minutes ago',
          icon: 'DollarSign',
          iconColor: 'text-success-500',
          actionLabel: 'View Offer',
          actionPath: '/lot-details-offers'
        },
        {
          id: 2,
          type: 'message',
          title: 'New message',
          description: 'Mike Chen sent you a message about MacBook Pro deal',
          timestamp: '15 minutes ago',
          icon: 'MessageCircle',
          iconColor: 'text-primary',
          actionLabel: 'Reply',
          actionPath: '/user-profile'
        },
        {
          id: 3,
          type: 'lot_created',
          title: 'Lot created successfully',
          description: 'Your Gaming Laptop lot is now live and accepting offers',
          timestamp: '1 hour ago',
          icon: 'CheckCircle',
          iconColor: 'text-success-500',
          actionLabel: 'View Lot',
          actionPath: '/lot-details-offers'
        },
        {
          id: 4,
          type: 'deal_completed',
          title: 'Deal completed',
          description: 'Successfully completed deal for Office Chair with Emma Wilson',
          timestamp: '3 hours ago',
          icon: 'Handshake',
          iconColor: 'text-accent-500',
          actionLabel: 'Rate Seller',
          actionPath: '/user-profile'
        },
        {
          id: 5,
          type: 'offer_expired',
          title: 'Offer expired',
          description: 'Offer deadline passed for Smartphone lot - 3 offers received',
          timestamp: '1 day ago',
          icon: 'Clock',
          iconColor: 'text-warning-500',
          actionLabel: 'Review Offers',
          actionPath: '/lot-details-offers'
        }
      ],
      activeLots: [
        {
          id: 1,
          title: "iPhone 15 Pro - 256GB",
          description: "Looking for a new iPhone 15 Pro in Space Black color, 256GB storage",
          budget: "$800 - $1000",
          offersCount: 5,
          timeLeft: "2 days left",
          status: "active",
          image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&h=200&fit=crop"
        },
        {
          id: 2,
          title: "Gaming Laptop - RTX 4070",
          description: "Need a powerful gaming laptop with RTX 4070 or better graphics card",
          budget: "$1200 - $1800",
          offersCount: 3,
          timeLeft: "5 days left",
          status: "active",
          image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=300&h=200&fit=crop"
        },
        {
          id: 3,
          title: "Professional Camera Kit",
          description: "Looking for Canon EOS R5 or similar with lens kit for photography business",
          budget: "$2000 - $3000",
          offersCount: 2,
          timeLeft: "1 week left",
          status: "active",
          image: "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=300&h=200&fit=crop"
        }
      ],
      pendingOffers: [
        {
          id: 1,
          lotTitle: "iPhone 15 Pro - 256GB",
          sellerName: "Sarah Johnson",
          sellerAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=50&h=50&fit=crop&crop=face",
          offerAmount: "$950",
          offerDescription: "Brand new iPhone 15 Pro, still sealed in box with full warranty",
          timeReceived: "2 hours ago",
          rating: 4.9,
          completedDeals: 15
        },
        {
          id: 2,
          lotTitle: "iPhone 15 Pro - 256GB",
          sellerName: "Mike Rodriguez",
          sellerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face",
          offerAmount: "$920",
          offerDescription: "Excellent condition iPhone 15 Pro, used for 2 months with case and screen protector",
          timeReceived: "4 hours ago",
          rating: 4.7,
          completedDeals: 8
        },
        {
          id: 3,
          lotTitle: "Gaming Laptop - RTX 4070",
          sellerName: "Alex Chen",
          sellerAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face",
          offerAmount: "$1450",
          offerDescription: "ASUS ROG Strix with RTX 4070, 16GB RAM, 1TB SSD. Perfect for gaming and work",
          timeReceived: "1 day ago",
          rating: 4.8,
          completedDeals: 12
        }
      ]
    };

    setCurrentUser(mockUser);
    setDashboardData(mockDashboardData);
    setIsLoading(false);
  }, []);

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
    if (activity.actionPath) {
      navigate(activity.actionPath);
    }
  };

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
                  Welcome back, {currentUser?.name?.split(' ')[0]}!
                </h1>
                <p className="text-text-secondary">
                  Manage your lots, review offers, and complete deals all in one place.
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="hidden sm:flex items-center space-x-2 text-sm text-text-secondary">
                  <Icon name="Star" size={16} className="text-accent-500" />
                  <span>{currentUser?.rating} rating</span>
                  <span>•</span>
                  <span>{currentUser?.totalDeals} deals</span>
                </div>
                <button
                  onClick={() => handleQuickAction('view_profile')}
                  className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-200 hover:border-primary-500 transition-colors duration-200"
                >
                  <Image
                    src={currentUser?.avatar}
                    alt={currentUser?.name}
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
          <QuickStats stats={dashboardData.quickStats} />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Active Lots & Pending Offers */}
            <div className="lg:col-span-2 space-y-8">
              <ActiveLots 
                lots={dashboardData.activeLots} 
                onViewLot={(lotId) => navigate('/lot-details-offers')}
              />
              
              <PendingOffers 
                offers={dashboardData.pendingOffers}
                onViewOffer={(offerId) => navigate('/lot-details-offers')}
                onMessageSeller={(sellerId) => navigate('/user-profile')}
              />
            </div>

            {/* Right Column - Recent Activity */}
            <div className="lg:col-span-1">
              <RecentActivity 
                activities={dashboardData.recentActivity}
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