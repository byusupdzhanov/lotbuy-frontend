import React, { useState } from 'react';
import Icon from 'components/AppIcon';

const LoginForm = ({ onSuccess, isLoading, setIsLoading }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

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
      newErrors.email = 'вы точно ввели почту?';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Пожалуста, введите корректный email';
    }

    if (!formData.password) {
      newErrors.password = 'кажется, вы забыли ввести пароль';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Пароль должен содержать не менее 8 символов';
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
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
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
          : 'Invalid email or password';
        setErrors({ submit: message });
        return;
      }

      if (payload) {
        onSuccess(payload);
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ submit: 'Unable to reach the server. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    console.log('Forgot password clicked');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email Field */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
          Почта
        </label>
        <div className="relative">
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={`input-field w-full pl-10 ${errors.email ? 'border-error-500 focus:ring-error-500' : ''}`}
            placeholder="Введите вашу почту"
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
          Пароль
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className={`input-field w-full pl-10 pr-10 ${errors.password ? 'border-error-500 focus:ring-error-500' : ''}`}
            placeholder="Введите ваш пароль"
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
          <span className="text-sm text-text-secondary">Запомнить меня</span>
        </label>
        
        <button
          type="button"
          onClick={handleForgotPassword}
          className="text-sm text-primary hover:underline"
          disabled={isLoading}
        >
          Забыли пароль?
        </button>
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
            <span>Выполняем вход...</span>
          </>
        ) : (
          <>
            <Icon name="LogIn" size={18} />
            <span>Войти</span>
          </>
        )}
      </button>
    </form>
  );
};

export default LoginForm;