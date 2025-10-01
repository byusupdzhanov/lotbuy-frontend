import React, { useCallback, useEffect, useState } from 'react';
import Header from 'components/ui/Header';
import Icon from 'components/AppIcon';
import ProfileInfo from './components/ProfileInfo';
import Settings from './components/Settings';
import TransactionHistory from './components/TransactionHistory';
import Reviews from './components/Reviews';
import { useAuth } from 'context/AuthContext';
import { getCurrentUser, updateCurrentUser } from 'lib/api/users';
import { uploadImage as uploadImageFile } from 'lib/api/uploads';
import { listDeals } from 'lib/api/deals';
import { APIError } from 'lib/api/client';

const UserProfile = () => {
  const { user, setUser, refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [deals, setDeals] = useState([]);
  const [loadingDeals, setLoadingDeals] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const loadProfile = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await getCurrentUser();
      setProfile(data);
      setUser?.(data);
    } catch (err) {
      const msg = err instanceof APIError ? err.message : 'Failed to load profile.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [setUser]);

  const loadDeals = useCallback(async (userId) => {
    if (!userId) return;
    setLoadingDeals(true);
    try {
      const data = await listDeals();
      const filtered = Array.isArray(data)
        ? data.filter((deal) => deal.request?.buyerId === userId)
        : [];
      setDeals(filtered);
    } catch (err) {
      // Ignore errors here; history tab will show empty state
      setDeals([]);
    } finally {
      setLoadingDeals(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    if (profile?.id) {
      loadDeals(profile.id);
    }
  }, [profile?.id, loadDeals]);

  const handleSave = async (updates) => {
    setSaving(true);
    setError(null);
    try {
      const updated = await updateCurrentUser({ fullName: updates.fullName });
      setProfile(updated);
      await refreshUser?.();
      setMessage('Profile updated successfully.');
    } catch (err) {
      const msg = err instanceof APIError ? err.message : 'Failed to update profile.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleUploadAvatar = async (file) => {
    setSaving(true);
    setError(null);
    try {
      const upload = await uploadImageFile(file);
      const updated = await updateCurrentUser({ avatarUrl: upload.url });
      setProfile(updated);
      await refreshUser?.();
      setMessage('Profile photo updated.');
    } catch (err) {
      const msg = err instanceof APIError ? err.message : 'Failed to update profile photo.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const getLocation = (lot) => {
    if (!lot) return null;
    const parts = [lot.locationCity, lot.locationRegion, lot.locationCountry].filter(Boolean);
    return parts.length ? parts.join(', ') : null;
  };

  const stats = profile?.stats ?? user?.stats ?? {};
  const activeLots = profile?.activeLots ?? [];

  const tabs = [
    {
      id: 'profile',
      label: 'Profile Info',
      icon: 'User',
      render: () => (
        <ProfileInfo
          profile={profile}
          stats={stats}
          activeLots={activeLots}
          saving={saving}
          onSave={handleSave}
          onUploadAvatar={handleUploadAvatar}
        />
      ),
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: 'Settings',
      render: () => <Settings />,
    },
    {
      id: 'history',
      label: 'Transaction History',
      icon: 'History',
      render: () => (
        loadingDeals ? (
          <div className="card p-6 text-center text-text-secondary">
            <Icon name="Loader2" size={24} className="animate-spin mx-auto mb-2" />
            Loading your deals...
          </div>
        ) : (
          <TransactionHistory deals={deals} />
        )
      ),
    },
    {
      id: 'reviews',
      label: 'Reviews',
      icon: 'Star',
      render: () => <Reviews stats={stats} />,
    },
  ];

  const ActiveComponent = tabs.find((tab) => tab.id === activeTab)?.render;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {message && (
            <div className="status-info rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Icon name="Info" size={18} />
                <span>{message}</span>
              </div>
              <button onClick={() => setMessage(null)} className="text-sm text-text-secondary hover:text-text-primary">
                Dismiss
              </button>
            </div>
          )}

          {error && (
            <div className="status-error rounded-lg p-4 flex items-center space-x-2">
              <Icon name="AlertCircle" size={18} />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="h-80 bg-secondary-100 rounded-xl animate-pulse" />
          ) : !profile ? (
            <div className="bg-surface border border-border rounded-xl p-10 text-center">
              <Icon name="User" size={40} className="mx-auto text-secondary-300 mb-4" />
              <h2 className="text-xl font-semibold text-text-primary mb-2">Profile unavailable</h2>
              <p className="text-text-secondary">We could not load your profile information.</p>
            </div>
          ) : (
            <>
              <div className="bg-surface border border-border rounded-xl p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex items-start space-x-4">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-primary-100">
                    <AppImage
                      src={profile.avatarUrl || undefined}
                      alt={profile.fullName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <h1 className="text-2xl font-bold text-text-primary">{profile.fullName}</h1>
                      <span className="text-sm text-text-secondary">@{profile.email?.split('@')[0]}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-text-secondary">
                      <span className="inline-flex items-center space-x-1">
                        <Icon name="Calendar" size={14} />
                        <span>Member since {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '—'}</span>
                      </span>
                      {getLocation(activeLots[0]) && (
                        <span className="inline-flex items-center space-x-1">
                          <Icon name="MapPin" size={14} />
                          <span>{getLocation(activeLots[0])}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-lg font-semibold text-text-primary">{stats.completedDeals ?? 0}</p>
                    <p className="text-xs text-text-secondary">Deals</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-text-primary">{stats.activeLots ?? 0}</p>
                    <p className="text-xs text-text-secondary">Active lots</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-text-primary">{stats.offersMade ?? 0}</p>
                    <p className="text-xs text-text-secondary">Offers made</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-text-primary">{stats.pendingOffers ?? 0}</p>
                    <p className="text-xs text-text-secondary">Pending offers</p>
                  </div>
                </div>
              </div>

              <div className="bg-surface border border-border rounded-xl">
                <nav className="flex flex-wrap items-center gap-4 px-6 py-4 border-b border-border">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 text-sm font-medium px-3 py-2 rounded-lg transition-colors duration-200 ${
                        activeTab === tab.id ? 'bg-primary-50 text-primary' : 'text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      <Icon name={tab.icon} size={16} />
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </nav>

                <div className="p-6 bg-background">
                  {ActiveComponent && ActiveComponent()}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
