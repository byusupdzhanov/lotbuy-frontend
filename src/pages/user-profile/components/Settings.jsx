import React, { useState } from 'react';
import Icon from 'components/AppIcon';

const Settings = ({ profileData }) => {
  const [settings, setSettings] = useState({
    notifications: {
      emailOffers: true,
      emailMessages: true,
      emailDeals: true,
      pushOffers: true,
      pushMessages: false,
      pushDeals: true,
      smsImportant: false
    },
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      showPhone: false,
      showLocation: true
    },
    security: {
      twoFactorEnabled: false,
      loginAlerts: true
    }
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 1,
      type: 'card',
      name: 'Visa ending in 4242',
      isDefault: true,
      expiryDate: '12/25'
    },
    {
      id: 2,
      type: 'paypal',
      name: 'PayPal Account',
      isDefault: false,
      email: 'john.trader@example.com'
    }
  ]);

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSettingChange = (category, setting, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    // Handle password change
    console.log('Password change submitted');
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setShowPasswordForm(false);
  };

  const handleAddPaymentMethod = () => {
    console.log('Add payment method');
  };

  const handleRemovePaymentMethod = (id) => {
    setPaymentMethods(prev => prev.filter(method => method.id !== id));
  };

  const handleSetDefaultPayment = (id) => {
    setPaymentMethods(prev => 
      prev.map(method => ({
        ...method,
        isDefault: method.id === id
      }))
    );
  };

  const handleExportData = () => {
    console.log('Export user data');
  };

  const handleDeleteAccount = () => {
    console.log('Delete account');
    setShowDeleteConfirm(false);
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-text-primary">Account Settings</h2>

      {/* Notification Settings */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center space-x-2">
          <Icon name="Bell" size={20} />
          <span>Notification Preferences</span>
        </h3>
        
        <div className="space-y-6">
          <div>
            <h4 className="font-medium text-text-primary mb-3">Email Notifications</h4>
            <div className="space-y-3">
              {[
                { key: 'emailOffers', label: 'New offers on my lots' },
                { key: 'emailMessages', label: 'New messages' },
                { key: 'emailDeals', label: 'Deal updates and completions' }
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center justify-between">
                  <span className="text-text-secondary">{label}</span>
                  <input
                    type="checkbox"
                    checked={settings.notifications[key]}
                    onChange={(e) => handleSettingChange('notifications', key, e.target.checked)}
                    className="rounded border-border focus:ring-primary-500 focus:border-primary-500"
                  />
                </label>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-text-primary mb-3">Push Notifications</h4>
            <div className="space-y-3">
              {[
                { key: 'pushOffers', label: 'New offers on my lots' },
                { key: 'pushMessages', label: 'New messages' },
                { key: 'pushDeals', label: 'Deal updates and completions' }
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center justify-between">
                  <span className="text-text-secondary">{label}</span>
                  <input
                    type="checkbox"
                    checked={settings.notifications[key]}
                    onChange={(e) => handleSettingChange('notifications', key, e.target.checked)}
                    className="rounded border-border focus:ring-primary-500 focus:border-primary-500"
                  />
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center justify-between">
              <span className="text-text-secondary">SMS for important updates</span>
              <input
                type="checkbox"
                checked={settings.notifications.smsImportant}
                onChange={(e) => handleSettingChange('notifications', 'smsImportant', e.target.checked)}
                className="rounded border-border focus:ring-primary-500 focus:border-primary-500"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center space-x-2">
          <Icon name="Shield" size={20} />
          <span>Privacy Settings</span>
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Profile Visibility
            </label>
            <select
              value={settings.privacy.profileVisibility}
              onChange={(e) => handleSettingChange('privacy', 'profileVisibility', e.target.value)}
              className="input-field w-full"
            >
              <option value="public">Public - Anyone can view</option>
              <option value="members">Members Only</option>
              <option value="private">Private - Hidden from search</option>
            </select>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-text-primary">Show in Profile</h4>
            {[
              { key: 'showEmail', label: 'Email address' },
              { key: 'showPhone', label: 'Phone number' },
              { key: 'showLocation', label: 'Location' }
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center justify-between">
                <span className="text-text-secondary">{label}</span>
                <input
                  type="checkbox"
                  checked={settings.privacy[key]}
                  onChange={(e) => handleSettingChange('privacy', key, e.target.checked)}
                  className="rounded border-border focus:ring-primary-500 focus:border-primary-500"
                />
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center space-x-2">
          <Icon name="Lock" size={20} />
          <span>Security</span>
        </h3>
        
        <div className="space-y-6">
          {/* Password Change */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-text-primary">Password</h4>
              <button
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className="text-primary hover:underline text-sm"
              >
                Change Password
              </button>
            </div>
            
            {showPasswordForm && (
              <form onSubmit={handlePasswordSubmit} className="space-y-4 p-4 bg-secondary-50 rounded-lg">
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Current password"
                  className="input-field w-full"
                  required
                />
                <input
                  type="password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="New password"
                  className="input-field w-full"
                  required
                />
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirm new password"
                  className="input-field w-full"
                  required
                />
                <div className="flex space-x-3">
                  <button type="submit" className="btn-primary px-4 py-2 rounded-lg">
                    Update Password
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPasswordForm(false)}
                    className="btn-secondary px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Two-Factor Authentication */}
          <div>
            <label className="flex items-center justify-between">
              <div>
                <span className="font-medium text-text-primary">Two-Factor Authentication</span>
                <p className="text-sm text-text-secondary">Add an extra layer of security to your account</p>
              </div>
              <input
                type="checkbox"
                checked={settings.security.twoFactorEnabled}
                onChange={(e) => handleSettingChange('security', 'twoFactorEnabled', e.target.checked)}
                className="rounded border-border focus:ring-primary-500 focus:border-primary-500"
              />
            </label>
          </div>

          {/* Login Alerts */}
          <div>
            <label className="flex items-center justify-between">
              <div>
                <span className="font-medium text-text-primary">Login Alerts</span>
                <p className="text-sm text-text-secondary">Get notified of new login attempts</p>
              </div>
              <input
                type="checkbox"
                checked={settings.security.loginAlerts}
                onChange={(e) => handleSettingChange('security', 'loginAlerts', e.target.checked)}
                className="rounded border-border focus:ring-primary-500 focus:border-primary-500"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text-primary flex items-center space-x-2">
            <Icon name="CreditCard" size={20} />
            <span>Payment Methods</span>
          </h3>
          <button
            onClick={handleAddPaymentMethod}
            className="btn-primary px-4 py-2 rounded-lg text-sm flex items-center space-x-2"
          >
            <Icon name="Plus" size={16} />
            <span>Add Method</span>
          </button>
        </div>

        <div className="space-y-3">
          {paymentMethods.map((method) => (
            <div key={method.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div className="flex items-center space-x-3">
                <Icon 
                  name={method.type === 'card' ? 'CreditCard' : 'Wallet'} 
                  size={20} 
                  className="text-text-secondary" 
                />
                <div>
                  <p className="font-medium text-text-primary">{method.name}</p>
                  {method.expiryDate && (
                    <p className="text-sm text-text-secondary">Expires {method.expiryDate}</p>
                  )}
                  {method.email && (
                    <p className="text-sm text-text-secondary">{method.email}</p>
                  )}
                </div>
                {method.isDefault && (
                  <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">
                    Default
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {!method.isDefault && (
                  <button
                    onClick={() => handleSetDefaultPayment(method.id)}
                    className="text-primary hover:underline text-sm"
                  >
                    Set Default
                  </button>
                )}
                <button
                  onClick={() => handleRemovePaymentMethod(method.id)}
                  className="text-error-500 hover:underline text-sm"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Data & Account Management */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center space-x-2">
          <Icon name="Database" size={20} />
          <span>Data & Account</span>
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <h4 className="font-medium text-text-primary">Export Your Data</h4>
              <p className="text-sm text-text-secondary">Download a copy of your account data</p>
            </div>
            <button
              onClick={handleExportData}
              className="btn-secondary px-4 py-2 rounded-lg text-sm"
            >
              Export Data
            </button>
          </div>

          <div className="flex items-center justify-between p-4 border border-error-200 rounded-lg bg-error-50">
            <div>
              <h4 className="font-medium text-error-600">Delete Account</h4>
              <p className="text-sm text-error-500">Permanently delete your account and all data</p>
            </div>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-error-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-error-600 transition-colors duration-200"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-1000 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-surface rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Icon name="AlertTriangle" size={24} className="text-error-500" />
              <h3 className="text-lg font-semibold text-text-primary">Delete Account</h3>
            </div>
            <p className="text-text-secondary mb-6">
              Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleDeleteAccount}
                className="bg-error-500 text-white px-4 py-2 rounded-lg hover:bg-error-600 transition-colors duration-200"
              >
                Yes, Delete Account
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn-secondary px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;