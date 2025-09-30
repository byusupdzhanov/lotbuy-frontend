import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from 'components/AppIcon';

const NotFound = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/dashboard-home');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="w-32 h-32 mx-auto bg-primary-50 rounded-full flex items-center justify-center mb-6">
            <Icon name="Search" size={64} className="text-primary" />
          </div>
          <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-text-primary mb-2">
            Page Not Found
          </h2>
          <p className="text-text-secondary mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={handleGoHome}
            className="btn-primary w-full py-3 rounded-lg font-medium flex items-center justify-center space-x-2"
          >
            <Icon name="Home" size={18} />
            <span>Go to Dashboard</span>
          </button>
          
          <button
            onClick={handleGoBack}
            className="btn-secondary w-full py-3 rounded-lg font-medium flex items-center justify-center space-x-2"
          >
            <Icon name="ArrowLeft" size={18} />
            <span>Go Back</span>
          </button>
        </div>

        {/* Help Links */}
        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-sm text-text-secondary mb-4">
            Need help? Try these popular pages:
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <button
              onClick={() => navigate('/browse-lots')}
              className="text-primary hover:underline"
            >
              Browse Lots
            </button>
            <button
              onClick={() => navigate('/create-lot')}
              className="text-primary hover:underline"
            >
              Create Lot
            </button>
            <button
              onClick={() => navigate('/user-profile')}
              className="text-primary hover:underline"
            >
              Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;