import React, { useEffect, useState } from 'react';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';

const ProfileInfo = ({ profile, saving, onSave, onUploadAvatar }) => {
  const [fullName, setFullName] = useState(profile?.fullName || '');
  const [error, setError] = useState(null);

  useEffect(() => {
    setFullName(profile?.fullName || '');
    setError(null);
  }, [profile?.fullName]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!fullName.trim()) {
      setError('Full name is required.');
      return;
    }
    onSave({ fullName: fullName.trim() });
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    onUploadAvatar(file);
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-text-primary">Profile information</h2>
          <p className="text-sm text-text-secondary mt-1">
            Update the information other users will see on the marketplace.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <label className="btn-secondary px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 cursor-pointer">
            <Icon name="Camera" size={16} />
            <span>Change photo</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </label>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-secondary-100">
          <Image
            src={profile?.avatarUrl || undefined}
            alt={profile?.fullName || 'User avatar'}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="space-y-1 text-sm text-text-secondary">
          <div className="flex items-center space-x-2">
            <Icon name="Mail" size={16} />
            <span>{profile?.email}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Icon name="User" size={16} />
            <span>Joined {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'recently'}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">Full name *</label>
          <input
            type="text"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            className="input-field"
            placeholder="Your full name"
          />
          {error && <p className="text-xs text-error-500 mt-1">{error}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">Email</label>
          <input type="email" value={profile?.email || ''} disabled className="input-field bg-secondary-50" />
          <p className="text-xs text-text-secondary mt-1">Email address cannot be changed at this time.</p>
        </div>

        <div className="flex items-center justify-end space-x-3">
          <button type="submit" disabled={saving} className="btn-primary px-5 py-2 rounded-lg text-sm font-medium">
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileInfo;
