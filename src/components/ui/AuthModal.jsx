import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Icon from '../AppIcon';

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [mode, setMode] = useState(initialMode);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    acceptTerms: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Reset form when modal opens/closes or mode changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        acceptTerms: false
      });
      setErrors({});
    }
  }, [isOpen, mode]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

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

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email обязателен';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Пожалуйста введите корректный email';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Пароль обязателен';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Пароль должен быть не менее 6 символов';
    }

    // Register-specific validation
    if (mode === 'register') {
      if (!formData.firstName) {
        newErrors.firstName = 'Имя обязательно';
      }
      if (!formData.lastName) {
        newErrors.lastName = 'Фамилия обязательна';
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Пожалуйста подтвердите пароль';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Пароли не совпадают';
      }
      if (!formData.acceptTerms) {
        newErrors.acceptTerms = 'Вы должны принять условия обслуживания';
      }
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

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Handle successful authentication
      console.log(`${mode} successful:`, formData);
      onClose();
      
      // In real app, you would handle authentication state here
      // e.g., store token, update user context, redirect, etc.
      
    } catch (error) {
      console.error(`${mode} error:`, error);
      setErrors({ submit: 'An error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSocialAuth = (provider) => {
    console.log(`${provider} authentication`);
    // Handle social authentication
  };

  if (!isOpen) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 z-1000 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-subtle animation-fade-in"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-md bg-surface rounded-xl shadow-modal animation-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-2xl font-semibold text-text-primary">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              {mode === 'login' ?'Sign in to your Lotbuy account' :'Join the Lotbuy marketplace'
              }
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-text-secondary hover:text-text-primary hover:bg-secondary-100 rounded-lg transition-all duration-200"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Register-only fields */}
          {mode === 'register' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-text-primary mb-2">
                  Имя
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={`input-field w-full ${errors.firstName ? 'border-error-500 focus:ring-error-500' : ''}`}
                  placeholder="John"
                />
                {errors.firstName && (
                  <p className="text-error-500 text-xs mt-1">{errors.firstName}</p>
                )}
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-text-primary mb-2">
                  Фамилия
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={`input-field w-full ${errors.lastName ? 'border-error-500 focus:ring-error-500' : ''}`}
                  placeholder="Doe"
                />
                {errors.lastName && (
                  <p className="text-error-500 text-xs mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`input-field w-full ${errors.email ? 'border-error-500 focus:ring-error-500' : ''}`}
              placeholder="john@example.com"
            />
            {errors.email && (
              <p className="text-error-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-2">
              Пароль
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`input-field w-full ${errors.password ? 'border-error-500 focus:ring-error-500' : ''}`}
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-error-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password (Register only) */}
          {mode === 'register' && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-primary mb-2">
                Подтверждение пароля
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`input-field w-full ${errors.confirmPassword ? 'border-error-500 focus:ring-error-500' : ''}`}
                placeholder="••••••••"
              />
              {errors.confirmPassword && (
                <p className="text-error-500 text-xs mt-1">{errors.confirmPassword}</p>
              )}
            </div>
          )}

          {/* Terms acceptance (Register only) */}
          {mode === 'register' && (
            <div>
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleInputChange}
                  className={`mt-1 rounded border-border focus:ring-primary-500 focus:border-primary-500 ${
                    errors.acceptTerms ? 'border-error-500' : ''
                  }`}
                />
                <span className="text-sm text-text-secondary">
                  Я соглашаюсь с{' '}
                  <button type="button" className="text-primary hover:underline">
                    Условия обслуживания
                  </button>{' '}
                  and{' '}
                  <button type="button" className="text-primary hover:underline">
                    Политика конфиденциальности
                  </button>
                </span>
              </label>
              {errors.acceptTerms && (
                <p className="text-error-500 text-xs mt-1">{errors.acceptTerms}</p>
              )}
            </div>
          )}

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
                <span>{mode === 'login' ? 'Signing In...' : 'Creating Account...'}</span>
              </>
            ) : (
              <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
            )}
          </button>

          {/* Forgot Password (Login only) */}
          {mode === 'login' && (
            <div className="text-center">
              <button
                type="button"
                className="text-sm text-primary hover:underline"
                onClick={() => console.log('Forgot password')}
              >
                Забыли пароль?
              </button>
            </div>
          )}
        </form>

        {/* Social Auth */}
        <div className="px-6 pb-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-surface text-text-secondary">Or continue with</span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleSocialAuth('google')}
              className="flex items-center justify-center px-4 py-2 border border-border rounded-lg hover:bg-secondary-50 transition-all duration-200"
            >
              <Icon name="Chrome" size={18} className="text-text-secondary" />
              <span className="ml-2 text-sm font-medium text-text-primary">Google</span>
            </button>
            <button
              type="button"
              onClick={() => handleSocialAuth('github')}
              className="flex items-center justify-center px-4 py-2 border border-border rounded-lg hover:bg-secondary-50 transition-all duration-200"
            >
              <Icon name="Github" size={18} className="text-text-secondary" />
              <span className="ml-2 text-sm font-medium text-text-primary">GitHub</span>
            </button>
          </div>
        </div>

        {/* Mode Switch */}
        <div className="px-6 pb-6 text-center border-t border-border pt-6">
          <p className="text-sm text-text-secondary">
            {mode === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
            <button
              type="button"
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-primary hover:underline font-medium"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default AuthModal;