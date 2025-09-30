import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from 'components/ui/Header';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';
import ImageCarousel from './components/ImageCarousel';
import LotInformation from './components/LotInformation';
import OffersList from './components/OffersList';
import MakeOfferModal from './components/MakeOfferModal';
import OfferComparisonModal from './components/OfferComparisonModal';
import ChatModal from './components/ChatModal';
import ContextualActionBar from 'components/ui/ContextualActionBar';

const LotDetailsOffers = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentUser] = useState({ id: 1, role: 'buyer' }); // Mock current user
  const [lot, setLot] = useState(null);
  const [offers, setOffers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const [showMakeOfferModal, setShowMakeOfferModal] = useState(false);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [chatRecipient, setChatRecipient] = useState(null);

  // Mock lot data
  useEffect(() => {
    const mockLot = {
      id: 1,
      title: "Professional DSLR Camera Setup",
      description: `Looking for a complete professional DSLR camera setup for my photography business. I need a camera body with at least 24MP resolution, preferably Canon or Nikon brand. The setup should include:

• Camera body (Canon EOS 5D Mark IV or Nikon D850 preferred)
• 24-70mm f/2.8 lens
• 70-200mm f/2.8 lens
• External flash unit
• Camera bag/case
• Extra batteries and memory cards

The equipment should be in excellent working condition with minimal wear. I'm looking for a complete package deal rather than individual items. Professional use history is acceptable as long as everything functions perfectly.

Timeline: Need this setup within 2 weeks for an upcoming wedding season. Willing to pay premium for quality equipment that meets all specifications.`,
      category: "Electronics",
      subcategory: "Cameras & Photography",
      budgetRange: {
        min: 3500,
        max: 5000,
        currency: "USD"
      },
      location: {
        city: "San Francisco",
        state: "CA",
        country: "USA",
        coordinates: { lat: 37.7749, lng: -122.4194 }
      },
      timeline: {
        created: "2024-01-15T10:30:00Z",
        deadline: "2024-01-29T23:59:59Z",
        preferredDelivery: "2024-01-27T00:00:00Z"
      },
      status: "active",
      images: [
        "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=600&fit=crop"
      ],
      buyer: {
        id: 1,
        name: "Sarah Johnson",
        avatar: "https://randomuser.me/api/portraits/women/32.jpg",
        rating: 4.8,
        totalDeals: 23,
        joinedDate: "2023-03-15T00:00:00Z",
        verified: true
      },
      specifications: [
        { label: "Brand Preference", value: "Canon, Nikon" },
        { label: "Resolution", value: "24MP minimum" },
        { label: "Lens Requirements", value: "24-70mm f/2.8, 70-200mm f/2.8" },
        { label: "Condition", value: "Excellent working condition" },
        { label: "Package Type", value: "Complete setup preferred" }
      ],
      tags: ["Professional", "DSLR", "Photography", "Complete Setup", "Wedding Photography"],
      viewCount: 156,
      offerCount: 8,
      savedCount: 23
    };

    const mockOffers = [
      {
        id: 1,
        sellerId: 101,
        seller: {
          name: "Michael Chen",
          avatar: "https://randomuser.me/api/portraits/men/45.jpg",
          rating: 4.9,
          totalSales: 87,
          responseTime: "< 2 hours",
          verified: true,
          location: "San Jose, CA"
        },
        price: 4200,
        currency: "USD",
        description: `I have the exact setup you're looking for! Canon EOS 5D Mark IV with less than 10,000 shutter count, purchased in 2022. Includes:

• Canon EOS 5D Mark IV body
• Canon EF 24-70mm f/2.8L II USM lens
• Canon EF 70-200mm f/2.8L IS III USM lens
• Canon Speedlite 600EX II-RT flash
• Peak Design Everyday Backpack 30L
• 4x Canon LP-E6NH batteries
• 2x 128GB SanDisk Extreme Pro CF cards

All equipment is in pristine condition, always stored in climate-controlled environment. Can provide detailed photos and test shots. Available for local pickup or insured shipping.`,
        deliveryOptions: [
          { type: "pickup", location: "San Jose, CA", timeframe: "Same day" },
          { type: "shipping", timeframe: "2-3 business days", cost: 50 }
        ],
        timeline: "Available immediately",
        images: [
          "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400&h=300&fit=crop",
          "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=300&fit=crop"
        ],
        submittedAt: "2024-01-16T14:30:00Z",
        status: "pending",
        warranty: "30-day return guarantee",
        paymentTerms: "50% upfront, 50% on delivery",
        additionalServices: ["Setup assistance", "Basic training included"]
      },
      {
        id: 2,
        sellerId: 102,
        seller: {
          name: "David Rodriguez",
          avatar: "https://randomuser.me/api/portraits/men/32.jpg",
          rating: 4.7,
          totalSales: 45,
          responseTime: "< 4 hours",
          verified: true,
          location: "Oakland, CA"
        },
        price: 3800,
        currency: "USD",
        description: `Professional photographer selling my backup kit. Nikon D850 with professional glass:

• Nikon D850 body (15,000 shutter count)
• Nikkor 24-70mm f/2.8E ED VR lens
• Nikkor 70-200mm f/2.8E FL ED VR lens
• Nikon SB-5000 Speedlight
• Think Tank Photo Airport Security V3.0 case
• 3x EN-EL15a batteries + charger
• 2x 64GB XQD cards

Equipment has been professionally maintained, comes with original boxes and documentation. Perfect for wedding photography - this was my primary setup for 3 years.`,
        deliveryOptions: [
          { type: "pickup", location: "Oakland, CA", timeframe: "Flexible" },
          { type: "shipping", timeframe: "1-2 business days", cost: 75 }
        ],
        timeline: "Available within 24 hours",
        images: [
          "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=300&fit=crop"
        ],
        submittedAt: "2024-01-16T16:45:00Z",
        status: "pending",
        warranty: "14-day return policy",
        paymentTerms: "Full payment on delivery",
        additionalServices: ["Professional cleaning included"]
      },
      {
        id: 3,
        sellerId: 103,
        seller: {
          name: "Jennifer Kim",
          avatar: "https://randomuser.me/api/portraits/women/28.jpg",
          rating: 4.6,
          totalSales: 32,
          responseTime: "< 6 hours",
          verified: false,
          location: "San Francisco, CA"
        },
        price: 4500,
        currency: "USD",
        description: `Brand new Canon setup, still in original packaging. Purchased for a project that got cancelled:

• Canon EOS 5D Mark IV (unopened)
• Canon EF 24-70mm f/2.8L II USM (unopened)
• Canon EF 70-200mm f/2.8L IS III USM (unopened)
• Canon Speedlite 600EX II-RT (unopened)
• Lowepro ProTactic 450 AW II backpack
• Accessories bundle (batteries, cards, etc.)

Everything is brand new with full manufacturer warranty. Selling at a loss due to project cancellation. Can provide receipts and warranty information.`,
        deliveryOptions: [
          { type: "pickup", location: "San Francisco, CA", timeframe: "Same day" },
          { type: "shipping", timeframe: "Next day", cost: 100 }
        ],
        timeline: "Immediate availability",
        images: [
          "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400&h=300&fit=crop"
        ],
        submittedAt: "2024-01-17T09:15:00Z",
        status: "pending",
        warranty: "Full manufacturer warranty",
        paymentTerms: "Payment on delivery or PayPal",
        additionalServices: ["Free delivery within SF"]
      }
    ];

    setLot(mockLot);
    setOffers(mockOffers);
    setIsLoading(false);
  }, []);

  const handleMakeOffer = () => {
    setShowMakeOfferModal(true);
  };

  const handleOfferSubmit = (offerData) => {
    console.log('New offer submitted:', offerData);
    setShowMakeOfferModal(false);
    // In real app, would submit to API and refresh offers
  };

  const handleViewOffer = (offer) => {
    setSelectedOffer(offer);
    // Could open detailed offer modal or navigate to offer details
  };

  const handleMessageSeller = (offer) => {
    setChatRecipient(offer.seller);
    setShowChatModal(true);
  };

  const handleAcceptOffer = (offer) => {
    console.log('Accepting offer:', offer.id);
    // In real app, would create deal and update offer status
  };

  const handleCompareOffers = () => {
    setShowComparisonModal(true);
  };

  const handleContextualAction = (actionId, context) => {
    switch (actionId) {
      case 'make_offer':
        handleMakeOffer();
        break;
      case 'message_buyer':
        setChatRecipient(lot.buyer);
        setShowChatModal(true);
        break;
      case 'save_lot': console.log('Saving lot');
        break;
      case 'share_lot': console.log('Sharing lot');
        break;
      case 'view_offers': setActiveTab('offers');
        break;
      case 'edit_lot': navigate('/create-lot?edit=' + lot.id);
        break;
      case 'close_lot': console.log('Closing lot');
        break;
      default:
        console.log('Unhandled action:', actionId);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-16 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Icon name="Loader2" size={48} className="text-primary animate-spin mx-auto mb-4" />
            <p className="text-text-secondary">Loading lot details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!lot) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-16 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Icon name="AlertCircle" size={48} className="text-error-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-text-primary mb-2">Lot Not Found</h2>
            <p className="text-text-secondary mb-6">The lot you're looking for doesn't exist or has been removed.</p>
            <button
              onClick={() => navigate('/browse-lots')}
              className="btn-primary px-6 py-2 rounded-lg"
            >
              Browse Other Lots
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isOwner = currentUser.id === lot.buyer.id;
  const userRole = isOwner ? 'buyer' : 'seller';

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16">
        {/* Mobile Layout */}
        <div className="lg:hidden">
          {/* Image Carousel */}
          <div className="relative">
            <ImageCarousel images={lot.images} />
            
            {/* Status Badge */}
            <div className="absolute top-4 left-4">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                lot.status === 'active' ?'bg-success-100 text-success-600'
                  : lot.status === 'in_negotiation' ?'bg-warning-100 text-warning-600' :'bg-secondary-100 text-secondary-600'
              }`}>
                {lot.status === 'active' ? 'Active' : 
                 lot.status === 'in_negotiation' ? 'In Negotiation' : 'Completed'}
              </span>
            </div>

            {/* Save/Share Actions */}
            <div className="absolute top-4 right-4 flex space-x-2">
              <button className="w-10 h-10 bg-white bg-opacity-90 rounded-full flex items-center justify-center shadow-sm">
                <Icon name="Bookmark" size={18} className="text-text-secondary" />
              </button>
              <button className="w-10 h-10 bg-white bg-opacity-90 rounded-full flex items-center justify-center shadow-sm">
                <Icon name="Share2" size={18} className="text-text-secondary" />
              </button>
            </div>
          </div>

          {/* Content Tabs */}
          <div className="bg-surface border-b border-border sticky top-16 z-10">
            <div className="flex">
              <button
                onClick={() => setActiveTab('details')}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'details' ?'text-primary border-b-2 border-primary' :'text-text-secondary'
                }`}
              >
                Details
              </button>
              <button
                onClick={() => setActiveTab('offers')}
                className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
                  activeTab === 'offers' ?'text-primary border-b-2 border-primary' :'text-text-secondary'
                }`}
              >
                Offers
                {offers.length > 0 && (
                  <span className="absolute -top-1 -right-1 notification-badge min-w-[18px] h-[18px] flex items-center justify-center text-xs">
                    {offers.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-4">
            {activeTab === 'details' ? (
              <LotInformation lot={lot} />
            ) : (
              <OffersList 
                offers={offers}
                isOwner={isOwner}
                onViewOffer={handleViewOffer}
                onMessageSeller={handleMessageSeller}
                onAcceptOffer={handleAcceptOffer}
                onCompareOffers={handleCompareOffers}
              />
            )}
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:block">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="grid grid-cols-12 gap-8">
              {/* Left Column - Lot Details */}
              <div className="col-span-7">
                <ImageCarousel images={lot.images} />
                <div className="mt-6">
                  <LotInformation lot={lot} />
                </div>
              </div>

              {/* Right Column - Offers */}
              <div className="col-span-5">
                <div className="sticky top-24">
                  <div className="bg-surface rounded-lg border border-border">
                    <div className="p-6 border-b border-border">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-text-primary">
                          {isOwner ? 'Received Offers' : 'Make an Offer'}
                        </h3>
                        {offers.length > 0 && (
                          <span className="notification-badge">
                            {offers.length}
                          </span>
                        )}
                      </div>

                      {!isOwner && (
                        <button
                          onClick={handleMakeOffer}
                          className="btn-primary w-full py-3 rounded-lg font-medium flex items-center justify-center space-x-2"
                        >
                          <Icon name="DollarSign" size={18} />
                          <span>Make Offer</span>
                        </button>
                      )}
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                      <OffersList 
                        offers={offers}
                        isOwner={isOwner}
                        onViewOffer={handleViewOffer}
                        onMessageSeller={handleMessageSeller}
                        onAcceptOffer={handleAcceptOffer}
                        onCompareOffers={handleCompareOffers}
                        compact={true}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Contextual Action Bar */}
      <ContextualActionBar
        userRole={userRole}
        lotStatus={lot.status}
        lotId={lot.id}
        onAction={handleContextualAction}
      />

      {/* Modals */}
      {showMakeOfferModal && (
        <MakeOfferModal
          lot={lot}
          onClose={() => setShowMakeOfferModal(false)}
          onSubmit={handleOfferSubmit}
        />
      )}

      {showComparisonModal && (
        <OfferComparisonModal
          offers={offers}
          onClose={() => setShowComparisonModal(false)}
          onSelectOffer={handleAcceptOffer}
        />
      )}

      {showChatModal && chatRecipient && (
        <ChatModal
          recipient={chatRecipient}
          lotId={lot.id}
          onClose={() => {
            setShowChatModal(false);
            setChatRecipient(null);
          }}
        />
      )}
    </div>
  );
};

export default LotDetailsOffers;