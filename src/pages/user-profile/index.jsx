import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from 'components/ui/Header';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';
import ProfileInfo from './components/ProfileInfo';
import Settings from './components/Settings';
import TransactionHistory from './components/TransactionHistory';
import Reviews from './components/Reviews';

const UserProfile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({});

  // Mock user data
  useEffect(() => {
    setProfileData({
      id: 'user_001',
      username: 'john_trader',
      email: 'john.trader@example.com',
      firstName: 'John',
      lastName: 'Trader',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      memberSince: '2023-01-15',
      location: 'New York, NY',
      phone: '+1 (555) 123-4567',
      bio: `Experienced marketplace trader with a passion for finding unique items and connecting with fellow enthusiasts. I specialize in electronics, vintage collectibles, and home goods. Always looking for fair deals and building lasting relationships in the community.

I believe in transparent communication and quick responses. Feel free to reach out with any questions about my lots or offers!`,
      isVerified: true,
      rating: 4.8,
      totalDeals: 127,
      successRate: 96,
      responseTime: '< 2 hours',
      badges: ['Verified', 'Top Seller', 'Quick Responder'],
      stats: {
        lotsCreated: 89,
        offersMade: 234,
        dealsCompleted: 127,
        totalValue: 45670
      }
    });
  }, []);

  const tabs = [
    {
      id: 'profile',
      label: 'Profile Info',
      icon: 'User',
      component: ProfileInfo
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: 'Settings',
      component: Settings
    },
    {
      id: 'history',
      label: 'Transaction History',
      icon: 'History',
      component: TransactionHistory
    },
    {
      id: 'reviews',
      label: 'Reviews',
      icon: 'Star',
      component: Reviews
    }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setIsEditing(false);
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleSaveProfile = (updatedData) => {
    setProfileData(prev => ({ ...prev, ...updatedData }));
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-16">
        {/* Profile Header */}
        <div className="bg-surface border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              {/* User Info */}
              <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="relative">
                  <Image
                    src={profileData.avatar}
                    alt={`${profileData.firstName} ${profileData.lastName}`}
                    className="w-24 h-24 rounded-full object-cover border-4 border-primary-100"
                  />
                  {profileData.isVerified && (
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-success-500 rounded-full flex items-center justify-center border-2 border-surface">
                      <Icon name="Check" size={16} color="white" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h1 className="text-2xl font-bold text-text-primary">
                      {profileData.firstName} {profileData.lastName}
                    </h1>
                    <span className="text-text-secondary">@{profileData.username}</span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary mb-3">
                    <div className="flex items-center space-x-1">
                      <Icon name="Calendar" size={16} />
                      <span>Member since {new Date(profileData.memberSince).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Icon name="MapPin" size={16} />
                      <span>{profileData.location}</span>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2">
                    {profileData.badges?.map((badge, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="mt-6 lg:mt-0 grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <Icon name="Star" size={16} className="text-warning-500" />
                    <span className="text-2xl font-bold text-text-primary">{profileData.rating}</span>
                  </div>
                  <p className="text-xs text-text-secondary">Rating</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-text-primary">{profileData.totalDeals}</p>
                  <p className="text-xs text-text-secondary">Deals</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-success-600">{profileData.successRate}%</p>
                  <p className="text-xs text-text-secondary">Success Rate</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-text-primary">{profileData.responseTime}</p>
                  <p className="text-xs text-text-secondary">Response Time</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-surface border-b border-border sticky top-16 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-primary text-primary' :'border-transparent text-text-secondary hover:text-text-primary hover:border-secondary-300'
                  }`}
                >
                  <Icon name={tab.icon} size={18} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {ActiveComponent && (
            <ActiveComponent
              profileData={profileData}
              isEditing={isEditing}
              onEditToggle={handleEditToggle}
              onSave={handleSaveProfile}
              navigate={navigate}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;