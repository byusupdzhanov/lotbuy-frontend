import React, { useEffect, useMemo, useState } from 'react';
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

const fetchDeals = async (signal) => {
  const response = await fetch('/api/deals', { signal });
  if (!response.ok) {
    let message = 'Unable to load deals';
    try {
      const payload = await response.clone().json();
      if (payload?.error) {
        message = payload.error;
      } else if (typeof payload === 'string') {
        message = payload;
      }
    } catch (jsonError) {
      const text = await response.text();
      if (text) {
        message = text;
      }
    }
    throw new Error(message);
  }
  return response.json();
};

const formatCurrency = (amount, currency) => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(amount ?? 0);
  } catch (error) {
    return `${amount ?? 0} ${currency ?? ''}`.trim();
  }
};

const formatDateTime = (value) => {
  if (!value) return null;
  try {
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(value));
  } catch (error) {
    return value;
  }
};

const formatRelative = (value) => {
  if (!value) return 'No updates yet';
  const target = new Date(value);
  const now = new Date();
  const diffMs = target.getTime() - now.getTime();
  const diffMinutes = Math.round(diffMs / (60 * 1000));

  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  if (Math.abs(diffMinutes) < 60) {
    return formatter.format(Math.round(diffMinutes), 'minute');
  }
  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) {
    return formatter.format(diffHours, 'hour');
  }
  const diffDays = Math.round(diffHours / 24);
  return formatter.format(diffDays, 'day');
};

const buildActions = (status) => {
  switch (status) {
    case 'awaiting_payment':
      return [
        { id: 'pay', label: 'Send payment', primary: true },
        { id: 'message', label: 'Message seller' }
      ];
    case 'awaiting_shipment':
      return [
        { id: 'track', label: 'Track shipment', primary: true },
        { id: 'message', label: 'Message seller' }
      ];
    case 'awaiting_confirmation':
      return [
        { id: 'confirm', label: 'Confirm delivery', primary: true },
        { id: 'message', label: 'Message seller' }
      ];
    case 'completed':
      return [
        { id: 'review', label: 'Leave review', primary: true },
        { id: 'duplicate', label: 'Duplicate request' }
      ];
    case 'in_dispute':
      return [
        { id: 'respond', label: 'Respond to dispute', primary: true },
        { id: 'view', label: 'View evidence' }
      ];
    default:
      return [
        { id: 'message', label: 'Message partner', primary: true },
        { id: 'details', label: 'Deal details' }
      ];
  }
};

const mapDealFromApi = (deal) => {
  const dueDate = formatDateTime(deal.dueAt);
  const lastMessageTime = formatRelative(deal.lastMessageAt);
  return {
    id: `deal-${deal.id}`,
    title: deal.request?.title ?? 'Untitled deal',
    lotTitle: deal.request?.title ?? '—',
    offerAmount: deal.totalAmount,
    currency: deal.currencyCode ?? 'USD',
    buyer: {
      name: deal.buyer?.name ?? 'Unknown buyer',
      avatar: deal.buyer?.avatarUrl ?? null,
      rating: deal.buyer?.rating ?? 0
    },
    seller: {
      name: deal.seller?.name ?? 'Unknown seller',
      avatar: deal.seller?.avatarUrl ?? null,
      rating: deal.seller?.rating ?? 0
    },
    status: deal.status ?? 'active',
    lastMessage: {
      text: deal.lastMessageText ?? 'No updates yet',
      time: lastMessageTime
    },
    dueDate: dueDate ? `Due ${dueDate}` : 'No deadline',
    createdAt: formatDateTime(deal.createdAt) ?? '—',
    milestones:
      deal.milestones?.map((milestone) => ({
        id: `milestone-${milestone.id}`,
        label: milestone.label,
        timestamp: formatDateTime(milestone.completedAt),
        completed: Boolean(milestone.completed)
      })) ?? [],
    actions: buildActions(deal.status)
  };
};

const DealsPage = () => {
  const [activeTab, setActiveTab] = useState('active');
  const [viewMode, setViewMode] = useState('list');
  const [selectedDealId, setSelectedDealId] = useState(null);
  const [deals, setDeals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    fetchDeals(controller.signal)
      .then((data) => {
        const normalized = Array.isArray(data) ? data.map(mapDealFromApi) : [];
        setDeals(normalized);
        setError(null);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setError(err.message);
      })
      .finally(() => {
        setIsLoading(false);
      });

    return () => controller.abort();
  }, []);

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
        trend: summary.completed > 0 ? 'Great work!' : 'No completed deals yet'
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
            {isLoading ? (
              <div className="card p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-secondary-100 flex items-center justify-center mx-auto mb-6">
                  <Icon name="Loader2" size={28} className="animate-spin text-text-secondary" />
                </div>
                <h2 className="text-xl font-semibold text-text-primary mb-2">Loading deals...</h2>
                <p className="text-text-secondary max-w-md mx-auto">
                  Fetching the latest transactions and milestones.
                </p>
              </div>
            ) : error ? (
              <div className="card p-12 text-center border border-error-200 bg-error-50">
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mx-auto mb-6 text-error-600">
                  <Icon name="AlertTriangle" size={28} />
                </div>
                <h2 className="text-xl font-semibold text-error-700 mb-2">Failed to load deals</h2>
                <p className="text-error-600 max-w-md mx-auto">{error}</p>
              </div>
            ) : filteredDeals.length === 0 ? (
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
            <p className="text-2xl font-semibold text-text-primary">{formatCurrency(deal.offerAmount, deal.currency)}</p>
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

        {isExpanded && showMilestones && deal.milestones.length > 0 && (
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
                  {index < deal.milestones.length - 1 && <div className="hidden sm:block w-px h-8 bg-border" />}
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
  <div
    className={`border border-border rounded-lg p-4 flex items-center gap-3 ${
      align === 'right' ? 'justify-end text-right' : 'text-left'
    }`}
  >
    {align !== 'right' && <Avatar image={data.avatar} name={data.name} />}
    <div>
      <p className="text-xs uppercase tracking-wide text-text-secondary font-semibold">{label}</p>
      <p className="text-sm font-medium text-text-primary">{data.name}</p>
      <p className="text-xs text-text-secondary">
        Rating
        {typeof data.rating === 'number' ? ` ${data.rating.toFixed(1)} / 5` : ' —'}
      </p>
    </div>
    {align === 'right' && <Avatar image={data.avatar} name={data.name} />}
  </div>
);

const Avatar = ({ image, name }) => {
  if (!image) {
    const initials = name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
    return (
      <div className="w-12 h-12 rounded-full bg-secondary-200 flex items-center justify-center text-text-primary font-semibold">
        {initials || '?'}
      </div>
    );
  }

  return (
    <div className="w-12 h-12 rounded-full overflow-hidden bg-secondary-100 flex-shrink-0">
      <Image src={image} alt={name} className="w-full h-full object-cover" />
    </div>
  );
};

export default DealsPage;