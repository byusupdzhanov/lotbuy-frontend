import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from 'components/ui/Header';
import Icon from 'components/AppIcon';
import AppImage from 'components/AppImage';
import { useAuth } from 'context/AuthContext';
import { APIError } from 'lib/api/client';
import { getRequest } from 'lib/api/requests';
import { acceptOffer, createOffer, deleteOffer, listOffers, updateOffer } from 'lib/api/offers';
import MakeOfferModal from './components/MakeOfferModal';
import OffersList from './components/OffersList';
import ChatModal from './components/ChatModal';
import { listOfferMessages, sendOfferMessage } from 'lib/api/messages';
import { uploadImage as uploadImageFile } from 'lib/api/uploads';

const formatCurrency = (amount, currency) => {
  const value = Number(amount) || 0;
  const code = (currency || 'USD').toUpperCase();
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: code,
    }).format(value);
  } catch (error) {
    return `${code} ${value.toLocaleString()}`;
  }
};

const formatLocation = (request) => {
  if (!request) return null;
  const parts = [request.locationCity, request.locationRegion, request.locationCountry].filter(Boolean);
  if (parts.length === 0) return null;
  return parts.join(', ');
};

const LotDetailsOffers = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [request, setRequest] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loadingRequest, setLoadingRequest] = useState(true);
  const [loadingOffers, setLoadingOffers] = useState(true);
  const [error, setError] = useState(null);
  const [offersError, setOffersError] = useState(null);
  const [isOfferModalOpen, setOfferModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);
  const [chatOffer, setChatOffer] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [sendingChat, setSendingChat] = useState(false);

  const requestIdParam = searchParams.get('id');
  const requestId = requestIdParam ? Number(requestIdParam) : NaN;

  const loadRequest = useCallback(async () => {
    if (!requestId || Number.isNaN(requestId)) {
      setError('Invalid lot identifier.');
      setLoadingRequest(false);
      return;
    }
    setError(null);
    setLoadingRequest(true);
    try {
      const data = await getRequest(requestId);
      setRequest(data);
    } catch (err) {
      const message = err instanceof APIError ? err.message : 'Failed to load lot.';
      setError(message);
    } finally {
      setLoadingRequest(false);
    }
  }, [requestId]);

  const loadOffers = useCallback(async () => {
    if (!requestId || Number.isNaN(requestId)) {
      setOffers([]);
      setOffersError(null);
      setLoadingOffers(false);
      return;
    }
    setOffersError(null);
    setLoadingOffers(true);
    try {
      const data = await listOffers(requestId);
      const normalized = Array.isArray(data) ? data : [];
      normalized.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOffers(normalized);
    } catch (err) {
      const message = err instanceof APIError ? err.message : 'Failed to load offers.';
      setOffersError(message);
    } finally {
      setLoadingOffers(false);
    }
  }, [requestId]);

  useEffect(() => {
    loadRequest();
  }, [loadRequest]);

  useEffect(() => {
    loadOffers();
  }, [loadOffers]);

  const isOwner = useMemo(() => {
    if (!user?.id || !request?.buyerId) return false;
    return request.buyerId === user.id;
  }, [request?.buyerId, user?.id]);

  const userOffer = useMemo(() => {
    if (!user?.id) return null;
    return offers.find((offer) => offer.sellerId === user.id) || null;
  }, [offers, user?.id]);

  const handleOpenCreateOffer = () => {
    setEditingOffer(null);
    setOfferModalOpen(true);
  };

  const handleOpenEditOffer = (offer) => {
    setEditingOffer(offer);
    setOfferModalOpen(true);
  };

  const handleSubmitOffer = async ({ priceAmount, currencyCode, message }) => {
    if (!requestId || Number.isNaN(requestId)) {
      throw new Error('Missing lot identifier');
    }
    if (editingOffer) {
      const updated = await updateOffer(editingOffer.id, {
        priceAmount,
        currencyCode,
        message,
      });
      setOffers((prev) => {
        const next = prev.map((offer) => (offer.id === updated.id ? updated : offer));
        next.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return next;
      });
      setStatusMessage('Offer updated successfully.');
    } else {
      const created = await createOffer(requestId, {
        priceAmount,
        currencyCode,
        message,
      });
      setOffers((prev) => {
        const next = [created, ...prev];
        next.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return next;
      });
      setStatusMessage('Offer submitted to the buyer.');
    }
    setOfferModalOpen(false);
    setEditingOffer(null);
  };

  const handleDeleteOffer = async (offerId) => {
    if (!offerId) return;
    if (!window.confirm('Delete this offer? This action cannot be undone.')) {
      return;
    }
    try {
      await deleteOffer(offerId);
      setOffers((prev) => prev.filter((offer) => offer.id !== offerId));
      setStatusMessage('Offer deleted.');
    } catch (err) {
      const message = err instanceof APIError ? err.message : 'Failed to delete offer.';
      setStatusMessage(message);
    }
  };

  const handleAcceptOffer = async (offerId) => {
    if (!offerId) return;
    try {
      await acceptOffer(offerId);
      setStatusMessage('Offer accepted. Deal created.');
      await loadOffers();
      await loadRequest();
    } catch (err) {
      const message = err instanceof APIError ? err.message : 'Failed to accept offer.';
      setStatusMessage(message);
    }
  };

  const loadChatMessages = useCallback(
    async (offerId) => {
      if (!offerId) return;
      setLoadingChat(true);
      try {
        const data = await listOfferMessages(offerId);
        setChatMessages(Array.isArray(data) ? data : []);
      } catch (error) {
        setChatMessages([]);
      } finally {
        setLoadingChat(false);
      }
    },
    []
  );

  const handleOpenChat = async (offer) => {
    if (!offer) return;
    const buyerId = request?.buyerId ?? request?.buyerUserId ?? null;
    const viewerIsBuyer = buyerId != null && buyerId === user?.id;
    const buyerName = request?.buyerName || (viewerIsBuyer ? user?.fullName : null) || 'Buyer';
    const buyerAvatarUrl =
      request?.buyerAvatarUrl || (viewerIsBuyer ? user?.avatarUrl ?? null : null);
    const sellerName = offer?.sellerName || (!viewerIsBuyer ? user?.fullName : null) || 'Seller';
    const sellerAvatarUrl = offer?.sellerAvatarUrl || (!viewerIsBuyer ? user?.avatarUrl ?? null : null);

    setChatOffer({
      ...offer,
      buyerId,
      buyerName,
      buyerAvatarUrl,
      sellerName,
      sellerAvatarUrl,
    });
    setChatOpen(true);
    await loadChatMessages(offer.id);
  };

  const handleSendChatMessage = async ({ body, file }) => {
    if (!chatOffer) return false;
    setSendingChat(true);
    try {
      let attachmentUrl = null;
      if (file) {
        const upload = await uploadImageFile(file);
        attachmentUrl = upload?.url || null;
      }
      const payload = {};
      if (body) payload.body = body;
      if (attachmentUrl) payload.attachmentUrl = attachmentUrl;
      const message = await sendOfferMessage(chatOffer.id, payload);
      setChatMessages((prev) => [...prev, message]);
      return true;
    } catch (error) {
      setStatusMessage(error instanceof APIError ? error.message : 'Failed to send message.');
      return false;
    } finally {
      setSendingChat(false);
    }
  };

  const handleEditLot = () => {
    if (!request) return;
    navigate(`/create-lot?id=${request.id}`);
  };

  const canMakeOffer = useMemo(() => {
    if (!user?.id) return false;
    if (isOwner) return false;
    return !userOffer;
  }, [isOwner, user?.id, userOffer]);

  if (!requestId || Number.isNaN(requestId)) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-16">
          <div className="container mx-auto px-4 py-20 text-center text-text-secondary">
            <Icon name="AlertTriangle" size={36} className="mx-auto mb-4 text-error-500" />
            <p>Invalid lot identifier.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {statusMessage && (
            <div className="status-info rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Icon name="Info" size={18} />
                <span>{statusMessage}</span>
              </div>
              <button onClick={() => setStatusMessage(null)} className="text-sm text-text-secondary hover:text-text-primary">
                Отклонить
              </button>
            </div>
          )}

          {error && (
            <div className="status-error rounded-lg p-4 flex items-center space-x-2">
              <Icon name="AlertCircle" size={18} />
              <span>{error}</span>
            </div>
          )}

          {loadingRequest ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 h-80 rounded-xl bg-secondary-100 animate-pulse" />
              <div className="h-80 rounded-xl bg-secondary-100 animate-pulse" />
            </div>
          ) : request ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-surface border border-border rounded-xl overflow-hidden">
                  <div className="aspect-video bg-secondary-100">
                    <AppImage
                      src={request.imageUrl || 'https://images.unsplash.com/photo-1556740749-887f6717d7e4?w=1200&auto=format&fit=crop'}
                      alt={request.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <h1 className="text-2xl font-bold text-text-primary">{request.title}</h1>
                      <p className="text-text-secondary mt-2 whitespace-pre-line">
                        {request.description || 'No description provided.'}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-text-secondary">
                        {request.category && (
                          <span className="px-3 py-1 bg-primary-50 text-primary rounded-full font-medium capitalize">
                            {request.category}
                          </span>
                        )}
                        {request.subcategory && (
                          <span className="px-3 py-1 bg-secondary-100 text-text-secondary rounded-full capitalize">
                            {request.subcategory}
                          </span>
                        )}
                        {formatLocation(request) && (
                          <span className="inline-flex items-center space-x-1">
                            <Icon name="MapPin" size={14} />
                            <span>{formatLocation(request)}</span>
                          </span>
                        )}
                        {request.deadlineAt && (
                          <span className="inline-flex items-center space-x-1">
                            <Icon name="Calendar" size={14} />
                            <span>Нужен до {new Date(request.deadlineAt).toLocaleDateString()}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-secondary-50 border border-secondary-100">
                        <p className="text-xs uppercase tracking-wide text-text-secondary">Бюджет</p>
                        <p className="text-xl font-semibold text-text-primary">
                          {formatCurrency(request.budgetAmount, request.currencyCode)}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-secondary-50 border border-secondary-100">
                        <p className="text-xs uppercase tracking-wide text-text-secondary">Статус</p>
                        <p className="text-sm font-medium text-text-primary capitalize">{request.status}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <aside className="space-y-6">
                <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-secondary-200">
                      <AppImage
                        src={request.buyerAvatarUrl || undefined}
                        alt={request.buyerName || 'Buyer'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">{request.buyerName || 'Buyer'}</p>
                      <p className="text-xs text-text-secondary">Создатель</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-text-secondary">
                    <div className="flex items-center space-x-2">
                      <Icon name="Calendar" size={16} />
                      <span>
                        Создано {new Date(request.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Icon name="Edit3" size={16} />
                      <span>
                        Обновлено {new Date(request.updatedAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {isOwner && (
                    <button
                      onClick={handleEditLot}
                      className="w-full btn-secondary px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center space-x-2"
                    >
                      <Icon name="Edit" size={16} />
                      <span>Редактировать лот</span>
                    </button>
                  )}

                  {!isOwner && user && (
                    <div className="space-y-2">
                      {userOffer && (
                        <div className="status-info rounded-lg p-3 text-sm">
                          Вы подали предложение на {formatCurrency(userOffer.priceAmount, userOffer.currencyCode)}.
                        </div>
                      )}
                      {canMakeOffer && (
                        <button
                          onClick={handleOpenCreateOffer}
                          className="w-full btn-primary px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center space-x-2"
                        >
                          <Icon name="Handshake" size={16} />
                          <span>Сделать предложение</span>
                        </button>
                      )}
                    </div>
                  )}

                  {!user && (
                    <button
                      onClick={() => navigate('/login-register', { state: { from: `/lot-details-offers?id=${request.id}` } })}
                      className="w-full btn-primary px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      Войдите, чтобы сделать предложение
                    </button>
                  )}
                </div>
              </aside>
            </div>
          ) : (
            <div className="bg-surface border border-border rounded-xl p-10 text-center">
              <Icon name="Archive" size={40} className="mx-auto text-secondary-300 mb-4" />
              <h2 className="text-xl font-semibold text-text-primary mb-2">Лот не найден</h2>
              <p className="text-text-secondary mb-4">
                Запрошенный лот мог быть удален или недоступен.
              </p>
              <button onClick={() => navigate('/browse-lots')} className="btn-primary px-4 py-2 rounded-lg">
                Обратно к поиску
              </button>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-text-primary">Предложения</h2>
              {!loadingOffers && (
                <span className="text-sm text-text-secondary">{offers.length} предложений</span>
              )}
            </div>

            {offersError && (
              <div className="status-error rounded-lg p-4 flex items-center space-x-2">
                <Icon name="AlertCircle" size={18} />
                <span>{offersError}</span>
              </div>
            )}

            <OffersList
              offers={offers}
              loading={loadingOffers}
              isOwner={isOwner}
              currentUserId={user?.id}
              onEditOffer={handleOpenEditOffer}
              onDeleteOffer={handleDeleteOffer}
              onAcceptOffer={handleAcceptOffer}
              onMessageSeller={handleOpenChat}
            />
          </div>
        </div>
      </div>

      <MakeOfferModal
        open={isOfferModalOpen}
        lot={request}
        initialValues={editingOffer}
        onClose={() => {
          setOfferModalOpen(false);
          setEditingOffer(null);
        }}
        onSubmit={handleSubmitOffer}
      />

      <ChatModal
        open={chatOpen}
        offer={chatOffer}
        loading={loadingChat}
        messages={chatMessages}
        sending={sendingChat}
        onSend={handleSendChatMessage}
        onClose={() => {
          setChatOpen(false);
          setChatOffer(null);
        }}
      />
    </div>
  );
};

export default LotDetailsOffers;
