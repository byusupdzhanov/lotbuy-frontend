import React from 'react';
import Icon from 'components/AppIcon';

const FilterChips = ({ filters, searchQuery, onFilterRemove }) => {
  const getActiveFilters = () => {
    const active = [];
    
    if (searchQuery) {
      active.push({
        key: 'search',
        label: `Search: "${searchQuery}"`,
        value: searchQuery
      });
    }
    
    if (filters.category) {
      active.push({
        key: 'category',
        label: `Category: ${filters.category}`,
        value: filters.category
      });
    }
    
    if (filters.budgetMin || filters.budgetMax) {
      let budgetLabel = 'Budget: ';
      if (filters.budgetMin && filters.budgetMax) {
        budgetLabel += `$${parseInt(filters.budgetMin).toLocaleString()} - $${parseInt(filters.budgetMax).toLocaleString()}`;
      } else if (filters.budgetMin) {
        budgetLabel += `Over $${parseInt(filters.budgetMin).toLocaleString()}`;
      } else if (filters.budgetMax) {
        budgetLabel += `Under $${parseInt(filters.budgetMax).toLocaleString()}`;
      }
      
      active.push({
        key: 'budget',
        label: budgetLabel,
        value: `${filters.budgetMin}-${filters.budgetMax}`
      });
    }
    
    if (filters.location) {
      active.push({
        key: 'location',
        label: `Location: ${filters.location}`,
        value: filters.location
      });
    }
    
    if (filters.condition) {
      active.push({
        key: 'condition',
        label: `Condition: ${filters.condition}`,
        value: filters.condition
      });
    }
    
    if (filters.lotAge) {
      const ageLabels = {
        '1': 'Last 24 hours',
        '3': 'Last 3 days',
        '7': 'Last week',
        '30': 'Last month'
      };
      active.push({
        key: 'lotAge',
        label: `Age: ${ageLabels[filters.lotAge]}`,
        value: filters.lotAge
      });
    }
    
    if (filters.sellerRating) {
      active.push({
        key: 'sellerRating',
        label: `Rating: ${filters.sellerRating}+ stars`,
        value: filters.sellerRating
      });
    }
    
    return active;
  };

  const activeFilters = getActiveFilters();

  if (activeFilters.length === 0) {
    return null;
  }

  const handleRemove = (filter) => {
    if (filter.key === 'budget') {
      onFilterRemove('budgetMin', '');
      onFilterRemove('budgetMax', '');
    } else {
      onFilterRemove(filter.key, filter.value);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {activeFilters.map((filter, index) => (
        <div
          key={`${filter.key}-${index}`}
          className="inline-flex items-center space-x-2 px-3 py-1 bg-primary-50 text-primary rounded-full text-sm border border-primary-200"
        >
          <span className="font-medium">{filter.label}</span>
          <button
            onClick={() => handleRemove(filter)}
            className="p-0.5 hover:bg-primary-200 rounded-full transition-colors duration-200"
            aria-label={`Remove ${filter.label} filter`}
          >
            <Icon name="X" size={12} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default FilterChips;