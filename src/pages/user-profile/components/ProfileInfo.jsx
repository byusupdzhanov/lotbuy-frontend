import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';

const ProfileInfo = ({ profileData, isEditing, onEditToggle, onSave }) => {
  const [formData, setFormData] = useState({
    firstName: profileData.firstName || '',
    lastName: profileData.lastName || '',
    email: profileData.email || '',
    phone: profileData.phone || '',
    location: profileData.location || '',
    bio: profileData.bio || '',
    avatar: profileData.avatar || ''
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (formData.phone && !/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: profileData.firstName || '',
      lastName: profileData.lastName || '',
      email: profileData.email || '',
      phone: profileData.phone || '',
      location: profileData.location || '',
      bio: profileData.bio || '',
      avatar: profileData.avatar || ''
    });
    setErrors({});
    onEditToggle();
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // In a real app, you would upload to a server
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          avatar: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8">
      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-text-primary">Profile Information</h2>
        <div className="flex space-x-3">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="btn-secondary px-4 py-2 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="btn-primary px-4 py-2 rounded-lg font-medium"
              >
                Save Changes
              </button>
            </>
          ) : (
            <button
              onClick={onEditToggle}
              className="btn-primary px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
            >
              <Icon name="Edit3" size={18} />
              <span>Edit Profile</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Photo Section */}
        <div className="lg:col-span-1">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Profile Photo</h3>
            <div className="text-center">
              <div className="relative inline-block mb-4">
                <Image
                  src={formData.avatar}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-primary-100"
                />
                {isEditing && (
                  <label className="absolute bottom-0 right-0 w-10 h-10 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-700 transition-colors duration-200">
                    <Icon name="Camera" size={18} color="white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              {isEditing && (
                <p className="text-sm text-text-secondary">
                  Click the camera icon to upload a new photo
                </p>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="card p-6 mt-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Activity Overview</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Lots Created</span>
                <span className="font-semibold text-text-primary">{profileData.stats?.lotsCreated || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Offers Made</span>
                <span className="font-semibold text-text-primary">{profileData.stats?.offersMade || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Deals Completed</span>
                <span className="font-semibold text-text-primary">{profileData.stats?.dealsCompleted || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Total Value</span>
                <span className="font-semibold text-success-600">
                  ${(profileData.stats?.totalValue || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details Section */}
        <div className="lg:col-span-2">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-6">Personal Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  First Name *
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`input-field w-full ${errors.firstName ? 'border-error-500' : ''}`}
                    placeholder="Enter first name"
                  />
                ) : (
                  <p className="py-2 text-text-primary">{profileData.firstName}</p>
                )}
                {errors.firstName && (
                  <p className="text-error-500 text-xs mt-1">{errors.firstName}</p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Last Name *
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`input-field w-full ${errors.lastName ? 'border-error-500' : ''}`}
                    placeholder="Enter last name"
                  />
                ) : (
                  <p className="py-2 text-text-primary">{profileData.lastName}</p>
                )}
                {errors.lastName && (
                  <p className="text-error-500 text-xs mt-1">{errors.lastName}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Email Address *
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`input-field w-full ${errors.email ? 'border-error-500' : ''}`}
                    placeholder="Enter email address"
                  />
                ) : (
                  <p className="py-2 text-text-primary">{profileData.email}</p>
                )}
                {errors.email && (
                  <p className="text-error-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`input-field w-full ${errors.phone ? 'border-error-500' : ''}`}
                    placeholder="Enter phone number"
                  />
                ) : (
                  <p className="py-2 text-text-primary">{profileData.phone || 'Not provided'}</p>
                )}
                {errors.phone && (
                  <p className="text-error-500 text-xs mt-1">{errors.phone}</p>
                )}
              </div>

              {/* Location */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Location
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="input-field w-full"
                    placeholder="Enter your location"
                  />
                ) : (
                  <p className="py-2 text-text-primary">{profileData.location || 'Not provided'}</p>
                )}
              </div>

              {/* Bio */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Biography
                </label>
                {isEditing ? (
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={6}
                    className="input-field w-full resize-none"
                    placeholder="Tell others about yourself, your trading experience, and what you're looking for..."
                  />
                ) : (
                  <div className="py-2 text-text-primary whitespace-pre-wrap">
                    {profileData.bio || 'No biography provided'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileInfo;