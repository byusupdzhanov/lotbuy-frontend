import React, { useState, useEffect } from 'react';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';

const TransactionHistory = ({ navigate }) => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    dateRange: 'all'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date_desc');

  // Mock transaction data
  useEffect(() => {
    const mockTransactions = [
      {
        id: 'txn_001',
        type: 'lot_created',
        title: 'MacBook Pro 16" M2 Chip',
        description: 'Looking for a MacBook Pro with M2 chip for video editing work',
        amount: 2500,
        status: 'completed',
        date: '2024-01-15T10:30:00Z',
        otherParty: {
          name: 'Sarah Johnson',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=50&h=50&fit=crop&crop=face'
        },
        category: 'Electronics',
        offersReceived: 8,
        finalPrice: 2200
      },
      {
        id: 'txn_002',
        type: 'offer_made',
        title: 'Vintage Leather Sofa Set',
        description: 'Offering a complete vintage leather sofa set in excellent condition',
        amount: 1200,
        status: 'pending',
        date: '2024-01-12T14:20:00Z',
        otherParty: {
          name: 'Mike Chen',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face'
        },
        category: 'Furniture',
        offerAmount: 1200,
        lotValue: 1500
      },
      {
        id: 'txn_003',
        type: 'deal_completed',
        title: 'Professional Camera Equipment',
        description: 'Canon EOS R5 with lens kit and accessories',
        amount: 3200,
        status: 'completed',
        date: '2024-01-08T09:15:00Z',
        otherParty: {
          name: 'Alex Rodriguez',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face'
        },
        category: 'Electronics',
        rating: 5,
        review: 'Excellent transaction, item exactly as described!'
      },
      {
        id: 'txn_004',
        type: 'lot_created',
        title: 'Gaming Setup Complete',
        description: 'Looking for a complete gaming setup including PC, monitor, and peripherals',
        amount: 1800,
        status: 'active',
        date: '2024-01-05T16:45:00Z',
        category: 'Electronics',
        offersReceived: 3,
        viewCount: 45
      },
      {
        id: 'txn_005',
        type: 'offer_made',
        title: 'Antique Dining Table',
        description: 'Beautiful oak dining table from the 1920s',
        amount: 800,
        status: 'rejected',
        date: '2024-01-03T11:30:00Z',
        otherParty: {
          name: 'Emma Wilson',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face'
        },
        category: 'Furniture',
        offerAmount: 800,
        lotValue: 1200,
        rejectionReason: 'Looking for higher offers'
      }
    ];

    setTransactions(mockTransactions);
    setFilteredTransactions(mockTransactions);
  }, []);

  // Filter and search logic
  useEffect(() => {
    let filtered = transactions;

    // Apply type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter(txn => txn.type === filters.type);
    }

    // Apply status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(txn => txn.status === filters.status);
    }

    // Apply date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (filters.dateRange) {
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          filterDate.setMonth(now.getMonth() - 3);
          break;
        default:
          break;
      }
      
      if (filters.dateRange !== 'all') {
        filtered = filtered.filter(txn => new Date(txn.date) >= filterDate);
      }
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(txn =>
        txn.title.toLowerCase().includes(query) ||
        txn.description.toLowerCase().includes(query) ||
        txn.category.toLowerCase().includes(query) ||
        (txn.otherParty && txn.otherParty.name.toLowerCase().includes(query))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date_desc':
          return new Date(b.date) - new Date(a.date);
        case 'date_asc':
          return new Date(a.date) - new Date(b.date);
        case 'amount_desc':
          return b.amount - a.amount;
        case 'amount_asc':
          return a.amount - b.amount;
        case 'title_asc':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    setFilteredTransactions(filtered);
  }, [transactions, filters, searchQuery, sortBy]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'status-success';
      case 'pending':
        return 'status-warning';
      case 'active':
        return 'bg-primary-50 text-primary-600 border border-primary-100';
      case 'rejected':
        return 'status-error';
      default:
        return 'bg-secondary-100 text-secondary-600';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'lot_created':
        return 'Plus';
      case 'offer_made':
        return 'DollarSign';
      case 'deal_completed':
        return 'CheckCircle';
      default:
        return 'Activity';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'lot_created':
        return 'Lot Created';
      case 'offer_made':
        return 'Offer Made';
      case 'deal_completed':
        return 'Deal Completed';
      default:
        return 'Transaction';
    }
  };

  const handleTransactionClick = (transaction) => {
    if (transaction.type === 'lot_created' || transaction.type === 'offer_made') {
      navigate('/lot-details-offers');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <h2 className="text-2xl font-bold text-text-primary">Transaction History</h2>
        
        {/* Search */}
        <div className="relative max-w-md">
          <Icon
            name="Search"
            size={18}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search transactions..."
            className="input-field w-full pl-10 pr-4"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Type</label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="input-field w-full"
            >
              <option value="all">All Types</option>
              <option value="lot_created">Lots Created</option>
              <option value="offer_made">Offers Made</option>
              <option value="deal_completed">Deals Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="input-field w-full"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Date Range</label>
            <select
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              className="input-field w-full"
            >
              <option value="all">All Time</option>
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last 3 Months</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field w-full"
            >
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
              <option value="amount_desc">Highest Amount</option>
              <option value="amount_asc">Lowest Amount</option>
              <option value="title_asc">Title A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="space-y-4">
        {filteredTransactions.length === 0 ? (
          <div className="card p-8 text-center">
            <Icon name="Activity" size={48} className="text-secondary-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-text-primary mb-2">No Transactions Found</h3>
            <p className="text-text-secondary">
              {searchQuery || filters.type !== 'all' || filters.status !== 'all' || filters.dateRange !== 'all' ?'Try adjusting your filters or search terms' :'Your transaction history will appear here once you start creating lots and making offers'
              }
            </p>
          </div>
        ) : (
          filteredTransactions.map((transaction) => (
            <div
              key={transaction.id}
              onClick={() => handleTransactionClick(transaction)}
              className="card p-6 hover:shadow-md transition-shadow duration-200 cursor-pointer"
            >
              <div className="flex items-start space-x-4">
                {/* Transaction Icon */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <Icon name={getTypeIcon(transaction.type)} size={20} className="text-primary" />
                  </div>
                </div>

                {/* Transaction Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-text-primary mb-1">
                        {transaction.title}
                      </h3>
                      <p className="text-sm text-text-secondary line-clamp-2">
                        {transaction.description}
                      </p>
                    </div>
                    <div className="flex flex-col items-end space-y-2 ml-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                        {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                      </span>
                      <span className="text-lg font-bold text-text-primary">
                        ${transaction.amount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary mb-3">
                    <span className="flex items-center space-x-1">
                      <Icon name="Tag" size={14} />
                      <span>{getTypeLabel(transaction.type)}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Icon name="Calendar" size={14} />
                      <span>{new Date(transaction.date).toLocaleDateString()}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Icon name="Folder" size={14} />
                      <span>{transaction.category}</span>
                    </span>
                  </div>

                  {/* Additional Info Based on Type */}
                  {transaction.type === 'lot_created' && (
                    <div className="flex items-center space-x-4 text-sm">
                      {transaction.status === 'active' && (
                        <>
                          <span className="text-text-secondary">
                            {transaction.offersReceived} offers received
                          </span>
                          <span className="text-text-secondary">
                            {transaction.viewCount} views
                          </span>
                        </>
                      )}
                      {transaction.status === 'completed' && transaction.finalPrice && (
                        <span className="text-success-600 font-medium">
                          Sold for ${transaction.finalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  )}

                  {transaction.type === 'offer_made' && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="text-text-secondary">
                          Your offer: ${transaction.offerAmount?.toLocaleString()}
                        </span>
                        <span className="text-text-secondary">
                          Lot value: ${transaction.lotValue?.toLocaleString()}
                        </span>
                      </div>
                      {transaction.otherParty && (
                        <div className="flex items-center space-x-2">
                          <Image
                            src={transaction.otherParty.avatar}
                            alt={transaction.otherParty.name}
                            className="w-6 h-6 rounded-full"
                          />
                          <span className="text-sm text-text-secondary">
                            {transaction.otherParty.name}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {transaction.type === 'deal_completed' && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {transaction.rating && (
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <Icon
                                key={i}
                                name="Star"
                                size={14}
                                className={i < transaction.rating ? 'text-warning-500' : 'text-secondary-300'}
                              />
                            ))}
                          </div>
                        )}
                        {transaction.review && (
                          <span className="text-sm text-text-secondary italic">
                            "{transaction.review}"
                          </span>
                        )}
                      </div>
                      {transaction.otherParty && (
                        <div className="flex items-center space-x-2">
                          <Image
                            src={transaction.otherParty.avatar}
                            alt={transaction.otherParty.name}
                            className="w-6 h-6 rounded-full"
                          />
                          <span className="text-sm text-text-secondary">
                            {transaction.otherParty.name}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {transaction.status === 'rejected' && transaction.rejectionReason && (
                    <div className="mt-2 p-2 bg-error-50 rounded-lg">
                      <p className="text-sm text-error-600">
                        <Icon name="Info" size={14} className="inline mr-1" />
                        {transaction.rejectionReason}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Load More */}
      {filteredTransactions.length > 0 && (
        <div className="text-center">
          <button className="btn-secondary px-6 py-2 rounded-lg">
            Load More Transactions
          </button>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;