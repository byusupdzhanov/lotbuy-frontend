import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from 'components/ui/Header';
import Icon from 'components/AppIcon';
import LotCard from './components/LotCard';
import { useAuth } from 'context/AuthContext';
import { listRequests } from 'lib/api/requests';
import { APIError } from 'lib/api/client';

const BrowseLots = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadRequests = useCallback(async () => {
    setError(null);
    setRefreshing(true);
    setLoading(true);
    try {
      const data = await listRequests();
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      const message = err instanceof APIError ? err.message : 'Failed to load lots.';
      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const filteredRequests = useMemo(() => {
    if (!searchQuery) return requests;
    const query = searchQuery.toLowerCase();
    return requests.filter((request) => {
      const title = request.title?.toLowerCase() ?? '';
      const description = request.description?.toLowerCase() ?? '';
      const buyer = request.buyerName?.toLowerCase() ?? '';
      return title.includes(query) || description.includes(query) || buyer.includes(query);
    });
  }, [requests, searchQuery]);

  const canMakeOffer = useCallback((request) => {
    if (!user?.id || request.buyerId == null) {
      return true;
    }
    return request.buyerId !== user.id;
  }, [user?.id]);

  const handleCreateLot = () => {
    navigate('/create-lot');
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    loadRequests();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-text-primary">Поиск лотов</h1>
              <p className="text-text-secondary mt-1">
                Просматривайте доступные лоты и делайте предложения покупателям
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={loadRequests}
                disabled={refreshing}
                className="inline-flex items-center space-x-2 px-4 py-2 border border-border rounded-lg text-sm hover:bg-secondary-50 disabled:opacity-60"
              >
                <Icon name={refreshing ? 'Loader2' : 'RefreshCw'} size={16} className={refreshing ? 'animate-spin' : ''} />
                <span>{refreshing ? 'Обновление' : 'Обновить'}</span>
              </button>
              {user && (
                <button
                  onClick={handleCreateLot}
                  className="btn-primary px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2"
                >
                  <Icon name="Plus" size={16} />
                  <span>Создать лот</span>
                </button>
              )}
            </div>
          </div>

          <form onSubmit={handleSearchSubmit} className="relative">
            <Icon
              name="Search"
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Можно искать по названию, описанию или имени покупателя"
              className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-surface focus:border-primary focus:ring-2 focus:ring-primary-100"
            />
          </form>

          {error && (
            <div className="status-error rounded-lg p-4 flex items-center space-x-3">
              <Icon name="AlertCircle" size={18} />
              <span>{error}</span>
            </div>
          )}

          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="h-72 bg-secondary-100 rounded-xl animate-pulse" />
              ))}
            </div>
          )}

          {!loading && filteredRequests.length === 0 && (
            <div className="bg-surface border border-border rounded-xl p-10 text-center">
              <Icon name="Compass" size={40} className="mx-auto text-secondary-300 mb-4" />
              <h2 className="text-xl font-semibold text-text-primary mb-2">Лотов не найдено</h2>
              <p className="text-text-secondary mb-4">
                Попробуйте изменить поисковый запрос или создайте свой собственный лот
              </p>
              {user && (
                <button onClick={handleCreateLot} className="btn-primary px-4 py-2 rounded-lg">
                  Создать свой лот
                </button>
              )}
            </div>
          )}

          {!loading && filteredRequests.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredRequests.map((request) => (
                <LotCard key={request.id} lot={request} canMakeOffer={canMakeOffer(request)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrowseLots;
