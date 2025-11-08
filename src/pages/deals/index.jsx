import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Header from 'components/ui/Header';
import Icon from 'components/AppIcon';
import AppImage from 'components/AppImage';
import { useAuth } from 'context/AuthContext';
import {
  listDeals,
  markDealShipped,
  submitDealPayment,
  confirmDealCompletion,
  openDealDispute,
  rateDealCounterparty,
} from 'lib/api/deals';
import { APIError } from 'lib/api/client';

const DEAL_TABS = [
  { id: 'all', label: 'Все сделки' },
  { id: 'active', label: 'Активные' },
  { id: 'awaiting', label: 'Ожидающие действий' },
  { id: 'completed', label: 'Выполненные' },
  { id: 'disputes', label: 'Споры' }
];

const statusConfig = {
  active: {
    label: 'В процессе',
    tone: 'bg-primary-50 text-primary border border-primary-200',
    icon: 'Handshake'
  },
  awaiting_payment: {
    label: 'Ожидание оплаты',
    tone: 'bg-warning-50 text-warning-600 border border-warning-200',
    icon: 'CreditCard'
  },
  awaiting_shipment: {
    label: 'Ожидание доставки',
    tone: 'bg-warning-50 text-warning-600 border border-warning-200',
    icon: 'Truck'
  },
  awaiting_confirmation: {
    label: 'Ожидание подтверждения',
    tone: 'bg-warning-50 text-warning-600 border border-warning-200',
    icon: 'Clock'
  },
  completed: {
    label: 'Выполнено',
    tone: 'bg-success-50 text-success-600 border border-success-200',
    icon: 'CheckCircle'
  },
  cancelled: {
    label: 'Отменено',
    tone: 'bg-secondary-100 text-secondary-700 border border-secondary-200',
    icon: 'XCircle'
  },
  in_dispute: {
    label: 'В споре',
    tone: 'bg-error-50 text-error-600 border border-error-200',
    icon: 'AlertTriangle'
  }
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

const decorateDeal = (detail, currentUserId) => {
  if (!detail) return null;
  const dueDate = formatDateTime(detail.dueAt);
  const isBuyer = detail.buyerUserId != null && detail.buyerUserId === currentUserId;
  const isSeller = detail.sellerUserId != null && detail.sellerUserId === currentUserId;

  const buyer = {
    name: detail.buyer?.name ?? 'Buyer',
    avatar: detail.buyer?.avatarUrl ?? null,
    rating: detail.buyer?.rating ?? null,
  };
  const seller = {
    name: detail.seller?.name ?? 'Seller',
    avatar: detail.seller?.avatarUrl ?? null,
    rating: detail.seller?.rating ?? null,
  };

  const actions = [];
  if (isSeller && detail.status === 'awaiting_shipment') {
    actions.push({ id: 'mark_shipped', label: 'Подтвердить доставку', primary: true });
  }
  if (isBuyer && detail.status === 'awaiting_payment') {
    actions.push({ id: 'submit_payment', label: 'Оплатить', primary: true });
  }
  if (isSeller && detail.status === 'awaiting_confirmation') {
    actions.push({ id: 'confirm_delivery', label: 'Подтвердить платеж', primary: true });
  }
  if (detail.status === 'completed') {
    if (isBuyer && detail.sellerRating == null) {
      actions.push({ id: 'rate_seller', label: 'Оценить продавца', primary: true, meta: { target: 'seller' } });
    }
    if (isSeller && detail.buyerRating == null) {
      actions.push({ id: 'rate_buyer', label: 'Оценить покупателя', primary: false, meta: { target: 'buyer' } });
    }
  }
  if ((isBuyer || isSeller) && !['completed', 'in_dispute'].includes(detail.status)) {
    actions.push({ id: 'open_dispute', label: 'Открыть спор', primary: false });
  }

  const milestones = Array.isArray(detail.milestones)
    ? detail.milestones.map((milestone) => ({
        id: milestone.id,
        label: milestone.label,
        timestamp: formatDateTime(milestone.completedAt),
        completed: Boolean(milestone.completed),
      }))
    : [];

  return {
    id: detail.id,
    detail,
    title: detail.request?.title ?? 'Untitled deal',
    lotTitle: detail.request?.title ?? '—',
    offerAmount: detail.totalAmount ?? detail.offer?.priceAmount ?? 0,
    currency: detail.currencyCode ?? detail.offer?.currencyCode ?? 'USD',
    buyer,
    seller,
    status: detail.status ?? 'active',
    lastMessage: {
      text: detail.lastMessageText ?? 'No updates yet',
      time: formatRelative(detail.lastMessageAt),
    },
    dueDate: dueDate ? `Due ${dueDate}` : 'No deadline',
    createdAt: formatDateTime(detail.createdAt) ?? '—',
    milestones,
    actions,
    isBuyer,
    isSeller,
    disputeReason: detail.disputeReason,
  };
};

const DealsPage = () => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('active');
  const [viewMode, setViewMode] = useState('list');
  const [selectedDealId, setSelectedDealId] = useState(null);
  const [deals, setDeals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [banner, setBanner] = useState(null);
  const [dialog, setDialog] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const loadDeals = useCallback(async () => {
    if (!user?.id) {
      setDeals([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const data = await listDeals();
      setDeals(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      const message = err instanceof APIError ? err.message : 'Unable to load deals.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadDeals();
  }, [loadDeals]);

  const updateDealState = useCallback((updated) => {
    if (!updated) return;
    setDeals((prev) => {
      const next = [...prev];
      const index = next.findIndex((deal) => deal.id === updated.id);
      if (index >= 0) {
        next[index] = updated;
        return next;
      }
      return [...next, updated];
    });
  }, []);

  const showBanner = useCallback((type, message) => {
    setBanner({ type, message });
  }, []);

  useEffect(() => {
    if (!banner) return undefined;
    const timer = setTimeout(() => setBanner(null), 6000);
    return () => clearTimeout(timer);
  }, [banner]);

  const performDealUpdate = useCallback(
    async (operation, successMessage) => {
      setSubmitting(true);
      try {
        const updated = await operation();
        updateDealState(updated);
        if (successMessage) {
          showBanner('success', successMessage);
        }
      } catch (err) {
        const message = err instanceof APIError ? err.message : 'Failed to update deal.';
        showBanner('error', message);
      } finally {
        setSubmitting(false);
      }
    },
    [showBanner, updateDealState]
  );

  const handleAction = useCallback(
    (deal, action) => {
      if (!deal?.detail || !action || submitting) {
        return;
      }
      switch (action.id) {
        case 'mark_shipped': {
          if (window.confirm('Подтвердить что товары были доставлены покупателю?')) {
            performDealUpdate(() => markDealShipped(deal.detail.id), 'Доставка подтверждена');
          }
          break;
        }
        case 'submit_payment':
          setDialog({ type: 'payment', deal });
          break;
        case 'confirm_delivery':
          setDialog({ type: 'confirm', deal });
          break;
        case 'open_dispute':
          setDialog({ type: 'dispute', deal });
          break;
        case 'rate_seller':
        case 'rate_buyer':
          setDialog({ type: 'rate', deal, target: action.meta?.target });
          break;
        default:
          break;
      }
    },
    [performDealUpdate, submitting]
  );

  const handleSubmitPayment = useCallback(async () => {
    if (!dialog?.deal?.detail) return;
    await performDealUpdate(
      () => submitDealPayment(dialog.deal.detail.id),
      'Оплата произведена. Ждем подтверждения от продавца'
    );
    setDialog(null);
  }, [dialog, performDealUpdate]);

  const handleConfirmCompletion = useCallback(async () => {
    if (!dialog?.deal?.detail) return;
    await performDealUpdate(
      () => confirmDealCompletion(dialog.deal.detail.id),
      'Сделка завершена успешно.'
    );
    setDialog(null);
  }, [dialog, performDealUpdate]);

  const handleOpenDispute = useCallback(
    async (reason) => {
      if (!dialog?.deal?.detail) return;
      await performDealUpdate(
        () => openDealDispute(dialog.deal.detail.id, reason),
        'Спор открыт. Наша команда рассмотрит его в ближайшее время.'
      );
      setDialog(null);
    },
    [dialog, performDealUpdate]
  );

  const handleSubmitRating = useCallback(
    async (rating, comment) => {
      if (!dialog?.deal?.detail) return;
      await performDealUpdate(
        () => rateDealCounterparty(dialog.deal.detail.id, rating, comment),
        'Оценка отправлена. Спасибо за ваш отзыв.'
      );
      setDialog(null);
    },
    [dialog, performDealUpdate]
  );

  const decoratedDeals = useMemo(
    () => deals.map((item) => decorateDeal(item, user?.id)).filter(Boolean),
    [deals, user?.id]
  );

  const filteredDeals = useMemo(() => {
    switch (activeTab) {
      case 'all':
        return decoratedDeals;
      case 'active':
        return decoratedDeals.filter((deal) => ['active', 'awaiting_shipment'].includes(deal.status));
      case 'awaiting':
        return decoratedDeals.filter((deal) => ['awaiting_payment', 'awaiting_confirmation'].includes(deal.status));
      case 'completed':
        return decoratedDeals.filter((deal) => deal.status === 'completed');
      case 'disputes':
        return decoratedDeals.filter((deal) => deal.status === 'in_dispute');
      default:
        return decoratedDeals;
    }
  }, [activeTab, decoratedDeals]);

  const stats = useMemo(() => {
    const summary = {
      total: decoratedDeals.length,
      active: decoratedDeals.filter((deal) => ['active', 'awaiting_shipment'].includes(deal.status)).length,
      awaiting: decoratedDeals.filter((deal) => ['awaiting_payment', 'awaiting_confirmation'].includes(deal.status)).length,
      completed: decoratedDeals.filter((deal) => deal.status === 'completed').length,
      disputes: decoratedDeals.filter((deal) => deal.status === 'in_dispute').length
      
    };

    return [
      {
        id: 'total',
        label: 'Всего сделок',
        value: summary.total,
        icon: 'Layers',
        trend: '+0% в этом месяце'
      },
      {
        id: 'active',
        label: 'Активные',
        value: summary.active,
        icon: 'Activity',
        trend: `${summary.awaiting} ожидающих действий`
      },
      {
        id: 'completed',
        label: 'Выполненно',
        value: summary.completed,
        icon: 'CheckCircle',
        trend: summary.completed > 0 ? 'Хорошая работа!' : 'Выполненные сделки отсутствуют'
      },
      {
        id: 'disputes',
        label: 'Споров открыто',
        value: summary.disputes,
        icon: 'AlertTriangle',
        trend: summary.disputes > 0 ? 'Необходимо действие' : 'Все тихо'
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
                Центр сделок
              </p>
              <h1 className="text-3xl font-bold text-text-primary">Управляйте своими сделками</h1>
              <p className="text-text-secondary mt-2 max-w-2xl">
                Отслеживайте прогресс, управляйте этапами и завершайте сделки с покупателями и продавцами
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button className="btn-secondary flex items-center gap-2 px-4 py-2 rounded-lg">
                <Icon name="FileText" size={18} />
                Скачать отчет
              </button>
              <button className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg">
                <Icon name="BellRing" size={18} />
                Уведомления о сделках
              </button>
            </div>
          </header>

          {banner && (
            <div
              className={`flex items-start justify-between gap-4 p-4 rounded-lg border ${
                banner.type === 'success'
                  ? 'bg-success-50 border-success-200 text-success-700'
                  : 'bg-error-50 border-error-200 text-error-700'
              }`}
            >
              <div className="flex items-start gap-2">
                <Icon name={banner.type === 'success' ? 'CheckCircle' : 'AlertTriangle'} size={18} />
                <p className="text-sm leading-5">{banner.message}</p>
              </div>
              <button
                type="button"
                onClick={() => setBanner(null)}
                className="text-xs font-medium uppercase tracking-wide"
              >
                Закрыть
              </button>
            </div>
          )}

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
                <span className="text-sm text-text-secondary">Вид</span>
                <div className="flex rounded-lg border border-border overflow-hidden">
                  <button
                    className={`px-3 py-2 flex items-center gap-2 text-sm ${
                      viewMode === 'list' ? 'bg-primary text-white' : 'text-text-secondary'
                    }`}
                    onClick={() => setViewMode('list')}
                  >
                    <Icon name="List" size={18} />
                    Список
                  </button>
                  <button
                    className={`px-3 py-2 flex items-center gap-2 text-sm ${
                      viewMode === 'grid' ? 'bg-primary text-white' : 'text-text-secondary'
                    }`}
                    onClick={() => setViewMode('grid')}
                  >
                    <Icon name="Grid" size={18} />
                    Сетка
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
                <h2 className="text-xl font-semibold text-text-primary mb-2">Загружаем сделки...</h2>
                <p className="text-text-secondary max-w-md mx-auto">
                  Пожалуйста, подождите немного, пока мы получаем ваши текущие сделки.
                </p>
              </div>
            ) : error ? (
              <div className="card p-12 text-center border border-error-200 bg-error-50">
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mx-auto mb-6 text-error-600">
                  <Icon name="AlertTriangle" size={28} />
                </div>
                <h2 className="text-xl font-semibold text-error-700 mb-2">Не удалось загрузить сделки</h2>
                <p className="text-error-600 max-w-md mx-auto">{error}</p>
              </div>
            ) : filteredDeals.length === 0 ? (
              <div className="card p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-secondary-100 flex items-center justify-center mx-auto mb-6">
                  <Icon name="Inbox" size={28} className="text-text-secondary" />
                </div>
                <h2 className="text-xl font-semibold text-text-primary mb-2">Пока сделок нет</h2>
                <p className="text-text-secondary max-w-md mx-auto">
                  Принятые вами предложения будут отображаться здесь. Используйте фильтры для просмотра завершённых сделок или споров.
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
                    onAction={handleAction}
                    actionDisabled={submitting}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <PaymentDialog
        open={dialog?.type === 'payment'}
        deal={dialog?.deal}
        submitting={submitting}
        onClose={() => setDialog(null)}
        onSubmit={handleSubmitPayment}
      />
      <ConfirmDialog
        open={dialog?.type === 'confirm'}
        deal={dialog?.deal}
        submitting={submitting}
        onClose={() => setDialog(null)}
        onConfirm={handleConfirmCompletion}
      />
      <DisputeDialog
        open={dialog?.type === 'dispute'}
        deal={dialog?.deal}
        submitting={submitting}
        onClose={() => setDialog(null)}
        onSubmit={handleOpenDispute}
      />
      <RatingDialog
        open={dialog?.type === 'rate'}
        deal={dialog?.deal}
        target={dialog?.target}
        submitting={submitting}
        onClose={() => setDialog(null)}
        onSubmit={handleSubmitRating}
      />
    </div>
  );
};

const DealCard = ({ deal, onToggle, isExpanded, showMilestones, onAction, actionDisabled }) => {
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
            <p className="text-sm text-text-secondary">Связанные лот: {deal.lotTitle}</p>
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
              <p className="text-sm font-medium text-text-primary">Последние обновления:</p>
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
                onClick={() => onAction?.(deal, action)}
                disabled={actionDisabled}
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
              Эатпы сделки
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
        {deal.status === 'in_dispute' && deal.disputeReason && (
          <section className="mt-4 p-4 border border-error-200 bg-error-50 rounded-lg">
            <p className="text-sm font-semibold text-error-700">Спор</p>
            <p className="text-sm text-error-600 mt-1">{deal.disputeReason}</p>
          </section>
        )}
      </div>
    </article>
  );
};

const ModalContainer = ({ open, title, onClose, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="w-full max-w-lg bg-surface rounded-xl shadow-lg overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-secondary-50">
          <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-text-secondary hover:text-text-primary"
          >
            <Icon name="X" size={18} />
          </button>
        </div>
        <div className="p-6 space-y-4">{children}</div>
      </div>
    </div>
  );
};

const PaymentDialog = ({ open, deal, submitting, onClose, onSubmit }) => {
  const [form, setForm] = useState({
    name: '',
    number: '',
    expiry: '',
    cvv: '',
  });

  useEffect(() => {
    if (open) {
      setForm({ name: deal?.buyer?.name ?? '', number: '', expiry: '', cvv: '' });
    }
  }, [open, deal?.detail?.id, deal?.buyer?.name]);

  const handleChange = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit?.();
  };

  return (
    <ModalContainer open={open} title="Mock payment" onClose={onClose}>
      <p className="text-sm text-text-secondary">
        Симуляция процесса оплаты
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-text-secondary uppercase mb-2">Владелец карты</label>
          <input
            type="text"
            value={form.name}
            onChange={handleChange('name')}
            className="input-field"
            placeholder="Иван Иванов"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-text-secondary uppercase mb-2">Номер карты</label>
          <input
            type="text"
            value={form.number}
            onChange={handleChange('number')}
            className="input-field"
            placeholder="1234 5678 9012 3456"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-text-secondary uppercase mb-2">Срок действия</label>
            <input
              type="text"
              value={form.expiry}
              onChange={handleChange('expiry')}
              className="input-field"
              placeholder="ММ/ГГ"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary uppercase mb-2">CVV</label>
            <input
              type="password"
              value={form.cvv}
              onChange={handleChange('cvv')}
              className="input-field"
              placeholder="***"
              required
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary px-4 py-2 rounded-lg text-sm">
            Оменить
          </button>
          <button
            type="submit"
            className="btn-primary px-4 py-2 rounded-lg text-sm"
            disabled={submitting}
          >
            {submitting ? 'В процессе...' : 'Подтвердить оплату'}
          </button>
        </div>
      </form>
    </ModalContainer>
  );
};

const ConfirmDialog = ({ open, deal, submitting, onClose, onConfirm }) => (
  <ModalContainer open={open} title="Оплата получена" onClose={onClose}>
    <p className="text-sm text-text-secondary">
      Подтвердите, что вы доставили товар и получили оплату от {deal?.buyer?.name ?? 'the buyer'}.
      Вы можете оставить отзыв после завершения
    </p>
    <div className="flex justify-end gap-3 pt-2">
      <button type="button" onClick={onClose} className="btn-secondary px-4 py-2 rounded-lg text-sm">
        Отменить
      </button>
      <button
        type="button"
        onClick={onConfirm}
        className="btn-primary px-4 py-2 rounded-lg text-sm"
        disabled={submitting}
      >
        {submitting ? 'Confirming...' : 'Mark as completed'}
      </button>
    </div>
  </ModalContainer>
);

const DisputeDialog = ({ open, deal, submitting, onClose, onSubmit }) => {
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (open) {
      setReason('');
    }
  }, [open, deal?.detail?.id]);

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit?.(reason.trim() || 'Спор открыт');
  };

  return (
    <ModalContainer open={open} title="Open dispute" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-text-secondary">
          Опишите, что пошло не так. Наша команда рассмотрит спор и свяжется с обеими сторонами
        </p>
        <textarea
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          className="input-field min-h-[120px]"
          placeholder="Explain the issue"
          required
        />
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="btn-secondary px-4 py-2 rounded-lg text-sm">
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary px-4 py-2 rounded-lg text-sm"
            disabled={submitting}
          >
            {submitting ? 'Подтверждаем...' : 'Открыть спор'}
          </button>
        </div>
      </form>
    </ModalContainer>
  );
};

const RatingDialog = ({ open, deal, target = 'seller', submitting, onClose, onSubmit }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (open) {
      setRating(5);
      setComment('');
    }
  }, [open, deal?.detail?.id, target]);

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit?.(rating, comment.trim());
  };

  const title = target === 'buyer' ? 'Rate buyer' : 'Rate seller';
  const label = target === 'buyer' ? deal?.buyer?.name ?? 'buyer' : deal?.seller?.name ?? 'seller';

  return (
    <ModalContainer open={open} title={title} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-text-secondary">
          Поделитесь отзывом о товаре {label}. Рейтинги помогают укрепить доверие на рынке.
        </p>
        <div>
          <label className="block text-xs font-medium text-text-secondary uppercase mb-2">Рейтинг</label>
          <select
            value={rating}
            onChange={(event) => setRating(Number(event.target.value))}
            className="input-field"
          >
            {[5, 4, 3, 2, 1].map((value) => (
              <option key={value} value={value}>
                {value} / 5
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-text-secondary uppercase mb-2">Комментарий (необязательно)</label>
          <textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            className="input-field min-h-[100px]"
            placeholder="Добавьте полезный контекст для будущих сделок"
          />
        </div>
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="btn-secondary px-4 py-2 rounded-lg text-sm">
            Отменить
          </button>
          <button
            type="submit"
            className="btn-primary px-4 py-2 rounded-lg text-sm"
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit rating'}
          </button>
        </div>
      </form>
    </ModalContainer>
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
      <AppImage src={image} alt={name} className="w-full h-full object-cover" />
    </div>
  );
};

export default DealsPage;
