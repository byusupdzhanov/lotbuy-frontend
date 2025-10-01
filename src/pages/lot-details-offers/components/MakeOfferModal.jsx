import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import Icon from 'components/AppIcon';

const CURRENCIES = ['USD', 'RUB'];

const MakeOfferModal = ({ open, lot, initialValues, onClose, onSubmit }) => {
  const [price, setPrice] = useState(initialValues?.priceAmount || '');
  const [currency, setCurrency] = useState(initialValues?.currencyCode || lot?.currencyCode || 'USD');
  const [message, setMessage] = useState(initialValues?.message || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setPrice(initialValues?.priceAmount ?? '');
    setCurrency(initialValues?.currencyCode || lot?.currencyCode || 'USD');
    setMessage(initialValues?.message || '');
    setError(null);
    setSubmitting(false);
  }, [initialValues, lot]);

  const heading = useMemo(
    () => (initialValues ? 'Update your offer' : 'Submit an offer'),
    [initialValues]
  );

  if (!open) {
    return null;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    const priceValue = Number(price);
    if (!priceValue || priceValue <= 0) {
      setError('Enter a valid price greater than zero.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        priceAmount: priceValue,
        currencyCode: currency,
        message: message.trim() ? message.trim() : null,
      });
    } catch (err) {
      setError(err?.message || 'Failed to submit offer.');
    } finally {
      setSubmitting(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-1000 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-surface rounded-xl shadow-lg overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-2xl font-semibold text-text-primary">{heading}</h2>
            <p className="text-sm text-text-secondary mt-1">{lot?.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-text-secondary hover:text-text-primary hover:bg-secondary-100 rounded-lg"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">Offer amount *</label>
            <div className="flex items-center space-x-3">
              <input
                type="number"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                min={0}
                step="0.01"
                className="flex-1 input-field"
                placeholder="Enter your price"
                required
              />
              <select
                value={currency}
                onChange={(event) => setCurrency(event.target.value)}
                className="input-field w-28"
              >
                {CURRENCIES.map((code) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">Message to buyer</label>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={4}
              className="input-field"
              placeholder="Share any relevant details for the buyer"
            />
            <p className="text-xs text-text-secondary">
              Optional. Provide delivery timing, condition details, or other helpful information.
            </p>
          </div>

          {error && (
            <div className="status-error rounded-lg p-3 text-sm flex items-center space-x-2">
              <Icon name="AlertCircle" size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary px-5 py-2 rounded-lg text-sm font-medium flex items-center space-x-2"
            >
              {submitting ? (
                <>
                  <Icon name="Loader2" size={16} className="animate-spin" />
                  <span>Submitting</span>
                </>
              ) : (
                <>
                  <Icon name="Send" size={16} />
                  <span>{initialValues ? 'Update offer' : 'Submit offer'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default MakeOfferModal;
