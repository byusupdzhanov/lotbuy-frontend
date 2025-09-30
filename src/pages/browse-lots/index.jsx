import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from 'components/ui/Header';
import Icon from 'components/AppIcon';

import LotCard from './components/LotCard';
import FilterPanel from './components/FilterPanel';
import SortDropdown from './components/SortDropdown';
import FilterChips from './components/FilterChips';

const BrowseLots = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [lots, setLots] = useState([]);
  const [filteredLots, setFilteredLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [page, setPage] = useState(1);
  const observerRef = useRef();

  // Filter and sort states
  const [filters, setFilters] = useState({
    category: '',
    budgetMin: '',
    budgetMax: '',
    location: '',
    condition: '',
    lotAge: '',
    sellerRating: ''
  });
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  // Mock lots data
  const mockLots = [
    {
      id: 1,
      title: "MacBook Pro 16-inch M2 Chip",
      description: "Looking for a MacBook Pro 16-inch with M2 chip for video editing work. Prefer space gray color.",
      category: "Electronics",
      budgetMin: 2000,
      budgetMax: 2800,
      location: "San Francisco, CA",
      condition: "New",
      timeRemaining: "2 days",
      offerCount: 12,
      createdAt: new Date(Date.now() - 86400000),
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop",
      buyer: {
        name: "John Smith",
        rating: 4.8,
        avatar: "https://randomuser.me/api/portraits/men/32.jpg"
      },
      tags: ["Urgent", "Verified Buyer"],
      isBookmarked: false
    },
    {
      id: 2,
      title: "Vintage Leather Sofa Set",
      description: "Need a vintage brown leather sofa set for my living room. 3-seater preferred with matching armchair.",
      category: "Furniture",
      budgetMin: 800,
      budgetMax: 1500,
      location: "New York, NY",
      condition: "Used - Good",
      timeRemaining: "5 days",
      offerCount: 8,
      createdAt: new Date(Date.now() - 172800000),
      image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop",
      buyer: {
        name: "Sarah Johnson",
        rating: 4.9,
        avatar: "https://randomuser.me/api/portraits/women/44.jpg"
      },
      tags: ["Flexible Budget"],
      isBookmarked: true
    },
    {
      id: 3,
      title: "Professional Camera Equipment",
      description: "Looking for Canon EOS R5 with 24-70mm lens for wedding photography business.",
      category: "Electronics",
      budgetMin: 3500,
      budgetMax: 4200,
      location: "Los Angeles, CA",
      condition: "New",
      timeRemaining: "1 day",
      offerCount: 15,
      createdAt: new Date(Date.now() - 43200000),
      image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=300&fit=crop",
      buyer: {
        name: "Mike Chen",
        rating: 4.7,
        avatar: "https://randomuser.me/api/portraits/men/68.jpg"
      },
      tags: ["Urgent", "High Budget"],
      isBookmarked: false
    },
    {
      id: 4,
      title: "Gaming Setup Components",
      description: "Need RTX 4080 graphics card and 32GB DDR5 RAM for high-end gaming build.",
      category: "Electronics",
      budgetMin: 1200,
      budgetMax: 1800,
      location: "Austin, TX",
      condition: "New",
      timeRemaining: "3 days",
      offerCount: 22,
      createdAt: new Date(Date.now() - 259200000),
      image: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=400&h=300&fit=crop",
      buyer: {
        name: "Alex Rodriguez",
        rating: 4.6,
        avatar: "https://randomuser.me/api/portraits/men/75.jpg"
      },
      tags: ["Popular"],
      isBookmarked: false
    },
    {
      id: 5,
      title: "Antique Dining Table",
      description: "Searching for solid wood antique dining table that seats 6-8 people. Oak or mahogany preferred.",
      category: "Furniture",
      budgetMin: 600,
      budgetMax: 1200,
      location: "Chicago, IL",
      condition: "Used - Excellent",
      timeRemaining: "4 days",
      offerCount: 6,
      createdAt: new Date(Date.now() - 345600000),
      image: "https://images.unsplash.com/photo-1549497538-303791108f95?w=400&h=300&fit=crop",
      buyer: {
        name: "Emma Wilson",
        rating: 4.9,
        avatar: "https://randomuser.me/api/portraits/women/68.jpg"
      },
      tags: ["Antique"],
      isBookmarked: true
    },
    {
      id: 6,
      title: "Electric Vehicle Charger",
      description: "Need Level 2 EV charger for home installation. Tesla compatible preferred.",
      category: "Automotive",
      budgetMin: 400,
      budgetMax: 800,
      location: "Seattle, WA",
      condition: "New",
      timeRemaining: "6 days",
      offerCount: 4,
      createdAt: new Date(Date.now() - 432000000),
      image: "https://images.unsplash.com/photo-1593941707882-a5bac6861d75?w=400&h=300&fit=crop",
      buyer: {
        name: "David Park",
        rating: 4.8,
        avatar: "https://randomuser.me/api/portraits/men/45.jpg"
      },
      tags: ["Eco-Friendly"],
      isBookmarked: false
    }
  ];

  // Initialize lots
  useEffect(() => {
    const initializeLots = async () => {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLots(mockLots);
      setFilteredLots(mockLots);
      setLoading(false);
    };

    initializeLots();
  }, []);

  // Handle search from URL params
  useEffect(() => {
    const searchFromUrl = searchParams.get('search');
    if (searchFromUrl) {
      setSearchQuery(searchFromUrl);
    }
  }, [searchParams]);

  // Filter and sort lots
  useEffect(() => {
    let filtered = [...lots];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(lot =>
        lot.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lot.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lot.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply filters
    if (filters.category) {
      filtered = filtered.filter(lot => lot.category === filters.category);
    }
    if (filters.budgetMin) {
      filtered = filtered.filter(lot => lot.budgetMax >= parseInt(filters.budgetMin));
    }
    if (filters.budgetMax) {
      filtered = filtered.filter(lot => lot.budgetMin <= parseInt(filters.budgetMax));
    }
    if (filters.location) {
      filtered = filtered.filter(lot => lot.location.toLowerCase().includes(filters.location.toLowerCase()));
    }
    if (filters.condition) {
      filtered = filtered.filter(lot => lot.condition === filters.condition);
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'budget-high':
        filtered.sort((a, b) => b.budgetMax - a.budgetMax);
        break;
      case 'budget-low':
        filtered.sort((a, b) => a.budgetMin - b.budgetMin);
        break;
      case 'ending-soon':
        filtered.sort((a, b) => {
          const timeA = parseInt(a.timeRemaining.split(' ')[0]);
          const timeB = parseInt(b.timeRemaining.split(' ')[0]);
          return timeA - timeB;
        });
        break;
      case 'popular':
        filtered.sort((a, b) => b.offerCount - a.offerCount);
        break;
      default:
        break;
    }

    setFilteredLots(filtered);
  }, [lots, searchQuery, filters, sortBy]);

  // Infinite scroll observer
  const lastLotElementRef = useCallback(node => {
    if (loading) return;
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMoreLots();
      }
    });
    if (node) observerRef.current.observe(node);
  }, [loading, hasMore]);

  const loadMoreLots = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    
    // Simulate loading more lots
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In real app, you would fetch more lots from API
    setLoadingMore(false);
    setHasMore(false); // No more lots to load in this demo
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Refresh lots data
    setRefreshing(false);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
  };

  const handleBookmarkToggle = (lotId) => {
    setLots(prev => prev.map(lot => 
      lot.id === lotId ? { ...lot, isBookmarked: !lot.isBookmarked } : lot
    ));
  };

  const handleMakeOffer = (lotId) => {
    navigate(`/lot-details-offers?id=${lotId}`);
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      budgetMin: '',
      budgetMax: '',
      location: '',
      condition: '',
      lotAge: '',
      sellerRating: ''
    });
    setSearchQuery('');
    setSearchParams({});
  };

  const getActiveFilterCount = () => {
    return Object.values(filters).filter(value => value !== '').length + (searchQuery ? 1 : 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-16">
          <div className="container mx-auto px-4 py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-secondary-200 rounded w-1/4 mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="bg-surface rounded-lg p-4 border border-border">
                    <div className="h-48 bg-secondary-200 rounded mb-4"></div>
                    <div className="h-4 bg-secondary-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-secondary-200 rounded w-1/2 mb-4"></div>
                    <div className="flex justify-between">
                      <div className="h-4 bg-secondary-200 rounded w-1/4"></div>
                      <div className="h-4 bg-secondary-200 rounded w-1/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-16">
        <div className="container mx-auto px-4 py-6">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-text-primary">Browse Lots</h1>
              <p className="text-text-secondary mt-1">
                {filteredLots.length} lots available • Find opportunities to make offers
              </p>
            </div>
            
            {/* Desktop View Mode Toggle */}
            <div className="hidden lg:flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'grid' ?'bg-primary text-white' :'text-text-secondary hover:text-text-primary hover:bg-secondary-100'
                }`}
              >
                <Icon name="Grid3X3" size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'list' ?'bg-primary text-white' :'text-text-secondary hover:text-text-primary hover:bg-secondary-100'
                }`}
              >
                <Icon name="List" size={18} />
              </button>
            </div>
          </div>

          {/* Filter and Sort Controls */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              {/* Filter Button */}
              <button
                onClick={() => setIsFilterPanelOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-surface border border-border rounded-lg hover:bg-secondary-50 transition-all duration-200"
              >
                <Icon name="Filter" size={18} />
                <span className="font-medium">Filter</span>
                {getActiveFilterCount() > 0 && (
                  <span className="notification-badge ml-1">
                    {getActiveFilterCount()}
                  </span>
                )}
              </button>

              {/* Sort Dropdown */}
              <SortDropdown 
                value={sortBy} 
                onChange={handleSortChange} 
              />

              {/* Clear Filters */}
              {getActiveFilterCount() > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-primary hover:underline"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 text-text-secondary hover:text-text-primary hover:bg-secondary-100 rounded-lg transition-all duration-200 disabled:opacity-50"
            >
              <Icon 
                name="RefreshCw" 
                size={18} 
                className={refreshing ? 'animate-spin' : ''} 
              />
            </button>
          </div>

          {/* Active Filter Chips */}
          <FilterChips 
            filters={filters}
            searchQuery={searchQuery}
            onFilterRemove={(key, value) => {
              if (key === 'search') {
                setSearchQuery('');
                setSearchParams({});
              } else {
                setFilters(prev => ({ ...prev, [key]: '' }));
              }
            }}
          />

          {/* Lots Grid */}
          {filteredLots.length === 0 ? (
            <div className="text-center py-12">
              <Icon name="Search" size={64} className="text-secondary-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-text-primary mb-2">No lots found</h3>
              <p className="text-text-secondary mb-6">
                Try adjusting your filters or search terms to find more lots.
              </p>
              <button
                onClick={clearFilters}
                className="btn-primary px-6 py-2 rounded-lg"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className={`grid gap-6 ${
              viewMode === 'grid' ?'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' :'grid-cols-1'
            }`}>
              {filteredLots.map((lot, index) => (
                <div
                  key={lot.id}
                  ref={index === filteredLots.length - 1 ? lastLotElementRef : null}
                >
                  <LotCard
                    lot={lot}
                    viewMode={viewMode}
                    onBookmarkToggle={handleBookmarkToggle}
                    onMakeOffer={handleMakeOffer}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Loading More */}
          {loadingMore && (
            <div className="flex justify-center py-8">
              <div className="flex items-center space-x-2 text-text-secondary">
                <Icon name="Loader2" size={20} className="animate-spin" />
                <span>Loading more lots...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filter Panel */}
      <FilterPanel
        isOpen={isFilterPanelOpen}
        onClose={() => setIsFilterPanelOpen(false)}
        filters={filters}
        onFiltersChange={handleFilterChange}
      />
    </div>
  );
};

export default BrowseLots;