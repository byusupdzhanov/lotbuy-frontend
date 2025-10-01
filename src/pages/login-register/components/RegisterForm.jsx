import React, { useState } from 'react';
import Icon from 'components/AppIcon';

const RegisterForm = ({ onSuccess, isLoading, setIsLoading }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'buyer',
    acceptTerms: false,
    acceptMarketing: false
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'You must accept the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors((prev) => ({ ...prev, submit: '' }));

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          password: formData.password,
          userType: formData.userType
        })
      });

      let payload = null;
      try {
        payload = await response.clone().json();
      } catch (jsonError) {
        payload = null;
      }

      if (!response.ok) {
        const message = typeof payload?.error === 'string'
          ? payload.error
          : 'Registration failed. Please try again.';
        setErrors({ submit: message });
        return;
      }

      if (payload) {
        onSuccess(payload);
      }

    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ submit: 'Unable to reach the server. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-text-primary mb-2">
            First Name
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            className={`input-field w-full ${errors.firstName ? 'border-error-500 focus:ring-error-500' : ''}`}
            placeholder="John"
            disabled={isLoading}
          />
          {errors.firstName && (
            <p className="text-error-500 text-sm mt-1">{errors.firstName}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-text-primary mb-2">
            Last Name
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            className={`input-field w-full ${errors.lastName ? 'border-error-500 focus:ring-error-500' : ''}`}
            placeholder="Doe"
            disabled={isLoading}
          />
          {errors.lastName && (
            <p className="text-error-500 text-sm mt-1">{errors.lastName}</p>
          )}
        </div>
      </div>

      {/* Email Field */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
          Email Address
        </label>
        <div className="relative">
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={`input-field w-full pl-10 ${errors.email ? 'border-error-500 focus:ring-error-500' : ''}`}
            placeholder="john@example.com"
            disabled={isLoading}
          />
          <Icon 
            name="Mail" 
            size={18} 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" 
          />
        </div>
        {errors.email && (
          <p className="text-error-500 text-sm mt-1">{errors.email}</p>
        )}
      </div>

      {/* User Type Selection */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-3">
          I want to primarily:
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className={`relative flex items-center p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
            formData.userType === 'buyer' ?'border-primary bg-primary-50' :'border-border hover:border-secondary-300'
          }`}>
            <input
              type="radio"
              name="userType"
              value="buyer"
              checked={formData.userType === 'buyer'}
              onChange={handleInputChange}
              className="sr-only"
              disabled={isLoading}
            />
            <div className="flex items-center space-x-3">
              <Icon name="ShoppingCart" size={20} className={formData.userType === 'buyer' ? 'text-primary' : 'text-text-secondary'} />
              <div>
                <p className={`font-medium ${formData.userType === 'buyer' ? 'text-primary' : 'text-text-primary'}`}>
                  Buy Items
                </p>
                <p className="text-xs text-text-secondary">Create lots to receive offers</p>
              </div>
            </div>
          </label>
          
          <label className={`relative flex items-center p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
            formData.userType === 'seller' ?'border-primary bg-primary-50' :'border-border hover:border-secondary-300'
          }`}>
            <input
              type="radio"
              name="userType"
              value="seller"
              checked={formData.userType === 'seller'}
              onChange={handleInputChange}
              className="sr-only"
              disabled={isLoading}
            />
            <div className="flex items-center space-x-3">
              <Icon name="Tag" size={20} className={formData.userType === 'seller' ? 'text-primary' : 'text-text-secondary'} />
              <div>
                <p className={`font-medium ${formData.userType === 'seller' ? 'text-primary' : 'text-text-primary'}`}>
                  Sell Items
                </p>
                <p className="text-xs text-text-secondary">Make offers on buyer lots</p>
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Password Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`input-field w-full pl-10 pr-10 ${errors.password ? 'border-error-500 focus:ring-error-500' : ''}`}
              placeholder="••••••••"
              disabled={isLoading}
            />
            <Icon 
              name="Lock" 
              size={18} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" 
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary"
              disabled={isLoading}
            >
              <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={18} />
            </button>
          </div>
          {errors.password && (
            <p className="text-error-500 text-sm mt-1">{errors.password}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-primary mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className={`input-field w-full pl-10 pr-10 ${errors.confirmPassword ? 'border-error-500 focus:ring-error-500' : ''}`}
              placeholder="••••••••"
              disabled={isLoading}
            />
            <Icon 
              name="Lock" 
              size={18} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" 
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary"
              disabled={isLoading}
            >
              <Icon name={showConfirmPassword ? 'EyeOff' : 'Eye'} size={18} />
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-error-500 text-sm mt-1">{errors.confirmPassword}</p>
          )}
        </div>
      </div>

      {/* Terms and Marketing */}
      <div className="space-y-3">
        <label className="flex items-start space-x-3">
          <input
            type="checkbox"
            name="acceptTerms"
            checked={formData.acceptTerms}
            onChange={handleInputChange}
            className={`mt-1 rounded border-border focus:ring-primary-500 focus:border-primary-500 ${
              errors.acceptTerms ? 'border-error-500' : ''
            }`}
            disabled={isLoading}
          />
          <span className="text-sm text-text-secondary">
            I agree to the{' '}
            <button type="button" className="text-primary hover:underline">
              Terms of Service
            </button>{' '}
            and{' '}
            <button type="button" className="text-primary hover:underline">
              Privacy Policy
            </button>
          </span>
        </label>
        {errors.acceptTerms && (
          <p className="text-error-500 text-sm">{errors.acceptTerms}</p>
        )}
        
        <label className="flex items-start space-x-3">
          <input
            type="checkbox"
            name="acceptMarketing"
            checked={formData.acceptMarketing}
            onChange={handleInputChange}
            className="mt-1 rounded border-border focus:ring-primary-500 focus:border-primary-500"
            disabled={isLoading}
          />
          <span className="text-sm text-text-secondary">
            I'd like to receive updates about new features and marketplace tips
          </span>
        </label>
      </div>

      {/* Submit Error */}
      {errors.submit && (
        <div className="status-error rounded-lg p-3">
          <p className="text-sm">{errors.submit}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="btn-primary w-full py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        {isLoading ? (
          <>
            <Icon name="Loader2" size={18} className="animate-spin" />
            <span>Creating Account...</span>
          </>
        ) : (
          <>
            <Icon name="UserPlus" size={18} />
            <span>Create Account</span>
          </>
        )}
      </button>
    </form>
  );
};

export default RegisterForm;