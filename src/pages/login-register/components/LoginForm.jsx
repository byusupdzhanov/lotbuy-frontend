import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from 'components/AppIcon';

const LoginForm = ({ onSuccess, isLoading, setIsLoading }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  // Mock credentials for testing
  const mockCredentials = {
    email: 'demo@peerauction.com',
    password: 'demo123'
  };

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

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
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
      
      // Check mock credentials
      if (formData.email === mockCredentials.email && formData.password === mockCredentials.password) {
        const userData = {
          id: 1,
          email: formData.email,
          name: 'Demo User',
          role: 'buyer',
          avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
        };
        
        onSuccess(userData);
      } else {
        setErrors({ 
          submit: `Invalid credentials. Use email: ${mockCredentials.email} and password: ${mockCredentials.password}` 
        });
      }
      
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ submit: 'An error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    console.log('Forgot password clicked');
    // In real app, navigate to forgot password page or show modal
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
            placeholder="Enter your email"
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

      {/* Password Field */}
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
            placeholder="Enter your password"
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

      {/* Remember Me & Forgot Password */}
      <div className="flex items-center justify-between">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="rememberMe"
            checked={formData.rememberMe}
            onChange={handleInputChange}
            className="rounded border-border focus:ring-primary-500 focus:border-primary-500"
            disabled={isLoading}
          />
          <span className="text-sm text-text-secondary">Remember me</span>
        </label>
        
        <button
          type="button"
          onClick={handleForgotPassword}
          className="text-sm text-primary hover:underline"
          disabled={isLoading}
        >
          Forgot password?
        </button>
      </div>

      {/* Submit Error */}
      {errors.submit && (
        <div className="status-error rounded-lg p-3">
          <p className="text-sm">{errors.submit}</p>
        </div>
      )}

      {/* Demo Credentials Info */}
      <div className="bg-primary-50 border border-primary-100 rounded-lg p-3">
        <div className="flex items-start space-x-2">
          <Icon name="Info" size={16} className="text-primary mt-0.5" />
          <div>
            <p className="text-sm font-medium text-primary">Demo Credentials</p>
            <p className="text-xs text-primary-700 mt-1">
              Email: {mockCredentials.email}<br />
              Password: {mockCredentials.password}
            </p>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="btn-primary w-full py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        {isLoading ? (
          <>
            <Icon name="Loader2" size={18} className="animate-spin" />
            <span>Signing In...</span>
          </>
        ) : (
          <>
            <Icon name="LogIn" size={18} />
            <span>Sign In</span>
          </>
        )}
      </button>
    </form>
  );
};

export default LoginForm;