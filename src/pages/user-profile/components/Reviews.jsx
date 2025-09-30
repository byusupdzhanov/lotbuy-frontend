import React, { useState, useEffect } from 'react';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';

const Reviews = ({ profileData }) => {
  const [reviews, setReviews] = useState([]);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showResponseForm, setShowResponseForm] = useState(null);
  const [responseText, setResponseText] = useState('');

  // Mock reviews data
  useEffect(() => {
    const mockReviews = [
      {
        id: 'review_001',
        reviewer: {
          name: 'Sarah Johnson',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=50&h=50&fit=crop&face',
          memberSince: '2023-03-15'
        },
        rating: 5,
        date: '2024-01-15T10:30:00Z',
        transactionType: 'buyer',
        lotTitle: 'MacBook Pro 16" M2 Chip',
        comment: `Excellent seller! John was very responsive and provided detailed information about the MacBook. The transaction was smooth and the item was exactly as described. Would definitely work with him again. Highly recommended for anyone looking for quality electronics.`,
        helpful: 12,
        response: null,
        verified: true
      },
      {
        id: 'review_002',
        reviewer: {
          name: 'Mike Chen',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&face',
          memberSince: '2022-11-20'
        },
        rating: 4,
        date: '2024-01-12T14:20:00Z',
        transactionType: 'seller',
        lotTitle: 'Vintage Leather Sofa Set',
        comment: `Good communication throughout the process. John was clear about what he was looking for and made a fair offer. The pickup was well organized and on time. Only minor issue was the initial response time, but overall a positive experience.`,
        helpful: 8,
        response: {
          date: '2024-01-13T09:15:00Z',
          text: 'Thank you for the feedback, Mike! I apologize for the delayed initial response - I was traveling that week. I appreciate your patience and glad we could complete the deal successfully.'
        },
        verified: true
      },
      {
        id: 'review_003',
        reviewer: {
          name: 'Alex Rodriguez',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&face',
          memberSince: '2023-07-08'
        },
        rating: 5,
        date: '2024-01-08T09:15:00Z',
        transactionType: 'buyer',
        lotTitle: 'Professional Camera Equipment',
        comment: `Outstanding transaction! John knew exactly what he wanted and was very knowledgeable about camera equipment. Fast payment, great communication, and a pleasure to work with. This is how all marketplace transactions should go!`,
        helpful: 15,
        response: {
          date: '2024-01-08T16:30:00Z',
          text: 'Thanks Alex! Your camera equipment was in perfect condition and exactly what I needed for my photography projects. Great doing business with you!'
        },
        verified: true
      },
      {
        id: 'review_004',
        reviewer: {
          name: 'Emma Wilson',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&face',
          memberSince: '2023-01-12'
        },
        rating: 3,
        date: '2024-01-03T11:30:00Z',
        transactionType: 'seller',
        lotTitle: 'Antique Dining Table',
        comment: `The communication was okay, but John seemed a bit indecisive about the offer. He asked many questions which is good, but then didn't follow through with the purchase. Not a bad experience, just wish there was more commitment upfront.`,
        helpful: 3,
        response: null,
        verified: true
      },
      {
        id: 'review_005',
        reviewer: {
          name: 'David Park',avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop&face',memberSince: '2022-09-25'
        },
        rating: 5,
        date: '2023-12-28T15:45:00Z',transactionType: 'buyer',lotTitle: 'Home Office Furniture Set',
        comment: `Fantastic buyer experience! John was professional, punctual, and paid exactly as agreed. He even helped load the furniture into his truck. These are the kind of people that make peer-to-peer trading enjoyable and trustworthy.`,
        helpful: 9,
        response: {
          date: '2023-12-29T08:20:00Z',text: 'Thank you David! Your furniture set was perfect for my home office setup. I really appreciate your help with loading everything. Hope to do business again in the future!'
        },
        verified: true
      }
    ];

    setReviews(mockReviews);
  }, []);

  const filteredReviews = reviews.filter(review => {
    if (filter === 'all') return true;
    if (filter === 'buyer') return review.transactionType === 'buyer';
    if (filter === 'seller') return review.transactionType === 'seller';
    if (filter === 'no_response') return !review.response;
    return true;
  });

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.date) - new Date(a.date);
      case 'oldest':
        return new Date(a.date) - new Date(b.date);
      case 'highest_rating':
        return b.rating - a.rating;
      case 'lowest_rating':
        return a.rating - b.rating;
      case 'most_helpful':
        return b.helpful - a.helpful;
      default:
        return 0;
    }
  });

  const handleResponse = (reviewId) => {
    if (responseText.trim()) {
      setReviews(prev => prev.map(review => 
        review.id === reviewId 
          ? {
              ...review,
              response: {
                date: new Date().toISOString(),
                text: responseText.trim()
              }
            }
          : review
      ));
      setResponseText('');
      setShowResponseForm(null);
    }
  };

  const handleMarkHelpful = (reviewId) => {
    setReviews(prev => prev.map(review => 
      review.id === reviewId 
        ? { ...review, helpful: review.helpful + 1 }
        : review
    ));
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(review => review.rating === rating).length,
    percentage: reviews.length > 0 ? (reviews.filter(review => review.rating === rating).length / reviews.length) * 100 : 0
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <h2 className="text-2xl font-bold text-text-primary">Reviews & Feedback</h2>
      </div>

      {/* Rating Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overall Rating */}
        <div className="card p-6 text-center">
          <div className="text-4xl font-bold text-text-primary mb-2">{averageRating}</div>
          <div className="flex items-center justify-center space-x-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Icon
                key={i}
                name="Star"
                size={20}
                className={i < Math.floor(averageRating) ? 'text-warning-500' : 'text-secondary-300'}
              />
            ))}
          </div>
          <p className="text-text-secondary">Based on {reviews.length} reviews</p>
        </div>

        {/* Rating Distribution */}
        <div className="card p-6">
          <h3 className="font-semibold text-text-primary mb-4">Rating Breakdown</h3>
          <div className="space-y-2">
            {ratingDistribution.map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center space-x-3">
                <span className="text-sm text-text-secondary w-8">{rating}★</span>
                <div className="flex-1 bg-secondary-200 rounded-full h-2">
                  <div
                    className="bg-warning-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-text-secondary w-8">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="card p-6">
          <h3 className="font-semibold text-text-primary mb-4">Review Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-text-secondary">As Buyer</span>
              <span className="font-medium text-text-primary">
                {reviews.filter(r => r.transactionType === 'buyer').length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">As Seller</span>
              <span className="font-medium text-text-primary">
                {reviews.filter(r => r.transactionType === 'seller').length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Response Rate</span>
              <span className="font-medium text-success-600">
                {reviews.length > 0 
                  ? Math.round((reviews.filter(r => r.response).length / reviews.length) * 100)
                  : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All Reviews' },
              { key: 'buyer', label: 'As Buyer' },
              { key: 'seller', label: 'As Seller' },
              { key: 'no_response', label: 'Need Response' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
                  filter === key
                    ? 'bg-primary text-white' :'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-field"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest_rating">Highest Rating</option>
            <option value="lowest_rating">Lowest Rating</option>
            <option value="most_helpful">Most Helpful</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {sortedReviews.length === 0 ? (
          <div className="card p-8 text-center">
            <Icon name="Star" size={48} className="text-secondary-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-text-primary mb-2">No Reviews Found</h3>
            <p className="text-text-secondary">
              {filter !== 'all' ?'Try adjusting your filter to see more reviews' :'Reviews from your transactions will appear here'
              }
            </p>
          </div>
        ) : (
          sortedReviews.map((review) => (
            <div key={review.id} className="card p-6">
              <div className="flex items-start space-x-4">
                {/* Reviewer Avatar */}
                <Image
                  src={review.reviewer.avatar}
                  alt={review.reviewer.name}
                  className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                />

                <div className="flex-1 min-w-0">
                  {/* Review Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-semibold text-text-primary">{review.reviewer.name}</h4>
                        {review.verified && (
                          <Icon name="CheckCircle" size={16} className="text-success-500" />
                        )}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          review.transactionType === 'buyer' ?'bg-primary-100 text-primary-700' :'bg-success-100 text-success-700'
                        }`}>
                          {review.transactionType === 'buyer' ? 'Bought from you' : 'Sold to you'}
                        </span>
                      </div>
                      <p className="text-sm text-text-secondary">
                        Member since {new Date(review.reviewer.memberSince).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1 mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Icon
                            key={i}
                            name="Star"
                            size={16}
                            className={i < review.rating ? 'text-warning-500' : 'text-secondary-300'}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-text-secondary">
                        {new Date(review.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Transaction Info */}
                  <div className="mb-3">
                    <p className="text-sm text-text-secondary">
                      <Icon name="Package" size={14} className="inline mr-1" />
                      Transaction: {review.lotTitle}
                    </p>
                  </div>

                  {/* Review Comment */}
                  <div className="mb-4">
                    <p className="text-text-primary leading-relaxed">{review.comment}</p>
                  </div>

                  {/* Review Actions */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => handleMarkHelpful(review.id)}
                      className="flex items-center space-x-1 text-text-secondary hover:text-text-primary transition-colors duration-200"
                    >
                      <Icon name="ThumbsUp" size={14} />
                      <span className="text-sm">Helpful ({review.helpful})</span>
                    </button>

                    {!review.response && (
                      <button
                        onClick={() => setShowResponseForm(review.id)}
                        className="text-primary hover:underline text-sm"
                      >
                        Respond
                      </button>
                    )}
                  </div>

                  {/* Response Form */}
                  {showResponseForm === review.id && (
                    <div className="mt-4 p-4 bg-secondary-50 rounded-lg">
                      <textarea
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                        placeholder="Write your response..."
                        rows={3}
                        className="input-field w-full resize-none mb-3"
                      />
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleResponse(review.id)}
                          className="btn-primary px-4 py-2 rounded-lg text-sm"
                          disabled={!responseText.trim()}
                        >
                          Post Response
                        </button>
                        <button
                          onClick={() => {
                            setShowResponseForm(null);
                            setResponseText('');
                          }}
                          className="btn-secondary px-4 py-2 rounded-lg text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Existing Response */}
                  {review.response && (
                    <div className="mt-4 p-4 bg-primary-50 rounded-lg border-l-4 border-primary">
                      <div className="flex items-center space-x-2 mb-2">
                        <Icon name="MessageCircle" size={16} className="text-primary" />
                        <span className="text-sm font-medium text-primary">Your Response</span>
                        <span className="text-xs text-text-secondary">
                          {new Date(review.response.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-text-primary">{review.response.text}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Load More */}
      {sortedReviews.length > 0 && (
        <div className="text-center">
          <button className="btn-secondary px-6 py-2 rounded-lg">
            Load More Reviews
          </button>
        </div>
      )}
    </div>
  );
};

export default Reviews;