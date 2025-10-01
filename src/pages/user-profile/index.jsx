import React, { useCallback, useEffect, useState } from 'react';
import Header from 'components/ui/Header';
import Icon from 'components/AppIcon';
import ProfileInfo from './components/ProfileInfo';
import { useAuth } from 'context/AuthContext';
import { getCurrentUser, updateCurrentUser } from 'lib/api/users';
import { uploadImage as uploadImageFile } from 'lib/api/uploads';
import { APIError } from 'lib/api/client';

const UserProfile = () => {
  const { user, setUser, refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

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

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

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

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="pt-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Your profile</h1>
            <p className="text-text-secondary mt-1">
              Manage how other users see you and keep your information up to date.
            </p>
          </div>

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
          ) : profile ? (
            <ProfileInfo
              profile={profile}
              saving={saving}
              onSave={handleSave}
              onUploadAvatar={handleUploadAvatar}
            />
          ) : (
            <div className="bg-surface border border-border rounded-xl p-10 text-center">
              <Icon name="User" size={40} className="mx-auto text-secondary-300 mb-4" />
              <h2 className="text-xl font-semibold text-text-primary mb-2">Profile unavailable</h2>
              <p className="text-text-secondary">We could not load your profile information.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
