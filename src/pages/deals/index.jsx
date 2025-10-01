import React, { useMemo, useState } from 'react';
import Header from 'components/ui/Header';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';

const DEAL_TABS = [
  { id: 'all', label: 'All deals' },
  { id: 'active', label: 'Active' },
  { id: 'awaiting', label: 'Awaiting actions' },
  { id: 'completed', label: 'Completed' },
  { id: 'disputes', label: 'Disputes' }
];

const statusConfig = {
  active: {
    label: 'In progress',
    tone: 'bg-primary-50 text-primary border border-primary-200',
    icon: 'Handshake'
  },
  awaiting_payment: {
    label: 'Awaiting payment',
    tone: 'bg-warning-50 text-warning-600 border border-warning-200',
    icon: 'CreditCard'
  },
  awaiting_shipment: {
    label: 'Awaiting shipment',
    tone: 'bg-warning-50 text-warning-600 border border-warning-200',
    icon: 'Truck'
  },
  awaiting_confirmation: {
    label: 'Awaiting confirmation',
    tone: 'bg-warning-50 text-warning-600 border border-warning-200',
    icon: 'Clock'
  },
  completed: {
    label: 'Completed',
    tone: 'bg-success-50 text-success-600 border border-success-200',
    icon: 'CheckCircle'
  },
  cancelled: {
    label: 'Cancelled',
    tone: 'bg-secondary-100 text-secondary-700 border border-secondary-200',
    icon: 'XCircle'
  },
  in_dispute: {
    label: 'In dispute',
    tone: 'bg-error-50 text-error-600 border border-error-200',
    icon: 'AlertTriangle'
  }
};

const DealsPage = () => {
  const [activeTab, setActiveTab] = useState('active');
  const [viewMode, setViewMode] = useState('list');
  const [selectedDealId, setSelectedDealId] = useState(null);

  const deals = useMemo(
    () => [
      {
        id: 'deal-001',
        title: 'MacBook Pro M3 Max purchase',
        lotTitle: 'Looking for MacBook Pro M3 Max 32GB',
        offerAmount: 9800,
        currency: 'USD',
        buyer: {
          name: 'Denis Ivanov',
          avatar:
            'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=80&h=80&fit=crop&crop=face',
          rating: 4.9
        },
        seller: {
          name: 'Elena Petrova',
          avatar:
            'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=80&h=80&fit=crop&crop=face',
          rating: 4.7
        },
        status: 'awaiting_payment',
        lastMessage: {
          text: 'Payment request sent. Waiting for buyer confirmation.',
          time: '15 minutes ago'
        },
        dueDate: '24 hours to pay',
        createdAt: 'Mar 4, 2025',
        milestones: [
          {
            id: 'milestone-1',
            label: 'Offer accepted',
            timestamp: 'Mar 3, 12:10',
            completed: true
          },
          {
            id: 'milestone-2',
            label: 'Payment',
            timestamp: null,
            completed: false
          },
          {
            id: 'milestone-3',
            label: 'Shipment',
            timestamp: null,
            completed: false
          },
          {
            id: 'milestone-4',
            label: 'Confirmation',
            timestamp: null,
            completed: false
          }
        ],
        actions: [
          { id: 'pay', label: 'Send payment', primary: true },
          { id: 'message', label: 'Message seller' }
        ]
      },
      {
        id: 'deal-002',
        title: 'Office chairs bulk order',
        lotTitle: 'Need 6 ergonomic office chairs',
        offerAmount: 1320,
        currency: 'USD',
        buyer: {
          name: 'Maria Gomez',
          avatar:
            'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face',
          rating: 4.8
        },
        seller: {
          name: 'Workspace Supplies LLC',
          avatar:
            'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=80&h=80&fit=crop&crop=face',
          rating: 4.6
        },
        status: 'active',
        lastMessage: {
          text: 'Shipment picked up by courier. Tracking number sent.',
          time: '1 hour ago'
        },
        dueDate: 'Deliver by Mar 12',
        createdAt: 'Feb 28, 2025',
        milestones: [
          {
            id: 'milestone-1',
            label: 'Offer accepted',
            timestamp: 'Feb 28, 09:32',
            completed: true
          },
          {
            id: 'milestone-2',
            label: 'Payment',
            timestamp: 'Mar 1, 14:20',
            completed: true
          },
          {
            id: 'milestone-3',
            label: 'Shipment',
            timestamp: null,
            completed: false
          },
          {
            id: 'milestone-4',
            label: 'Confirmation',
            timestamp: null,
            completed: false
          }
        ],
        actions: [
          { id: 'track', label: 'Track shipment', primary: true },
          { id: 'message', label: 'Message seller' },
          { id: 'extend', label: 'Extend deadline' }
        ]
      },
      {
        id: 'deal-003',
        title: 'Photography kit purchase',
        lotTitle: 'Canon R5 body + 24-70mm lens',
        offerAmount: 4200,
        currency: 'USD',
        buyer: {
          name: 'Alex Johnson',
          avatar:
            'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=80&h=80&fit=crop&crop=face',
          rating: 4.5
        },
        seller: {
          name: 'Photo Market Pro',
          avatar:
            'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=80&h=80&fit=crop&crop=face',
          rating: 4.9
        },
        status: 'completed',
        lastMessage: {
          text: 'Deal completed. Leave a review for the seller?',
          time: '2 days ago'
        },
        dueDate: 'Completed Mar 1',
        createdAt: 'Feb 15, 2025',
        milestones: [
          {
            id: 'milestone-1',
            label: 'Offer accepted',
            timestamp: 'Feb 15, 10:16',
            completed: true
          },
          {
            id: 'milestone-2',
            label: 'Payment',
            timestamp: 'Feb 15, 10:45',
            completed: true
          },
          {
            id: 'milestone-3',
            label: 'Shipment',
            timestamp: 'Feb 16, 18:20',
            completed: true
          },
          {
            id: 'milestone-4',
            label: 'Confirmation',
            timestamp: 'Mar 1, 12:05',
            completed: true
          }
        ],
        actions: [
          { id: 'review', label: 'Leave review', primary: true },
          { id: 'duplicate', label: 'Duplicate request' }
        ]
      },
      {
        id: 'deal-004',
        title: 'Gaming PC build assistance',
        lotTitle: 'Custom gaming PC builder',
        offerAmount: 2600,
        currency: 'USD',
        buyer: {
          name: 'Sergey Kuznetsov',
          avatar:
            'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=80&h=80&fit=crop&crop=face',
          rating: 4.6
        },
        seller: {
          name: 'Ultimate Gaming Builds',
          avatar:
            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&crop=face',
          rating: 4.4
        },
        status: 'in_dispute',
        lastMessage: {
          text: 'Buyer filed a dispute regarding missing GPU. Support reviewing.',
          time: '3 hours ago'
        },
        dueDate: 'Response required in 12h',
        createdAt: 'Feb 20, 2025',
        milestones: [
          {
            id: 'milestone-1',
            label: 'Offer accepted',
            timestamp: 'Feb 20, 11:12',
            completed: true
          },
          {
            id: 'milestone-2',
            label: 'Payment',
            timestamp: 'Feb 20, 12:05',
            completed: true
          },
          {
            id: 'milestone-3',
            label: 'Shipment',
            timestamp: 'Feb 24, 19:32',
            completed: true
          },
          {
            id: 'milestone-4',
            label: 'Confirmation',
            timestamp: null,
            completed: false
          }
        ],
        actions: [
          { id: 'respond', label: 'Respond to dispute', primary: true },
          { id: 'view', label: 'View evidence' }
        ]
      }
    ],
    []
  );

  const filteredDeals = useMemo(() => {
    switch (activeTab) {
      case 'all':
        return deals;
      case 'active':
        return deals.filter((deal) => ['active', 'awaiting_shipment'].includes(deal.status));
      case 'awaiting':
        return deals.filter((deal) => ['awaiting_payment', 'awaiting_confirmation'].includes(deal.status));
      case 'completed':
        return deals.filter((deal) => deal.status === 'completed');
      case 'disputes':
        return deals.filter((deal) => deal.status === 'in_dispute');
      default:
        return deals;
    }
  }, [activeTab, deals]);

  const stats = useMemo(() => {
    const summary = {
      total: deals.length,
      active: deals.filter((deal) => ['active', 'awaiting_shipment'].includes(deal.status)).length,
      awaiting: deals.filter((deal) => ['awaiting_payment', 'awaiting_confirmation'].includes(deal.status)).length,
      completed: deals.filter((deal) => deal.status === 'completed').length,
      disputes: deals.filter((deal) => deal.status === 'in_dispute').length
    };

    return [
      {
        id: 'total',
        label: 'Total deals',
        value: summary.total,
        icon: 'Layers',
        trend: '+12% vs last month'
      },
      {
        id: 'active',
        label: 'Active',
        value: summary.active,
        icon: 'Activity',
        trend: `${summary.awaiting} awaiting actions`
      },
      {
        id: 'completed',
        label: 'Completed',
        value: summary.completed,
        icon: 'CheckCircle',
        trend: '94% success rate'
      },
      {
        id: 'disputes',
        label: 'Disputes',
        value: summary.disputes,
        icon: 'AlertTriangle',
        trend: summary.disputes > 0 ? 'Action required' : 'All clear'
      }
    ];
  }, [deals]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <p className="text-sm uppercase tracking-wide text-text-secondary font-semibold mb-2">
                Deal center
              </p>
              <h1 className="text-3xl font-bold text-text-primary">Manage your deals</h1>
              <p className="text-text-secondary mt-2 max-w-2xl">
                Track ongoing transactions, respond to pending actions and keep everything on schedule for successful deals.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button className="btn-secondary flex items-center gap-2 px-4 py-2 rounded-lg">
                <Icon name="FileText" size={18} />
                Export report
              </button>
              <button className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg">
                <Icon name="BellRing" size={18} />
                Deal alerts
              </button>
            </div>
          </header>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((item) => (
              <article key={item.id} className="card p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center text-primary">
                    <Icon name={item.icon} size={20} />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                    {item.label}
                  </span>
                </div>
                <p className="text-3xl font-semibold text-text-primary mb-2">{item.value}</p>
                <p className="text-sm text-text-secondary">{item.trend}</p>
              </article>
            ))}
          </section>

          <section className="card p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                {DEAL_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-secondary-100 text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-text-secondary">View</span>
                <div className="flex rounded-lg border border-border overflow-hidden">
                  <button
                    className={`px-3 py-2 flex items-center gap-2 text-sm ${
                      viewMode === 'list' ? 'bg-primary text-white' : 'text-text-secondary'
                    }`}
                    onClick={() => setViewMode('list')}
                  >
                    <Icon name="Rows" size={18} />
                    List
                  </button>
                  <button
                    className={`px-3 py-2 flex items-center gap-2 text-sm ${
                      viewMode === 'grid' ? 'bg-primary text-white' : 'text-text-secondary'
                    }`}
                    onClick={() => setViewMode('grid')}
                  >
                    <Icon name="Grid" size={18} />
                    Grid
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section>
            {filteredDeals.length === 0 ? (
              <div className="card p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-secondary-100 flex items-center justify-center mx-auto mb-6">
                  <Icon name="Inbox" size={28} className="text-text-secondary" />
                </div>
                <h2 className="text-xl font-semibold text-text-primary mb-2">No deals in this view yet</h2>
                <p className="text-text-secondary max-w-md mx-auto">
                  When you accept offers, they will appear here. Use filters to review completed deals or disputes.
                </p>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid gap-4 md:grid-cols-2' : 'space-y-4'}>
                {filteredDeals.map((deal) => (
                  <DealCard
                    key={deal.id}
                    deal={deal}
                    isExpanded={selectedDealId === deal.id}
                    onToggle={() =>
                      setSelectedDealId((current) => (current === deal.id ? null : deal.id))
                    }
                    showMilestones={viewMode === 'list'}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

const DealCard = ({ deal, onToggle, isExpanded, showMilestones }) => {
  const status = statusConfig[deal.status] ?? statusConfig.active;

  return (
    <article className="card p-6">
      <div className="flex flex-col gap-4">
        <header className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-lg font-semibold text-text-primary">{deal.title}</h2>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-2 ${status.tone}`}>
                <Icon name={status.icon} size={16} />
                {status.label}
              </span>
            </div>
            <p className="text-sm text-text-secondary">Linked lot: {deal.lotTitle}</p>
          </div>

          <div className="text-right">
            <p className="text-2xl font-semibold text-text-primary">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: deal.currency
              }).format(deal.offerAmount)}
            </p>
            <p className="text-sm text-text-secondary">{deal.dueDate}</p>
          </div>
        </header>

        <section className="grid sm:grid-cols-2 gap-4">
          <PartyCard label="Buyer" data={deal.buyer} />
          <PartyCard label="Seller" data={deal.seller} align="right" />
        </section>

        <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3 text-left">
            <div className="w-10 h-10 rounded-lg bg-secondary-100 flex items-center justify-center text-text-secondary">
              <Icon name="MessageSquare" size={18} />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">Latest update</p>
              <p className="text-sm text-text-secondary">{deal.lastMessage.text}</p>
              <p className="text-xs text-text-secondary mt-1">{deal.lastMessage.time}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {deal.actions.map((action) => (
              <button
                key={action.id}
                className={`${
                  action.primary
                    ? 'btn-primary px-4 py-2 rounded-lg'
                    : 'btn-secondary px-3 py-2 rounded-lg'
                } text-sm font-medium`}
              >
                {action.label}
              </button>
            ))}
            <button
              onClick={onToggle}
              className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              {isExpanded ? 'Hide details' : 'View timeline'}
              <Icon name={isExpanded ? 'ChevronUp' : 'ChevronDown'} size={16} />
            </button>
          </div>
        </section>

        {isExpanded && showMilestones && (
          <section className="mt-4">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-3">
              Milestones
            </h3>
            <div className="space-y-3">
              {deal.milestones.map((milestone, index) => (
                <div
                  key={milestone.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border"
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center ${
                      milestone.completed ? 'bg-success-100 text-success-600' : 'bg-secondary-100 text-text-secondary'
                    }`}
                  >
                    <Icon name={milestone.completed ? 'Check' : 'Circle'} size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-text-primary">{milestone.label}</p>
                    <p className="text-xs text-text-secondary">
                      {milestone.timestamp || 'Pending'}
                    </p>
                  </div>
                  {index < deal.milestones.length - 1 && (
                    <div className="hidden sm:block w-px h-8 bg-border" />
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
};

const PartyCard = ({ data, label, align = 'left' }) => (
  <div className={`border border-border rounded-lg p-4 flex items-center gap-3 ${align === 'right' ? 'justify-end text-right' : 'text-left'}`}>
    {align !== 'right' && (
      <Avatar image={data.avatar} name={data.name} />
    )}
    <div>
      <p className="text-xs uppercase tracking-wide text-text-secondary font-semibold">{label}</p>
      <p className="text-sm font-medium text-text-primary">{data.name}</p>
      <p className="text-xs text-text-secondary">Rating {data.rating.toFixed(1)} / 5</p>
    </div>
    {align === 'right' && (
      <Avatar image={data.avatar} name={data.name} />
    )}
  </div>
);

const Avatar = ({ image, name }) => (
  <div className="w-12 h-12 rounded-full overflow-hidden bg-secondary-100 flex-shrink-0">
    <Image src={image} alt={name} className="w-full h-full object-cover" />
  </div>
);

export default DealsPage;