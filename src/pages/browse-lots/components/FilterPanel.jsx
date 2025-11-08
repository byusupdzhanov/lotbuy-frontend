import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Icon from 'components/AppIcon';

const FilterPanel = ({ isOpen, onClose, filters, onFiltersChange }) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    budget: true,
    location: false,
    condition: false,
    advanced: false
  });

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

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

  const categories = [
    'Электроника',
    'Фурнитура',
    'Автомобили',
    'Мода',
    'Дом и Сад',
    'Спорт',
    'Книги и Медиа',
    'Коллекции'
  ];

  const conditions = [
    'New',
    'Used - Excellent',
    'Used - Good',
    'Used - Fair',
    'For Parts'
  ];

  const locations = [
    'San Francisco, CA',
    'New York, NY',
    'Los Angeles, CA',
    'Chicago, IL',
    'Austin, TX',
    'Seattle, WA',
    'Miami, FL',
    'Denver, CO'
  ];

  const handleFilterChange = (key, value) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      category: '',
      budgetMin: '',
      budgetMax: '',
      location: '',
      condition: '',
      lotAge: '',
      sellerRating: ''
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getActiveFilterCount = () => {
    return Object.values(localFilters).filter(value => value !== '').length;
  };

  if (!isOpen) return null;

  const panelContent = (
    <div className="fixed inset-0 z-1000 lg:flex">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-subtle"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="relative ml-auto w-full max-w-md bg-surface h-full overflow-y-auto animation-slide-in">
        {/* Header */}
        <div className="sticky top-0 bg-surface border-b border-border p-4 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-text-primary">Фильтры</h2>
            <button
              onClick={onClose}
              className="p-2 text-text-secondary hover:text-text-primary hover:bg-secondary-100 rounded-lg transition-all duration-200"
            >
              <Icon name="X" size={20} />
            </button>
          </div>
          {getActiveFilterCount() > 0 && (
            <p className="text-sm text-text-secondary mt-1">
              {getActiveFilterCount()} filter{getActiveFilterCount() !== 1 ? 's' : ''} applied
            </p>
          )}
        </div>

        {/* Filter Sections */}
        <div className="p-4 space-y-6">
          {/* Category */}
          <div>
            <button
              onClick={() => toggleSection('category')}
              className="flex items-center justify-between w-full mb-3"
            >
              <h3 className="text-base font-medium text-text-primary">Категория</h3>
              <Icon 
                name={expandedSections.category ? "ChevronUp" : "ChevronDown"} 
                size={18} 
                className="text-text-secondary"
              />
            </button>
            
            {expandedSections.category && (
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="category"
                    value=""
                    checked={localFilters.category === ''}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="mr-3 text-primary focus:ring-primary-500"
                  />
                  <span className="text-sm text-text-secondary">Все категории</span>
                </label>
                {categories.map((category) => (
                  <label key={category} className="flex items-center">
                    <input
                      type="radio"
                      name="category"
                      value={category}
                      checked={localFilters.category === category}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      className="mr-3 text-primary focus:ring-primary-500"
                    />
                    <span className="text-sm text-text-primary">{category}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Budget Range */}
          <div>
            <button
              onClick={() => toggleSection('budget')}
              className="flex items-center justify-between w-full mb-3"
            >
              <h3 className="text-base font-medium text-text-primary">Диапазон бюджета</h3>
              <Icon 
                name={expandedSections.budget ? "ChevronUp" : "ChevronDown"} 
                size={18} 
                className="text-text-secondary"
              />
            </button>
            
            {expandedSections.budget && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      Мин ($)
                    </label>
                    <input
                      type="number"
                      value={localFilters.budgetMin}
                      onChange={(e) => handleFilterChange('budgetMin', e.target.value)}
                      placeholder="0"
                      className="input-field w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      Макс ($)
                    </label>
                    <input
                      type="number"
                      value={localFilters.budgetMax}
                      onChange={(e) => handleFilterChange('budgetMax', e.target.value)}
                      placeholder="Any"
                      className="input-field w-full"
                    />
                  </div>
                </div>
                
                {/* Quick Budget Ranges */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Under $500', min: '', max: '500' },
                    { label: '$500-$1K', min: '500', max: '1000' },
                    { label: '$1K-$5K', min: '1000', max: '5000' },
                    { label: 'Over $5K', min: '5000', max: '' }
                  ].map((range) => (
                    <button
                      key={range.label}
                      onClick={() => {
                        handleFilterChange('budgetMin', range.min);
                        handleFilterChange('budgetMax', range.max);
                      }}
                      className={`px-3 py-2 text-xs rounded-lg border transition-all duration-200 ${
                        localFilters.budgetMin === range.min && localFilters.budgetMax === range.max
                          ? 'bg-primary text-white border-primary' :'bg-surface text-text-secondary border-border hover:border-primary'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Location */}
          <div>
            <button
              onClick={() => toggleSection('location')}
              className="flex items-center justify-between w-full mb-3"
            >
              <h3 className="text-base font-medium text-text-primary">Location</h3>
              <Icon 
                name={expandedSections.location ? "ChevronUp" : "ChevronDown"} 
                size={18} 
                className="text-text-secondary"
              />
            </button>
            
            {expandedSections.location && (
              <div className="space-y-3">
                <input
                  type="text"
                  value={localFilters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  placeholder="Enter city or state"
                  className="input-field w-full"
                />
                
                <div className="space-y-2">
                  <p className="text-sm text-text-secondary">Popular locations:</p>
                  <div className="flex flex-wrap gap-2">
                    {locations.map((location) => (
                      <button
                        key={location}
                        onClick={() => handleFilterChange('location', location)}
                        className={`px-3 py-1 text-xs rounded-full border transition-all duration-200 ${
                          localFilters.location === location
                            ? 'bg-primary text-white border-primary' :'bg-surface text-text-secondary border-border hover:border-primary'
                        }`}
                      >
                        {location.split(',')[0]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Condition */}
          <div>
            <button
              onClick={() => toggleSection('condition')}
              className="flex items-center justify-between w-full mb-3"
            >
              <h3 className="text-base font-medium text-text-primary">Condition</h3>
              <Icon 
                name={expandedSections.condition ? "ChevronUp" : "ChevronDown"} 
                size={18} 
                className="text-text-secondary"
              />
            </button>
            
            {expandedSections.condition && (
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="condition"
                    value=""
                    checked={localFilters.condition === ''}
                    onChange={(e) => handleFilterChange('condition', e.target.value)}
                    className="mr-3 text-primary focus:ring-primary-500"
                  />
                  <span className="text-sm text-text-secondary">Any Condition</span>
                </label>
                {conditions.map((condition) => (
                  <label key={condition} className="flex items-center">
                    <input
                      type="radio"
                      name="condition"
                      value={condition}
                      checked={localFilters.condition === condition}
                      onChange={(e) => handleFilterChange('condition', e.target.value)}
                      className="mr-3 text-primary focus:ring-primary-500"
                    />
                    <span className="text-sm text-text-primary">{condition}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Advanced Filters */}
          <div>
            <button
              onClick={() => toggleSection('advanced')}
              className="flex items-center justify-between w-full mb-3"
            >
              <h3 className="text-base font-medium text-text-primary">Advanced</h3>
              <Icon 
                name={expandedSections.advanced ? "ChevronUp" : "ChevronDown"} 
                size={18} 
                className="text-text-secondary"
              />
            </button>
            
            {expandedSections.advanced && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Lot Age
                  </label>
                  <select
                    value={localFilters.lotAge}
                    onChange={(e) => handleFilterChange('lotAge', e.target.value)}
                    className="input-field w-full"
                  >
                    <option value="">Any time</option>
                    <option value="1">Last 24 hours</option>
                    <option value="3">Last 3 days</option>
                    <option value="7">Last week</option>
                    <option value="30">Last month</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Minimum Seller Rating
                  </label>
                  <select
                    value={localFilters.sellerRating}
                    onChange={(e) => handleFilterChange('sellerRating', e.target.value)}
                    className="input-field w-full"
                  >
                    <option value="">Any rating</option>
                    <option value="4.5">4.5+ stars</option>
                    <option value="4.0">4.0+ stars</option>
                    <option value="3.5">3.5+ stars</option>
                    <option value="3.0">3.0+ stars</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-surface border-t border-border p-4">
          <div className="flex space-x-3">
            <button
              onClick={handleClearFilters}
              className="flex-1 btn-secondary py-3 rounded-lg font-medium"
            >
              Clear All
            </button>
            <button
              onClick={handleApplyFilters}
              className="flex-1 btn-primary py-3 rounded-lg font-medium"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(panelContent, document.body);
};

export default FilterPanel;