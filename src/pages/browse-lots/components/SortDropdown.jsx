import React, { useState, useRef, useEffect } from 'react';
import Icon from 'components/AppIcon';

const SortDropdown = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const sortOptions = [
    { value: 'newest', label: 'Newest First', icon: 'Clock' },
    { value: 'budget-high', label: 'Highest Budget', icon: 'TrendingUp' },
    { value: 'budget-low', label: 'Lowest Budget', icon: 'TrendingDown' },
    { value: 'ending-soon', label: 'Ending Soon', icon: 'Timer' },
    { value: 'popular', label: 'Most Popular', icon: 'Heart' }
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOptionClick = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const getCurrentOption = () => {
    return sortOptions.find(option => option.value === value) || sortOptions[0];
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-surface border border-border rounded-lg hover:bg-secondary-50 transition-all duration-200"
      >
        <Icon name="ArrowUpDown" size={18} />
        <span className="font-medium">{getCurrentOption().label}</span>
        <Icon 
          name={isOpen ? "ChevronUp" : "ChevronDown"} 
          size={16} 
          className="text-text-secondary"
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-surface rounded-lg shadow-lg border border-border z-50 animation-slide-in">
          <div className="py-2">
            {sortOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleOptionClick(option.value)}
                className={`w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-secondary-50 transition-colors duration-200 ${
                  value === option.value ? 'bg-primary-50 text-primary' : 'text-text-primary'
                }`}
              >
                <Icon 
                  name={option.icon} 
                  size={16} 
                  className={value === option.value ? 'text-primary' : 'text-text-secondary'}
                />
                <span className="text-sm font-medium">{option.label}</span>
                {value === option.value && (
                  <Icon name="Check" size={14} className="ml-auto text-primary" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SortDropdown;